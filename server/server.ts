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

const formatAddr = (addr: Deno.Addr) => {
  if (addr.transport === "tcp" || addr.transport === "udp") {
    return `http://${addr.hostname}:${addr.port}`;
  }

  if (addr.transport === "unix" || addr.transport == "unixpacket") {
    return `${addr.transport}://${addr.path}`;
  }

  throw new Error("Unknown Transport");
};

console.log(`🚀 Server Started listening on ${formatAddr(server.addr)}`);
