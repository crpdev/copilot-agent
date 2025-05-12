// mcpServer.js
// Simple Maven MCP server logic for analyzing pom.xml files

const fs = require('fs');
const xml2js = require('xml2js');

async function analyzePom(pomPath) {
  const xml = fs.readFileSync(pomPath, 'utf-8');
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);
  const dependencies = [];
  try {
    const deps = result.project.dependencies[0].dependency;
    for (const dep of deps) {
      const groupId = dep.groupId ? dep.groupId[0] : '';
      const artifactId = dep.artifactId ? dep.artifactId[0] : '';
      const version = dep.version ? dep.version[0] : '';
      dependencies.push({ groupId, artifactId, version });
    }
  } catch (e) {
    // No dependencies found
  }
  // Identify Java version
  let javaVersion = null;
  try {
    const props = result.project.properties[0];
    javaVersion = props['maven.compiler.source'] ? props['maven.compiler.source'][0] : null;
  } catch (e) {}
  // Identify Spring dependencies
  const springDeps = dependencies.filter(dep => dep.groupId && dep.groupId.startsWith('org.springframework'));
  return {
    javaVersion,
    springDependencies: springDeps,
    allDependencies: dependencies
  };
}

module.exports = {
  analyzePom
}; 