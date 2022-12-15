export async function runTest(
  workers: number,
  runtime: number
): Promise<number[]> {
  const counts: number[] = [];
  const promises = [];

  for (let i = 0; i < workers; i++) {
    const wrk = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    wrk.postMessage({ name: `Worker ${i}`, runtime: runtime, logging: false });
    promises.push(
      new Promise<void>((res, rej) => {
        wrk.onmessage = ({ data }) => {
          counts.push(data.count);
          res();
        };
        wrk.onmessageerror = (e) => {
          rej(e);
        };
      })
    );
  }

  await Promise.allSettled(promises);
  return counts;
}
