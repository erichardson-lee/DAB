import { DabClient } from "./deps.ts";
import * as Duration from "https://deno.land/std@0.168.0/fmt/duration.ts";

const client = new DabClient();

const { name, runtime, logging } = await new Promise<{
  name: string;
  runtime: number;
  logging: boolean;
}>((res) => {
  //@ts-ignore Weird typing on worker stuff
  self.onmessage = ({ data }) => res(data);
});

console.assert(!logging, `${name} Connecting...`);
await client.connect({ broker: "ws://localhost:4142" });
console.assert(!logging, `${name} Connected, running...`);

let work = true;
let count = 0;

setTimeout(() => (work = false), runtime);
while (work) {
  await client.send({
    command: "invoke",
    conversation: count,
    id: "test",
    payload: "",
  });
  // Ignores last one if work is false by end time
  // (meaning it'll only count responses _within_ the time bound)
  if (work) count++;
}
console.assert(
  !logging,
  `${name} got ${count} requests in ${Duration.format(runtime, {
    ignoreZero: true,
    style: "narrow",
  })}`
);

//@ts-ignore Weird typing on worker stuff
self.postMessage({ count });

client.disconnect(1000, "Benchmark Complete");
self.close();
