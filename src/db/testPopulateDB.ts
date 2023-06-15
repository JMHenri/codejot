const fs = require('fs');
const path = require('path');
const esprima = require('esprima');
const estraverse = require('estraverse');
const neo4j = require('neo4j-driver');


const driver = neo4j.driver(
    'neo4j+s://56a9a842.databases.neo4j.io',
    neo4j.auth.basic(NEO4JUSER, NEO4JPASS)
);
const session = driver.session();

async function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const ast = esprima.parseScript(content);

    let functionNames = [];

    estraverse.traverse(ast, {
        enter: function (node) {
            if (node.type === 'FunctionDeclaration') {
                functionNames.push(node.id.name);
            }
        }
    });

    for (let functionName of functionNames) {
        await session.run(
            `MERGE (f:Function {name: $name}) RETURN f`,
            { name: functionName }
        );
    }

    let calls = [];
    estraverse.traverse(ast, {
        enter: function (node) {
            if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
                const functionName = node.callee.name;
                if (functionNames.includes(functionName)) {
                    calls.push(functionName);
                }
            }
        }
    });

    for (let functionName of calls) {
        for (let caller of functionNames) {
            if (caller !== functionName) {
                await session.run(
                    `MATCH (a:Function),(b:Function)
                    WHERE a.name = $caller AND b.name = $callee
                    MERGE (a)-[r:CALLS]->(b) RETURN r`,
                    { caller: caller, callee: functionName }
                );
            }
        }
    }
}


async function run() {
  await processFile('./testdir/file1.js');

  await session.close();
  await driver.close();
}

run();