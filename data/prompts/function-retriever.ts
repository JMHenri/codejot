export class FunctionRetriever {
  constructor(private stackTrace: string) {
  }

  get prompt() {
    return `You are the FileParser for an LLM chaining system.
You are tasked with parsing a javascript file.
All files and data in this prompt will be delimited by --begin <name>-- and --end <name>--
Return all top level code, and the function with the name {functionName}.

Return the top level variable the function is stored in, if it is stored in a variable. E.G, if
the function is stored in a class, return the class name.`;
  }
}