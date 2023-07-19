import { openAI } from '../../deps.ts';
import * as prompts from '../../data/prompts/index.ts'
import { ProjectFile } from '../../types/types.ts'
import "https://deno.land/x/dotenv/load.ts";

const { Configuration, OpenAIApi } = openAI;

const configuration = new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});
const openai = new OpenAIApi(configuration);

async function getCompletion() {
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-4-0613",
    messages: [{role: "user", content: "Hello world"}],
  });

  return chatCompletion.data.choices[0].message;
}

async function getRootFile(stackTrace: string) {
  const rootFileFinder = new prompts.RootFileFinder(stackTrace);
  const prompt = rootFileFinder.prompt;

  const messages: openAI.ChatCompletionRequestMessage[] = [{role: "user", content: prompt}]
  const functions = [
    {
      name: "queryDBForFile",
      description: "Function to return file name in structured format",
      parameters: {
        type: "object",
        properties: {
          pathToFile: {
            type: "string",
            description: "The file name starting from the project path, e.g, users/src/llm/helpter.ts would be src/llm/helper.ts, exclude the root path",
          },
        },
        required: ["pathToFile"],
      },
    }
  ];

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: messages,
    functions: functions,
    function_call: {name: "queryDBForFile"},
    temperature: 0.0,
  });

  return chatCompletion.data.choices[0].message;
}

export async function getSolveResponse(jiraData : string, projFiles : ProjectFile[]) {
  const rootFileFinder = new prompts.Master(jiraData, projFiles);
  const prompt = rootFileFinder.prompt;

  const messages: openAI.ChatCompletionRequestMessage[] = [{role: "user", content: prompt}]
  const functions = [
    {
      name: "processMasterPromptResponse",
      description: "Either grabs files from the master prompt response, or returns helpful information to the user.",
      parameters: {
        type: "object",
        properties: {
          needMoreFiles: {
            type: "boolean",
            description: "If true, gets more files. If false, returns helpful information to the user.",
          },
          retrieve: {
            type: "array",
            description: "The file name starting from the project path, e.g, users/src/llm/helpter.ts would be src/llm/helper.ts, exclude the root path",
            items: {
              type: "string",
            }
          },
          finalResponse: {
            type: "string",
            description: "A helpful response for the user.",
          }
        },
        required: ["needMoreFiles", "retrieve"],
      },
    }
  ];

  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-4-0613",
    messages: messages,
    functions: functions,
    function_call: {name: "processMasterPromptResponse"},
    temperature: 0.0,
  });

  return chatCompletion.data.choices[0].message;

}



export { openai, getCompletion, getRootFile };
