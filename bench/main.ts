import { calcStats } from "./stats.ts";
import { runTest } from "./runtest.ts";

const pInt = (question: string, def = 0) =>
  parseInt(prompt(`❓ ${question} [${def.toString()}]`) ?? def.toString());

export const WORKER_COUNT = pInt("How Many Workers?", 1);

if (WORKER_COUNT < 1) throw new Error("Invalid Worker Count");

export const RUNTIME = pInt("How long to run for (ms)?", 5000);
if (RUNTIME < 0) throw new Error("Invalid Runtime");

const counts = await runTest(WORKER_COUNT, RUNTIME);

const stats = calcStats(counts, RUNTIME, WORKER_COUNT);

const printNum = (msg: string, val: number, unit?: string) =>
  console.log(`📊 ${msg} ${val.toPrecision(6)} ${unit ?? ""}`);

printNum("Total Requests", stats.countsum, "R");
printNum("Total Throughput", stats.averageThrough, "R/s");
printNum("Average Requests", stats.countAvg, "R");
printNum("Average Throughput", stats.workerThroughput, "R/s");
