import { calcStats } from "./stats.ts";
import { runTest } from "./runtest.ts";
import * as Duration from "https://deno.land/std@0.168.0/fmt/duration.ts";
import * as Stats from "https://deno.land/x/statistics@v0.1.1/mod.ts";

const RUNS = 3;

const RUNTIME = 1 * 1e3;

const WORKERS_START = 5;
const WORKERS_END = 45;
const WORKERS_STEP = 5;

type StatNew = {
  workers: number;
  average: number;
  max: number;
  min: number;
  stdDev: number;
  raw: number[];
};
const results: StatNew[] = [];

for (let i = WORKERS_START; i <= WORKERS_END; i += WORKERS_STEP) {
  console.log(
    `Running test for ${i} workers | Expected total Remaining Time: ${
      Duration.format(
        (RUNS * RUNTIME * (WORKERS_END - i)) / WORKERS_STEP,
        {
          ignoreZero: true,
          style: "narrow",
        },
      )
    }`,
  );
  let avgThroughs!: number[];
  try {
    avgThroughs = await megaTest(i);
  } catch (e) {
    console.error(e);
    break;
  }

  const stats: StatNew = {
    workers: i,
    average: Stats.mean(avgThroughs),
    max: Stats.max(avgThroughs),
    min: Stats.min(avgThroughs),
    stdDev: Stats.sampleStandardDeviation(avgThroughs),
    raw: avgThroughs,
  };

  console.log(stats);

  results.push(stats);
}

console.log("Mega Test Complete, writing results to ./results.json");
await Deno.writeTextFile(
  "./results.json",
  JSON.stringify(results, undefined, 2),
);

async function megaTest(WORKERS: number) {
  const results: number[] = [];

  for (let i = 0; i < RUNS; i++) {
    const counts = await runTest(WORKERS, RUNTIME);

    results.push(calcStats(counts, RUNTIME, WORKERS).averageThrough);
  }
  return results;
}
