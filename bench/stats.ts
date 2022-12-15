export type Stats = ReturnType<typeof calcStats>;

export function calcStats(counts: number[], runtime: number, workers: number) {
  const totalCount = counts.reduce((a, c) => a + c, 0);
  const avgThrough = (totalCount / runtime) * 1000;
  return {
    countsum: totalCount,
    averageThrough: avgThrough,
    countAvg: totalCount / workers,
    workerThroughput: avgThrough / workers,
  };
}
