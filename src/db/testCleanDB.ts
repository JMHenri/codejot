const neo4j = require('neo4j-driver');


const driver = neo4j.driver(
  'neo4j+s://56a9a842.databases.neo4j.io',
  neo4j.auth.basic(NEO4JUSER, NEO4JPASS)
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
