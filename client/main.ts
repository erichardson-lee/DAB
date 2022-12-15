import { DabClient } from "./dabclient.ts";

const client = new DabClient({ debug: true });

await client.connect({ broker: "ws://localhost:4142" });

console.log(
  await client.send({
    command: "register",
    conversation: Math.floor(Math.random() * 1e12),
    id: "739cc12e-3916-4e4e-bead-c75a777d5103",
    name: "Fred",
  }),
);

client.disconnect();
