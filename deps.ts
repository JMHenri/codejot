// deps.ts
// Oak for the middleware framework
export { Application, Router } from "https://deno.land/x/oak@v12.2.0/mod.ts";

// Neo4j NPM driver for working with Neo4j in Deno
export { default as neo4j } from "npm:neo4j-driver";

// Types for the Neo4j driver (optional, but recommended for better typing)
export type { Driver, Session } from "npm:neo4j-driver";

// Pinecone Client from NPM
export { PineconeClient } from "npm:@pinecone-database/pinecone";

// Dotenv module for environment configuration
export { config } from "https://deno.land/x/dotenv/mod.ts";

// Esprima for JS parsing
export * as esprima from 'npm:esprima';

// Estraverse for AST traversal
export * as estraverse from 'npm:estraverse';
