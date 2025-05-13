import subprocess
import json
import sys
import os

def send_request(proc, method, params, req_id):
    request = {
        "jsonrpc": "2.0",
        "id": req_id,
        "method": method,
        "params": params
    }
    msg = json.dumps(request)
    print(f"Sending: {msg}")
    proc.stdin.write((msg + "\n").encode())
    proc.stdin.flush()
    # Read one line of response
    response = proc.stdout.readline().decode().strip()
    print(f"Received: {response}")
    return response

if __name__ == "__main__":
    # Adjust the path if needed
    mcp_server_path = os.path.join(os.path.dirname(__file__), "math_mcp_server.py")
    proc = subprocess.Popen(
        [sys.executable, mcp_server_path],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=1
    )

    try:
        # Test all operations
        send_request(proc, "add", {"a": 10, "b": 5}, 1)
        send_request(proc, "subtract", {"a": 10, "b": 5}, 2)
        send_request(proc, "multiply", {"a": 10, "b": 5}, 3)
        send_request(proc, "divide", {"a": 10, "b": 5}, 4)
        send_request(proc, "divide", {"a": 10, "b": 0}, 5)  # Division by zero test
    finally:
        proc.terminate()
        proc.wait()
        stderr_output = proc.stderr.read().decode(errors='ignore')
        if stderr_output:
            print(f"STDERR: {stderr_output}")
