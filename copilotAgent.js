// copilotAgent.js
// GitHub Copilot Agent for Java Migration Assistant using VS Code's GPT-4
// Exposes an 'analyze' operation that uses a Maven MCP server to analyze pom.xml files

const path = require('path');
const fs = require('fs');
const mcpServer = require('./mcpServer');

const copilotAgent = {
  async analyze(workspaceDir = process.cwd()) {
    const pomFiles = findPomFiles(workspaceDir);
    if (pomFiles.length === 0) {
      console.log('No pom.xml files found in workspace.');
      return;
    }
    for (const pomPath of pomFiles) {
      console.log(`\nAnalyzing: ${pomPath}`);
      const deps = await mcpServer.analyzePom(pomPath);
      console.log('Dependencies:', deps);
    }
  },
  findPomFiles,
  analyzePom: mcpServer.analyzePom
};

function findPomFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findPomFiles(filePath));
    } else if (file === 'pom.xml') {
      results.push(filePath);
    }
  }
  return results;
}

module.exports = copilotAgent; 