export class RootFileFinder {
  constructor(private stackTrace: string) {
  }

  get prompt() {
    return `
Invoke the specified function, providing the correct arguments.
The function needs a file's relative path as an argument, beginning from the project folder. When you return the file path, do not include the root path to the project's folder.
If the stack trace were to indicate an error in "/www/src/llm/helper.ts", you would provide "llm/helper.ts as an argument" if the root path to project were /www/src.
The arguments are:
Root path to project: /Users/jacob/Projects/jscodegraph/.
Stack Trace:
${this.stackTrace}
`;
  }
}
