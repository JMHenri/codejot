// routes.ts
import { Router } from "../../deps.ts";
import { neo4j, log } from "../../deps.ts";



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


interface File {
  name: string;
  path: string;
  type: string;
  content?: string;
}

const router = new Router();

router.get("/traverse/:user/:repo/:path?", async (context) => {
  const { user, repo, path } = context.params as { 
    user: string; 
    repo: string; 
    path?: string 
  };
  log.info(`traverse ${user}/${repo}/${path || ""}`)

  if (!user || !repo) {
    context.response.status = 400;
    context.response.body = { error: "User or repository name is missing" };
    return;
  }

  let url = Deno.env.get('NEO4J_URL') as string;
  log.info(`Connecting to ${url}`)
  try {
    const driver = neo4j.driver(
      Deno.env.get('NEO4J_URL') as string,
      neo4j.auth.basic(Deno.env.get('NEO4J_USER') as string, Deno.env.get('NEO4J_PASS') as string)
    );
    log.info(`Connected to Neo4j`);
    log.info(`Env vars: ${Deno.env.get('NEO4J_URL')}, ${Deno.env.get('NEO4J_USER')}, ${Deno.env.get('NEO4J_PASS')}`)
    const session = driver.session();

    await fetchNestedFiles(user, repo, path || "", session);

    context.response.status = 200;
    context.response.body = { message: "Files uploaded to Neo4j graph" };

    await session.close();
    await driver.close();
  } catch (error) {
    context.response.status = 500;
    context.response.body = { error: error.message };
  }
});

async function fetchNestedFiles(user: string, repo: string, path: string, session: any): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${user}/${repo}/contents/${path}`,
    {
      headers: {
        // Uncomment the line below and insert your personal token for higher rate limit
        // "Authorization": `token YOUR_GITHUB_PERSONAL_TOKEN`
      },
    }
  );

  const data = await response.json();

  for (const file of data) {
    if (file.type === "dir") {
      await fetchNestedFiles(user, repo, file.path, session);
    } else {
      let content: string | undefined;
      if (file.size < 1000000 && isTextFile(file.name)) {
        const contentResponse = await fetch(file.download_url);
        content = await contentResponse.text();
      }

      if (content) {
        // Create a new node for this file
        await session.run(
          `MERGE (f:File {filename: $filename, content: $content, path: $path}) RETURN f`,
          { filename: file.name, content, path: file.path }
        );
      }
    }
  }
}

function isTextFile(fileName: string): boolean {
  const textFileExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.html', '.css'];
  return textFileExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

export default router;
