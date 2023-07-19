import { neo4j } from "../deps.ts";
import { esprima } from "../deps.ts";
import { estraverse } from "../deps.ts";

const driver = neo4j.driver(
    Deno.env.get('NEO4J_URL') as string,
    neo4j.auth.basic(Deno.env.get('NEO4J_USER') as string, Deno.env.get('NEO4J_PASS') as string)
);
const session = driver.session();


async function processFile(filePath: string) {
    const content = await Deno.readTextFile(filePath);
    const ast = esprima.parseScript(content);

    const functionNames : string[]= [];
    const calls: Array<{caller: string, callee: string}> = [];
    let currentFunction: string | null = null;

    estraverse.traverse(ast, {
        enter: function (node : any) {
            if (node.type === 'FunctionDeclaration') {
                const functionName = node.id.name;
                functionNames.push(functionName);
                currentFunction = functionName;
            } else if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
                const functionName = node.callee.name;
                if (currentFunction) {
                    calls.push({caller: currentFunction, callee: functionName});
                }
            }
        },
        leave: function (node : any) {
            if (node.type === 'FunctionDeclaration') {
                currentFunction = null;
            }
        }
    });

    for (let functionName of functionNames) {
        await session.run(
            `MERGE (f:Function {name: $name}) RETURN f`,
            { name: functionName }
        );
    }

    for (let call of calls) {
        if (functionNames.includes(call.caller) && functionNames.includes(call.callee)) {
            await session.run(
                `MATCH (a:Function),(b:Function)
                WHERE a.name = $caller AND b.name = $callee
                MERGE (a)-[r:CALLS]->(b) RETURN r`,
                { caller: call.caller, callee: call.callee }
            );
        }
    }
}
async function run() {
  await processFile('data/sample-project/file1.js');

  await session.close();
  await driver.close();
}

run();
