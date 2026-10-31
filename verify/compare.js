// Checks assets/engine.js against reference outputs produced by
// downloads/rdcr_independent_reproducibility.py. Run:  node verify/compare.js
const path = require('path');
const E = require(path.join(__dirname, '../assets/engine.js'));
const data = require(path.join(__dirname, '../data/model-data.json'));
const cases = require('./expected.json');
let bad = 0;
const eq = (a, b) => { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(k => a[k] === b[k]); };
cases.forEach(c => {
  const r = E.run(data, { threshold: c.threshold, mode: c.mode, share: c.share });
  let ok = eq(r.national, c.national) && Math.abs(r.gallagherIncl - c.gi) < 1e-9 && Math.abs(r.gallagherExcl - c.gx) < 1e-9;
  data.regions.forEach(reg => { if (!eq(r.regional[reg].seats, c.regional[reg])) ok = false; });
  if (!ok) { bad++; console.log('MISMATCH', c.mode, c.threshold, c.share); }
});
console.log(bad ? bad + ' of ' + cases.length + ' cases FAILED' : 'All ' + cases.length + ' cases match the Python reference (national, all 12 regions, both Gallagher indices).');
process.exit(bad ? 1 : 0);
