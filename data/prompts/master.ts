import { ProjectFile } from '../../types/types.ts'

export class Master {   
  constructor(private jiraData: string, private files: ProjectFile[]) {
  }

  get prompt() {
    const filesString = this.files.map(file => `-- ${file.pathFromProjDir} --\n${file.content}`).join('\n\n');

    return `
Identify and resolve software bugs using a stack trace from a JIRA ticket along with code snippets.
Your response should use the following TypeScript interface:

\`\`\`typescript
interface FileReq {
  rootFile: string;
  pathToFile: string; // path from the root file
}

interface MasterResponse {
    needMoreFiles: boolean;
    retrieve: FileReq[]; // Array of paths to files from ProjDir, e.g., ['main.ts', 'src/blah/mathHelper.js']
    finalResponse: string;
}
\`\`\`

Interpret the following stack trace, code, and JIRA information. Find the bug, and suggest an appropriate solution.
If the bug cannot be identified, set 'needMoreFiles' to true and include the names of the files you need in the 'retrieve' array.
If you know the cause of the problem, or if asking for more files would not help, then suggest a fix.
If asking for more files would help, add files to the retrieve array.

If you want to respond to the developers, set "needMoreFiles" to false", and include your response in the "finalResponse" field.
A final response will be sent to human programmers to help them resolve the issue and make their day easier (thank you).


--JIRA DATA--
${this.jiraData}


--CODE FILES--
${filesString}

--JIRA TICKET--
This should be a straightforward fix @Jacob Henri. There's a typeerror somewhere in here.

`
;
  }
}