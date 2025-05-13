// extension.js
const vscode = require('vscode');
const openai = require('openai');
const mathChatAgent = require('./mathChatAgent');
const mathMcp = require('./mathMcpBridge');

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

  console.log('Math Chat Agent extension activated');

  const handler =  async (request, context, stream, token) => {
    
    console.log('Request received:', request);
    console.log('Context:', context);
    console.log('Stream:', stream);

    if (!request || !context){
      throw new Error('Invalid request or context');
    }
      console.log('before match');

      const match = request.prompt.match(/^(add|subtract|multiply|divide)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/i);

      console.log('after match');

      if (match){
        const op = match[1].toLowerCase();
        const a = parseFloat(match[2]);
        const b = parseFloat(match[3]);
        
      

      try {
        let result;
        
        if (op === 'add') result = await mathMcp.add(a, b);
        else if (op === 'subtract') result = await mathMcp.subtract(a, b);
        else if (op === 'multiply') result = await mathMcp.multiply(a, b);
        else if (op === 'divide') result = await mathMcp.divide(a, b);

        if (result && result.result !== undefined){
          // return {text: `Result: ${result.result}`};
          stream.markdown(`Result: ${result.result}`);
        } else if (result && result.error){
          // return {text: `Error: ${result.error}`};
          stream.markdown(`Error: ${result.error}`);
        } else {
          // return {text: 'Could not compute the result.'};
          stream.markdown('Could not compute the result.');
        }
       } catch (err){
          // return {text: `Error: ${err.message}`};
          stream.markdown(`Error: ${err.message}`);
        }
       return; 
      }   

  const gptResult = await mathChatAgent(context, request.prompt, async () => '');
  stream.markdown(gptResult);
};
  vscode.chat.createChatParticipant('my-agent.math', handler);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}; 