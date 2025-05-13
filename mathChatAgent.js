const openai = require('openai');
const mathMcp = require('./mathMcpBridge');

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

async function askGpt(apiKey, prompt) {
  const configuration = new openai.Configuration({ apiKey });
  const openaiClient = new openai.OpenAIApi(configuration);
  const response = await openaiClient.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful math assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 200
  });
  return response.data.choices[0].message.content;
}

async function mathChatAgent(context, chatPrompt, showInputBox) {
  // Check if the prompt is a math operation
  const opMatch = chatPrompt.match(/(add|subtract|multiply|divide)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i);
  if (opMatch) {
    const op = opMatch[1].toLowerCase();
    const a = parseFloat(opMatch[2]);
    const b = parseFloat(opMatch[3]);
    let result;
    if (op === 'add') result = await mathMcp.add(a, b);
    else if (op === 'subtract') result = await mathMcp.subtract(a, b);
    else if (op === 'multiply') result = await mathMcp.multiply(a, b);
    else if (op === 'divide') result = await mathMcp.divide(a, b);
    if (result && result.result !== undefined) {
      return `Result: ${result.result}`;
    } else if (result && result.error) {
      return `Error: ${result.error}`;
    } else {
      return 'Could not compute the result.';
    }
  }

  // If not a direct operation, prompt user for operation and numbers
  if (/math operation/i.test(chatPrompt)) {
    const op = await showInputBox({ prompt: 'Enter operation (add, subtract, multiply, divide):' });
    const a = parseFloat(await showInputBox({ prompt: 'Enter first number:' }));
    const b = parseFloat(await showInputBox({ prompt: 'Enter second number:' }));
    let result;
    if (op === 'add') result = await mathMcp.add(a, b);
    else if (op === 'subtract') result = await mathMcp.subtract(a, b);
    else if (op === 'multiply') result = await mathMcp.multiply(a, b);
    else if (op === 'divide') result = await mathMcp.divide(a, b);
    if (result && result.result !== undefined) {
      return `Result: ${result.result}`;
    } else if (result && result.error) {
      return `Error: ${result.error}`;
    } else {
      return 'Could not compute the result.';
    }
  }

  // Otherwise, use GPT for free-form math questions
  const apiKey = await getOpenAIApiKey(context);
  if (!apiKey) return 'OpenAI API key not provided.';
  return await askGpt(apiKey, chatPrompt);
}

module.exports = mathChatAgent; 