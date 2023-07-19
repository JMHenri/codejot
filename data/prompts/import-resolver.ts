export class ImportResolver {
    constructor(private stackTrace: string) {
    }
  
    get prompt() {
      return `You are a file reader for a large LLM system.
The LLM system is run by a master prompt which asks for access to more functions to resolve coding bugs.
Whenever it asks for access to a function, it is your job to read the file that the function is stored in, and figure out where the function is, and what it is called in the file (if it is renamed).

For example. Suppose the code says
import {Manager as mongoMan} from } from "../myMongoManager.js";
you need to ask for "Manager", not "mongoMan".
because the file parser will be reading "../myMongoManager.js", and needs to have access to the name "connect".

Your output would be:
{
    "file": "../myMongoManager.js",
    "var": "Manager"
}

Your output should be the path to the file, and the name of the variable the function is stored in.

Your response will be given to the FileParser, who will read what you've written and try to find the "Manager" function or class inside of that file - "../myMongoManager.js".

1. What file path mongoMan is in.
2. What name mongoInstance is stored in.`;
    }
}