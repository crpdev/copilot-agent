from mcp.server.fastmcp import FastMCP
import sys

mcp = FastMCP("MathOp")

print("[MathOp MCP] Server starting...", file=sys.stderr, flush=True)

@mcp.tool(name="add", description="Add two numbers")
def add(a: float, b: float) -> dict:
    print(f"[MathOp MCP] add({a}, {b})", file=sys.stderr, flush=True)
    return {"result": a + b}

@mcp.tool(name="subtract", description="Subtract two numbers")
def subtract(a: float, b: float) -> dict:
    print(f"[MathOp MCP] subtract({a}, {b})", file=sys.stderr, flush=True)
    return {"result": a - b}

@mcp.tool(name="multiply", description="Multiply two numbers")
def multiply(a: float, b: float) -> dict:
    print(f"[MathOp MCP] multiply({a}, {b})", file=sys.stderr, flush=True)
    return {"result": a * b}

@mcp.tool(name="divide", description="Divide two numbers")
def divide(a: float, b: float) -> dict:
    print(f"[MathOp MCP] divide({a}, {b})", file=sys.stderr, flush=True)
    if b == 0:
        print("[MathOp MCP] Error: Division by zero", file=sys.stderr, flush=True)
        return {"error": "Division by zero"}
    return {"result": a / b}

if __name__ == "__main__":
    try:
        print("[MathOp MCP] Running MCP server (stdio)...", file=sys.stderr, flush=True)
        mcp.run(transport="stdio")
    except Exception as e:
        print(f"[MathOp MCP] Server error: {e}", file=sys.stderr, flush=True)
        raise 