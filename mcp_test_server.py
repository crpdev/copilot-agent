from mcp.server.fastmcp import FastMCP
import sys

mcp = FastMCP("TestMath")

@mcp.tool(name="add", description="Add two numbers")
def add(a: float, b: float) -> dict:
    print(f"[TestMath MCP] add({a}, {b})", file=sys.stderr, flush=True)
    return {"result": a + b}

if __name__ == "__main__":
    print("[TestMath MCP] Running test MCP server (stdio)...", file=sys.stderr, flush=True)
    mcp.run(transport="stdio")