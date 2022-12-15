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
  fMsgCount++;

  if (LOG_MESSAGES) {
    const data = <WsResponse> JSON.parse(e.data);

    console.log("📫 Recieved:", data);
  }
};

const sendRequest = (data: WsRequest) => {
  LOG_MESSAGES && console.log("🚀 Sending Request:", data);
  ws.send(JSON.stringify(data));
};

let msgCount = 0;
let fMsgCount = 0;

let periodStart = Date.now();

const startTimer = () =>
  setInterval(() => {
    sendRequest({
      command: "invoke",
      conversation: msgCount++,
      id: "test",
      payload: "AAAA",
    });
  }, 1);

const perFrames: number[] = [];
const getAverageFrame = () =>
  perFrames.reduce((a, b) => a + b, 0) / perFrames.length;

const TimeFrame = 10 as const;
setInterval(() => {
  const now = Date.now();
  const then = periodStart;
  const pCount = fMsgCount;

  periodStart = now;
  fMsgCount = 0;

  const timeElapsed = now - then;
  const perFrame = pCount * (1e3 / TimeFrame);

  perFrames.push(perFrame);

  console.log(
    `📈 ${
      perFrame.toPrecision(
        6,
      )
    } msg/${timeElapsed}ms [${pCount} total] [${
      getAverageFrame().toPrecision(
        6,
      )
    } avg]`,
  );
}, TimeFrame);

const clients = prompt("How many Clients? (1-100)");
const noClients = parseInt(clients ?? "NaN");

if (Number.isNaN(noClients) || noClients <= 0) {
  console.error("Invalid Value");
  Deno.exit(1);
}

for (let i = 0; i < noClients; i++) {
  startTimer();
}

const TIMEOUT = 10e3 as const;

setTimeout(() => {
  console.log(`⏰ Closing Socket (auto close after ${TIMEOUT}ms)`);
  ws.close(1000, "Aight Imma Head Out ✌️");
  console.log(`🗿 Performed ${msgCount} requests in ${TIMEOUT}ms`);
  console.log(`🗿 (${(msgCount / (TIMEOUT / 1e3)).toPrecision(6)} msg/s)`);
  console.log(`🗿 (${getAverageFrame().toPrecision(6)} msg/s)`);
  Deno.exit(0);
}, TIMEOUT);
