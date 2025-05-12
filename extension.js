// extension.js
const vscode = require('vscode');
const copilotAgent = require('./copilotAgent');
const openai = require('openai');

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

async function askGpt4(apiKey, deps) {
  const configuration = new openai.Configuration({ apiKey });
  const openaiClient = new openai.OpenAIApi(configuration);
  const prompt = `You are a Java migration assistant. Given the following Maven dependencies and Java version, provide migration advice and highlight any potential issues or modernization opportunities.\n\n${JSON.stringify(deps, null, 2)}`;
  const response = await openaiClient.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful Java migration assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500
  });
  return response.data.choices[0].message.content;
}

function activate(context) {
  let disposable = vscode.commands.registerCommand('copilotAgent.analyzeWithGpt4', async function () {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage('No workspace folder open.');
      return;
    }
    const workspaceDir = workspaceFolders[0].uri.fsPath;
    const outputChannel = vscode.window.createOutputChannel('Java Migration Agent');
    outputChannel.show();
    outputChannel.appendLine('Analyzing pom.xml files...');
    const pomFiles = copilotAgent.findPomFiles(workspaceDir);
    if (pomFiles.length === 0) {
      outputChannel.appendLine('No pom.xml files found in workspace.');
      return;
    }
    const apiKey = await getOpenAIApiKey(context);
    if (!apiKey) {
      outputChannel.appendLine('OpenAI API key not provided.');
      return;
    }
    for (const pomPath of pomFiles) {
      outputChannel.appendLine(`\nAnalyzing: ${pomPath}`);
      const deps = await copilotAgent.analyzePom(pomPath);
      outputChannel.appendLine('Dependencies: ' + JSON.stringify(deps, null, 2));
      try {
        outputChannel.appendLine('Querying GPT-4 for migration advice...');
        const gpt4Response = await askGpt4(apiKey, deps);
        outputChannel.appendLine('GPT-4 analysis: ' + gpt4Response);
      } catch (err) {
        outputChannel.appendLine('Error querying GPT-4: ' + err.message);
      }
    }
  });
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
}; 