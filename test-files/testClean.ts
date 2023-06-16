import { neo4j } from "../deps.ts";



const driver = neo4j.driver(
    Deno.env.get('NEO4J_URL') as string,
    neo4j.auth.basic(Deno.env.get('NEO4J_USER') as string, Deno.env.get('NEO4J_PASS') as string)
);

const session = driver.session();

async function clearGraph() {
    // This query matches all nodes and relationships and deletes them
    await session.run(
        `MATCH (n)
         DETACH DELETE n`
    );
}

async function run() {
    await clearGraph();

    // Close Neo4j session and driver
    await session.close();
    await driver.close();
}

run();
