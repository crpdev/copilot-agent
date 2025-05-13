const { spawn } = require('child_process');
const path = require('path');

class MathMCPBridge {
  constructor(pythonPath = 'python', scriptPath = path.join(__dirname, 'math_mcp_server.py')) {
    this.pythonPath = pythonPath;
    this.scriptPath = scriptPath;
    this.proc = null;
    this.requestId = 1;
    this.pending = new Map();
    this.buffer = '';
    console.log(`[MathMCPBridge] Initialized with scriptPath: ${this.scriptPath}`);
  }

  start() {
    if (this.proc) return;
    console.log('[MathMCPBridge] Starting Python MCP server...');
    this.proc = spawn(this.pythonPath, [this.scriptPath], {
      stdio: ['pipe', 'pipe', 'inherit'],
      cwd: path.dirname(this.scriptPath)
    });

    this.proc.stdout.on('data', (data) => {
      this.buffer += data.toString();
      let idx;
      while ((idx = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, idx).trim();
        this.buffer = this.buffer.slice(idx + 1);
        if (line) {
          try {
            const msg = JSON.parse(line);
            console.log('[MathMCPBridge] Received response:', msg);
            if (msg.id && this.pending.has(msg.id)) {
              this.pending.get(msg.id)(msg.result || msg.error);
              this.pending.delete(msg.id);
            }
          } catch (e) {
            console.error('[MathMCPBridge] Failed to parse response:', line, e);
          }
        }
      }
    });

    this.proc.on('exit', (code) => {
      console.log(`[MathMCPBridge] MCP server exited with code ${code}`);
      this.proc = null;
      this.pending.forEach((cb) => cb({ error: 'MCP server exited' }));
      this.pending.clear();
    });
  }

  stop() {
    if (this.proc) {
      console.log('[MathMCPBridge] Stopping MCP server...');
      this.proc.kill();
      this.proc = null;
    }
  }

  call(method, params) {
    return new Promise((resolve, reject) => {
      if (!this.proc) this.start();
      const id = this.requestId++;
      let rpcParams = params;
      if (params && typeof params === 'object' && 'a' in params && 'b' in params) {
        rpcParams = [params.a, params.b];
      }
      const payload = JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        params: rpcParams
      }) + '\n';
      console.log(`[MathMCPBridge] Sending request: ${payload.trim()}`);
      this.pending.set(id, resolve);
      this.proc.stdin.write(payload);
    });
  }

  add(a, b) {
    console.log(`[MathMCPBridge] add(${a}, ${b})`);
    return this.call('add', { a, b });
  }
  subtract(a, b) {
    console.log(`[MathMCPBridge] subtract(${a}, ${b})`);
    return this.call('subtract', { a, b });
  }
  multiply(a, b) {
    console.log(`[MathMCPBridge] multiply(${a}, ${b})`);
    return this.call('multiply', { a, b });
  }
  divide(a, b) {
    console.log(`[MathMCPBridge] divide(${a}, ${b})`);
    return this.call('divide', { a, b });
  }
}

module.exports = new MathMCPBridge(); 