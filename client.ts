const ws = new WebSocket("ws://localhost:4142", ["dab"]);

// Wait for WS to be open
await new Promise<void>((res, rej) => {
  setTimeout(() => rej("timeout"), 1000);

  setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) res();
  }, 100);
});

ws.onopen = () => console.log("socket opened");
ws.onmessage = (e) => {
  console.log("socket message:", e.data);
};
ws.onerror = (e) => console.log("socket errored:", e);
ws.onclose = () => console.log("socket closed");

ws.send("LMAO YEET!");

setTimeout(() => {
  console.log("Closing Socket");
  ws.close(4069, "Aight Imma Head Out ✌️");
  Deno.exit(0);
}, 1000);
