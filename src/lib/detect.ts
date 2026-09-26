/**
 * A simulated intrusion detector's scores, shaped like the real problem:
 * attack-heavy traffic (78.6% attacks, so "flag everything" scores 78.6%
 * precision, as in the write-up), and a hard middle where slow attacks like
 * reconnaissance scans overlap normal traffic. The "leaked" version is what a
 * model scores when testbed-artifact columns give the answer away.
 *
 * Every flow is one block in the 3D stage, binned by score; the demo and the
 * scene share these counts so the numbers and the picture always agree.
 */
export const BINS = 40;
export const N_BENIGN = 301;
export const N_ATTACK = 1107;

const gauss = (x: number, m: number, s: number) => Math.exp(-0.5 * ((x - m) / s) ** 2);

/** Spread `total` flows over the bins in proportion to `density` (largest remainder). */
function spread(total: number, density: (x: number) => number) {
  const w = Array.from({ length: BINS }, (_, b) => density((b + 0.5) / BINS));
  const sum = w.reduce((a, b) => a + b, 0);
  const raw = w.map((v) => (v / sum) * total);
  const out = raw.map(Math.floor);
  let left = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((v, b) => [v - Math.floor(v), b]).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0; k++, left--) out[order[k % BINS][1]]++;
  return out;
}

const HONEST = {
  benign: spread(N_BENIGN, (x) => 0.8 * gauss(x, 0.16, 0.08) + 0.2 * gauss(x, 0.44, 0.11)),
  attack: spread(N_ATTACK, (x) => 0.7 * gauss(x, 0.86, 0.065) + 0.3 * gauss(x, 0.56, 0.12)),
};
const LEAKED = {
  benign: spread(N_BENIGN, (x) => gauss(x, 0.08, 0.05)),
  attack: spread(N_ATTACK, (x) => gauss(x, 0.92, 0.05)),
};

export const histograms = (leaky: boolean) => (leaky ? LEAKED : HONEST);

/** Detection metrics when every flow in bin >= `t` raises an alert. */
export function metrics(leaky: boolean, t: number) {
  const { benign, attack } = histograms(leaky);
  const tp = attack.slice(t).reduce((a, b) => a + b, 0);
  const fp = benign.slice(t).reduce((a, b) => a + b, 0);
  return {
    recall: tp / N_ATTACK,
    falseAlarm: fp / N_BENIGN,
    precision: tp + fp === 0 ? 1 : tp / (tp + fp),
  };
}

/** Area under the precision–recall curve (average precision over thresholds). */
export function prAuc(leaky: boolean) {
  let area = 0;
  let prevRecall = 0;
  for (let t = BINS - 1; t >= 0; t--) {
    const m = metrics(leaky, t);
    area += (m.recall - prevRecall) * m.precision;
    prevRecall = m.recall;
  }
  return area;
}

/** The operating policy: the strictest threshold that still reaches 95% recall. */
export function policyThreshold(leaky: boolean) {
  for (let t = BINS; t >= 0; t--) if (metrics(leaky, t).recall >= 0.95) return t;
  return 0;
}
