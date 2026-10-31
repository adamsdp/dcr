/* RDCR allocation engine (browser + node).
   Port of rdcr_independent_reproducibility.py, written from the Green Paper s.18 spec.
   Verified against the Python implementation: see verify/compare.js in the repo. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RDCR = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function sum(o) { let s = 0; for (const k in o) s += o[k]; return s; }

  function hamilton(counts, target, votes) {
    const total = sum(counts);
    const quota = {}, base = {};
    for (const p in counts) {
      quota[p] = target * counts[p] / total;
      base[p] = Math.floor(quota[p]);
    }
    let left = target - sum(base);
    const order = Object.keys(counts).sort((a, b) => {
      const ra = quota[a] - base[a], rb = quota[b] - base[b];
      if (ra !== rb) return rb - ra;
      const va = (votes && votes[a]) || 0, vb = (votes && votes[b]) || 0;
      if (va !== vb) return vb - va;
      return a < b ? 1 : a > b ? -1 : 0;   // descending name, as Python reverse=True
    });
    for (let i = 0; i < left; i++) base[order[i]] += 1;
    const out = {};
    for (const p in base) if (base[p]) out[p] = base[p];
    return out;
  }

  function allocate(T, C, votes, direct, threshold, nonGroupings) {
    const total = sum(votes);
    const qual = Object.keys(votes).filter(p => !nonGroupings.has(p) && votes[p] / total >= threshold);
    let F = 0;
    for (const p in direct) if (qual.indexOf(p) < 0) F += direct[p];
    let Q = 0; qual.forEach(p => { Q += votes[p]; });
    const target = {};
    qual.forEach(p => { target[p] = (T - F) * votes[p] / Q; });
    const seats = Object.assign({}, direct);
    for (let i = 0; i < T - C; i++) {
      let best = -Infinity;
      const deficit = {};
      qual.forEach(p => { deficit[p] = target[p] - (seats[p] || 0); if (deficit[p] > best) best = deficit[p]; });
      let pick = null;
      qual.forEach(p => {
        if (Math.abs(deficit[p] - best) < 1e-12 && (pick === null || votes[p] > votes[pick])) pick = p;
      });
      seats[pick] = (seats[pick] || 0) + 1;
    }
    const out = {};
    for (const p in seats) if (seats[p]) out[p] = seats[p];
    return { target: target, seats: out, qualifying: qual };
  }

  function gallagher(votes, seats, T, dropOthers) {
    let tot = 0;
    for (const p in votes) if (!(dropOthers && p === 'Others')) tot += votes[p];
    const parties = new Set(Object.keys(votes).concat(Object.keys(seats)));
    if (dropOthers) parties.delete('Others');
    let s2 = 0;
    parties.forEach(p => {
      const v = (votes[p] || 0) / tot * 100, s = (seats[p] || 0) / T * 100;
      s2 += (v - s) * (v - s);
    });
    return Math.sqrt(s2 / 2);
  }

  /* opts: { threshold, mode: 'central' | 'neutral', share } */
  function run(data, opts) {
    const non = new Set(data.nonGroupings);
    const regional = {}, national = {}, natVotes = {};
    let Csum = 0;
    data.regions.forEach(r => {
      const T = data.T[r];
      const C = opts.mode === 'central' ? data.C[r] : Math.ceil(T * opts.share);
      const direct = opts.mode === 'central'
        ? data.central[r]
        : hamilton(data.actual[r], C, data.votes[r]);
      const res = allocate(T, C, data.votes[r], direct, opts.threshold, non);
      regional[r] = { T: T, C: C, direct: direct, seats: res.seats, target: res.target, qualifying: res.qualifying };
      Csum += C;
      for (const p in res.seats) national[p] = (national[p] || 0) + res.seats[p];
      for (const p in data.votes[r]) natVotes[p] = (natVotes[p] || 0) + data.votes[r][p];
    });
    return {
      regional: regional, national: national, natVotes: natVotes, constituencySeats: Csum,
      gallagherIncl: gallagher(natVotes, national, 650, false),
      gallagherExcl: gallagher(natVotes, national, 650, true)
    };
  }

  return { hamilton: hamilton, allocate: allocate, gallagher: gallagher, run: run, sum: sum };
});
