// extension.js
const vscode = require('vscode');
const openai = require('openai');
const mathChatAgent = require('./mathChatAgent');

/**
 * @param {vscode.ExtensionContext} context
 */
async function getOpenAIApiKey(context) {
  let apiKey = context.globalState.get('openaiApiKey');
  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      prompt: 'Enter your OpenAI API Key for GPT-4',
      ignoreFocusOut: true,
      password: true
    });
    if (apiKey) {
      await context.globalState.update('openaiApiKey', apiKey);
    }
  }
  return apiKey;
}

async function askGpt4(apiKey, question) {
  const configuration = new openai.Configuration({ apiKey });
  const openaiClient = new openai.OpenAIApi(configuration);
  const prompt = `You are a Math operations assistant. Answer the user's math question, perform calculations, and explain your solution if needed. Question: ${question}`;
  const response = await openaiClient.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful math operations assistant. You can answer math questions, perform calculations, and explain your reasoning.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500
  });
  return response.data.choices[0].message.content;
}

function activate(context) {
  let mathChatDisposable = vscode.commands.registerCommand('mathChatAgent.chat', async function () {
    try {
      const op = await vscode.window.showInputBox({ prompt: 'Enter operation (add, subtract, multiply, divide):' });
      if (!op) {
        vscode.window.showInformationMessage('No operation provided.');
        return;
      }
      const aStr = await vscode.window.showInputBox({ prompt: 'Enter first number:' });
      if (!aStr) {
        vscode.window.showInformationMessage('No first number provided.');
        return;
      }
      const bStr = await vscode.window.showInputBox({ prompt: 'Enter second number:' });
      if (!bStr) {
        vscode.window.showInformationMessage('No second number provided.');
        return;
      }
      const a = parseFloat(aStr);
      const b = parseFloat(bStr);
      if (isNaN(a) || isNaN(b)) {
        vscode.window.showInformationMessage('Invalid number input.');
        return;
      }
      const mathMcp = require('./mathMcpBridge');
      let result;
      if (op === 'add') result = await mathMcp.add(a, b);
      else if (op === 'subtract') result = await mathMcp.subtract(a, b);
      else if (op === 'multiply') result = await mathMcp.multiply(a, b);
      else if (op === 'divide') result = await mathMcp.divide(a, b);
      else {
        vscode.window.showInformationMessage('Unknown operation.');
        return;
      }
      if (result && result.result !== undefined) {
        vscode.window.showInformationMessage('Result: ' + result.result);
      } else if (result && result.error) {
        vscode.window.showInformationMessage('Error: ' + result.error);
      } else {
        vscode.window.showInformationMessage('Could not compute the result.');
      }
    } catch (err) {
      vscode.window.showErrorMessage('Error: ' + err.message);
    }
  });
  context.subscriptions.push(mathChatDisposable);

  // Register chat provider for @-mention math operations
  if (vscode.chat && vscode.chat.registerChatProvider) {
    context.subscriptions.push(
      vscode.chat.registerChatProvider('mathChatAgent', {
        async provideReply(request, chatCtx, progress, token) {
          const match = request.message.match(/^@(add|subtract|multiply|divide)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i);
          if (match) {
            const op = match[1].toLowerCase();
            const a = parseFloat(match[2]);
            const b = parseFloat(match[3]);
            let result;
            const mathMcp = require('./mathMcpBridge');
            if (op === 'add') result = await mathMcp.add(a, b);
            else if (op === 'subtract') result = await mathMcp.subtract(a, b);
            else if (op === 'multiply') result = await mathMcp.multiply(a, b);
            else if (op === 'divide') result = await mathMcp.divide(a, b);
            if (result && result.result !== undefined) {
              return { text: `Result: ${result.result}` };
            } else if (result && result.error) {
              return { text: `Error: ${result.error}` };
            } else {
              return { text: 'Could not compute the result.' };
            }
          }
          // Fallback to GPT for other messages
          const apiKey = await getOpenAIApiKey(context);
          const gptResult = await mathChatAgent(context, request.message, async () => '');
          return { text: gptResult };
        },
        async provideWelcomeMessage() {
          return {
            text: "Welcome to the Math Chat Agent! Use @add, @subtract, @multiply, or @divide followed by two numbers (e.g., @add 2 3)."
          };
        },
        async provideSlashCommands() {
          return [
            { name: 'add', description: 'Add two numbers' },
            { name: 'subtract', description: 'Subtract two numbers' },
            { name: 'multiply', description: 'Multiply two numbers' },
            { name: 'divide', description: 'Divide two numbers' }
          ];
        }
      })
    );
  }
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}; 