# Copilot Math Chat Extension

This project provides a VS Code extension that enables a math chat agent, powered by OpenAI GPT and a custom Python MCP server for math operations. The agent can answer free-form math questions using GPT or perform direct math operations (add, subtract, multiply, divide) using a Python backend.

## Components

- **math_mcp_server.py**: Python MCP server exposing math operations (`add`, `subtract`, `multiply`, `divide`) via stdio.
- **mathMcpBridge.js**: Node.js bridge that starts the Python MCP server and communicates with it using JSON-RPC over stdio.
- **mathChatAgent.js**: Chat agent that parses user input, calls the MCP server for direct math operations, and uses GPT for general math questions.
- **extension.js**: VS Code extension entry point. Registers the `mathChatAgent.chat` command for interactive math chat.

## Prerequisites

- **Python 3.x** installed and available in your PATH.
- **Node.js** (v16+ recommended) and **npm**.
- **OpenAI API Key** (for GPT-powered answers).
- The `mcp` Python package (and its dependencies) must be installed and importable by Python.

## Setup

1. **Install Node.js dependencies:**
   ```sh
   npm install
   ```

2. **Install Python dependencies:**
   Ensure you have the `mcp` package and any dependencies required by `math_mcp_server.py`.
   ```sh
   pip install mcp-server  # or the correct package for FastMCP
   ```

3. **Open the project in VS Code.**

## Usage

1. **Start the extension in VS Code:**
   - Press `F5` to launch the extension in a new Extension Development Host window.

2. **Run the Math Chat Agent:**
   - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
   - Type and select `Math Chat Agent: Chat` (or `mathChatAgent.chat`).
   - Enter a math question (e.g., `What is the square root of 16?`) or a direct operation (e.g., `add 2 3`).
   - For direct operations, the agent will use the Python MCP server. For general questions, it will use GPT.
   - If you type `math operation`, the agent will prompt you for the operation and numbers interactively.

3. **OpenAI API Key:**
   - On first use, you will be prompted to enter your OpenAI API key. This is required for GPT-powered answers.

## Example Interactions

- `add 5 7` → Result: 12
- `divide 10 2` → Result: 5
- `What is 12 times 8?` → Answered by GPT
- `math operation` → Prompts for operation and numbers

## Troubleshooting

- Ensure Python is installed and accessible from your system PATH.
- Ensure the `mcp` package is installed and compatible with your Python version.
- If the math MCP server fails to start, check the output in the VS Code Output panel for errors.
- If you encounter issues with the OpenAI API, verify your API key and network connectivity.

## Extending

- To add more math operations, update `math_mcp_server.py` and add corresponding methods in `mathMcpBridge.js`.
- You can further enhance the chat agent logic in `mathChatAgent.js`.

---

For questions or contributions, please open an issue or pull request. 
