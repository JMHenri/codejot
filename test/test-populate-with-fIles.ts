import { neo4j } from "../deps.ts";
import { normalizePath } from "../src/helpers/functional.ts";

const driver = neo4j.driver(
    Deno.env.get('NEO4J_URL') as string,
    neo4j.auth.basic(Deno.env.get('NEO4J_USER') as string, Deno.env.get('NEO4J_PASS') as string)
);
const session = driver.session();

async function processFile(filePath: string) {
    const content = await Deno.readTextFile(filePath);
    const filename = filePath.split('/').pop();

    // Create a new node for this file
    await session.run(
        `MERGE (f:File {filename: $filename, content: $content, path: $path}) RETURN f`,
        { filename, content, path: filePath }
    );
}

async function processDirectory(directoryPath: string) {
    for await (const dirEntry of Deno.readDir(directoryPath)) {
        const path = normalizePath(`${directoryPath}/${dirEntry.name}`);

        if (dirEntry.isFile) {
            await processFile(path);
        } else if (dirEntry.isDirectory) {
            await processDirectory(path);
        }
    }
}

async function run() {
    console.log(Deno.cwd())
    await processDirectory('./test/sample-project');

    await session.close();
    await driver.close();
}

run();
