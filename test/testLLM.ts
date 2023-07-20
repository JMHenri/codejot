import "https://deno.land/x/dotenv/load.ts";


import * as prompts from '../data/prompts/index.ts';
import { openAI } from '../deps.ts';
import * as llmHelper from '../src/llm/helper.ts'
import { neo4j, log } from "../deps.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { ProjectFile } from '../types/types.ts'
import { normalizePath } from "../src/helpers/functional.ts";

async function setupLogger() {
    await log.setup({
        handlers: {
            console: new log.handlers.ConsoleHandler("DEBUG"),
        },
        loggers: {
            default: {
                level: "DEBUG",
                handlers: ["console"],
            },
        },
    });
}

// Initialize logger
await setupLogger();


const stackTrace = `TypeError: Cannot read properties of undefined (reading 'blah')
at c (/Users/jacob/Projects/jscodegraph/test/sample-project/file1.js:14:47)
at a (/Users/jacob/Projects/jscodegraph/test/sample-project/file1.js:2:3)
at blah (/Users/jacob/Projects/jscodegraph/test/sample-project/file2.js:4:3)
at Object.<anonymous> (/Users/jacob/Projects/jscodegraph/test/sample-project/file2.js:7:1)
at Module._compile (node:internal/modules/cjs/loader:1254:14)
at Module._extensions..js (node:internal/modules/cjs/loader:1308:10)
at Module.load (node:internal/modules/cjs/loader:1117:32)
at Module._load (node:internal/modules/cjs/loader:958:12)
at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:81:12)
at node:internal/main/run_main_module:23:47

Node.js v18.14.2`;


const jiraData = `Please fix this up asap:
${stackTrace}`;

const driver = neo4j.driver(
    Deno.env.get('NEO4J_URL') as string,
    neo4j.auth.basic(Deno.env.get('NEO4J_USER') as string, Deno.env.get('NEO4J_PASS') as string)
);
const session = driver.session();


async function run() {
  const rootFile = await getRootFileFromStackTrace(jiraData);
  const solveResponse = await getSolveResponse(jiraData, [rootFile]);
  console.log(solveResponse);
}

//takes in a stacktrace and returns the root file.
async function getRootFileFromStackTrace(jiraData: string) {
    // Make a prompt
    const rootFileFinder = new prompts.RootFileFinder(stackTrace);
    const prompt = rootFileFinder.prompt;

    // Query llm
    const rootFileMessage = await llmHelper.getRootFile(prompt);
    const rootFile = JSON.parse(rootFileMessage?.function_call?.arguments as string).pathToFile;
    log.info(`Root file from LLM: ${JSON.stringify(rootFile)}`);

    // Query db
    const rootFileFromDB = await queryDBForFile(rootFile);
    log.info(`Root file from DB: ${JSON.stringify(rootFileFromDB)}`);

    return rootFileFromDB;  // Or return the one you want
}

async function queryDBForFile(pathToFile: string) {
  const result = await session.run(
      'MATCH (f:File { path: $path }) RETURN f',
      { path: pathToFile }
  );
  
  const singleRecord = result.records[0];
  const fileNode = singleRecord.get(0);
  
  // Close session after executing the query
  //await session.close();
  
  // Assuming fileNode has properties filename, content and path. Adjust if needed.
  if (fileNode) {
      return {
          filename: fileNode.properties.filename,
          content: fileNode.properties.content,
          pathFromProjDir: fileNode.properties.path
      };
  } else {
      throw new Error(`No file found with path: ${pathToFile}`);
  }
}

async function getSolveResponse(jiraData: string, fileList: ProjectFile[]) {
  let response;
  for(let i = 0; i < 3; i++) {
    response = await llmHelper.getSolveResponse(jiraData, fileList);
    const parsedResponse = JSON.parse(response?.function_call?.arguments as string);
    if(parsedResponse.needMoreFiles) {
      const file = await queryDBForFile(normalizePath(parsedResponse.retrieve[0]));
      console.log('requesting file: ' + file.pathFromProjDir);
      fileList.push(file);
    } else {
      break;
    }
  }
  let finalResponse = JSON.parse(response?.function_call?.arguments as string);
  console.log(finalResponse);
}

async function sendMasterPrompt() {
  //sends out master prompt & awaits response.
}

async function templateImportResolverPrompt() {
  //templates ImportResolver prompt.
}

async function queryImportResolver() {
  //queries ImportResolver for names and paths
}

async function templateFileParserPrompt() {
  //templates FileParser prompt.
}

async function queryFileParser() {
  //queries FileParser for functions.
}

async function amendFileParserResults() {
  //amends FileParser results to Master prompt.
}

async function sendFinalMasterPrompt() {
  //sends out Master prompt & awaits response.
}

async function sendResponse() {
  //sends response to jira or mock.
}

/*
1. get data from jira or mock
2. ask llm for root file.
3. query db for root file. (and function?)
4. query llm for root function in file. (depends on 3)
5. template master prompt.
6. send out master prompt & await response.
7. if response needs more info,
- template ImportResolver prompt.
- query ImportResolver for names and paths
- query db for file based on path.
- template FileParser prompt.
- query FileParser for functions.
- amend FileParser results to Master prompt.
- if amend would go over 7k tokens or if it is 3rd time using FileParser, then use FinalMaster.
- send out Master prompt & await response.
8. if response needs no more info,
- send response to jira or mock.

- If master continues to ask for more information, we will eventually end with only FinalMasterPrompt.
- else we return results of MasterPrompt.
*/


run();