// mod.ts
import { Application } from "./deps.ts";
import router from "./src/routes/routes.ts";

console.log(Deno.env.get('NEO4J_USER'));

// const app = new Application();

// app.use(router.routes());
// app.use(router.allowedMethods());

// app.listen({ port: 8000 });

// console.log("Server is running on http://localhost:8000");