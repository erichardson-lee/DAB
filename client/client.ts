import { WsRequest, WsResponse } from "../api/index.ts";

const ws = new WebSocket("ws://localhost:4142", ["dab"]);

const LOG_MESSAGES = false as const;

// Wait for WS to be open
await new Promise<void>((res, rej) => {
  setTimeout(() => rej("timeout"), 1000);
  ws.onopen = () => {
    console.log("🌅 Socket opened");
    res();
  };
});

ws.onerror = (e) => console.log("💥 Socket errored:", e);
ws.onclose = () => console.log("🔒 Socket closed");

ws.onmessage = (e: MessageEvent) => {
  const data = <WsResponse>JSON.parse(e.data);
  LOG_MESSAGES && console.log("📫 Recieved:", data);
};

const sendRequest = (data: WsRequest) => {
  LOG_MESSAGES && console.log("🚀 Sending Request:", data);
  ws.send(JSON.stringify(data));
};

setInterval(() => {
  sendRequest({
    command: "invoke",
    conversation: Math.floor(Math.random() * 1e9),
    id: "test",
    payload: "AAAA",
  });
}, 1000);

const TIMEOUT = 10e3 as const;

setTimeout(() => {
  console.log(`⏰ Closing Socket (auto close after ${TIMEOUT}ms)`);
  ws.close(1000, "Aight Imma Head Out ✌️");
  Deno.exit(0);
}, TIMEOUT);
