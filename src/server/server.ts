import { handle } from "./handler.ts";

const server = Deno.listen({ port: 4142 });

const listen = async (): Promise<void> => {
  for await (const conn of server) {
    handle(conn);
  }
};

listen()
  .then(() => console.log("💤 Listener Closed"))
  .catch((err) => console.error("💥 Unhandled Error", err));

console.log(`🚀 Server Started listening ${JSON.stringify(server.addr)}`);
