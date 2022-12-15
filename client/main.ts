import { DabClient } from "./dabclient.ts";

const LOG_MESSAGES = false as const;
const client = new DabClient({ debug: true });

await client.connect({ broker: "ws://localhost:4142" });

client.on("error", (_, e) => console.log("💥 Socket errored:", e));
client.on("close", () => console.log("🔒 Socket closed"));

setInterval(() => {
  client
    .send({
      command: "invoke",
      conversation: Math.floor(Math.random() * 1e9),
      id: "test",
      payload: "AAAA",
    })
    .then((data) => {
      LOG_MESSAGES && console.log("📫 Recieved:", data);
    });
}, 1000);

const TIMEOUT = 10e3 as const;

setTimeout(() => {
  console.log(`⏰ Closing Socket (auto close after ${TIMEOUT}ms)`);
  client.disconnect(1000, "Aight Imma Head Out ✌️");
  Deno.exit(0);
}, TIMEOUT);
