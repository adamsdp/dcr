(function () {
  'use strict';
  var COLORS = {
    Lab:'#d02027', Con:'#1b78c9', Reform:'#14a5c0', LD:'#f0a21a', Green:'#2f9e57',
    SNP:'#a89200', Plaid:'#3c8a2e', SF:'#2e6b5f', DUP:'#c9573a', Alliance:'#d4a900',
    UUP:'#4aa3e8', SDLP:'#27a86a', TUV:'#12385f', Speaker:'#8a8f98', Independent:'#b06ad1', Others:'#b5b5b5',
    PBP:'#a33', Aontu:'#6a6'
  };
  var NAMES = { Lab:'Labour', Con:'Conservative', Reform:'Reform UK', LD:'Lib Dem', Green:'Green', SNP:'SNP', Plaid:'Plaid Cymru',
    SF:'Sinn Féin', DUP:'DUP', Alliance:'Alliance', UUP:'UUP', SDLP:'SDLP', TUV:'TUV', Speaker:'Speaker', Independent:'Independents', Others:'Others / independents' };
  var MAJOR = ['Lab','Con','Reform','LD','Green','SNP','Plaid','SF','DUP','Alliance','UUP','SDLP','TUV','Speaker','Independent'];

  function col(p){ return COLORS[p] || '#999'; }
  function nm(p){ return NAMES[p] || p; }
  function pct(x, d){ return (x).toFixed(d == null ? 1 : d) + '%'; }
  function el(id){ return document.getElementById(id); }

  fetch('data/model-data.json').then(function (r) { return r.json(); }).then(init).catch(function (e) {
    var n = el('explorer-error'); if (n) { n.hidden = false; n.textContent = 'Could not load model data (' + e + '). If you opened this file directly, serve it over http, e.g. "python3 -m http.server".'; }
  });

  function init(data) {
    var state = { threshold: 0.05, mode: 'central', share: 0.5, region: 'North West' };
    var natVotesTotal = 0, natVotes = {};
    data.regions.forEach(function (r) { for (var p in data.votes[r]) natVotes[p] = (natVotes[p] || 0) + data.votes[r][p]; });
    for (var p in natVotes) natVotesTotal += natVotes[p];

    /* ---- static FPTP chart (section 1) ---- */
    renderFptp(data, natVotes, natVotesTotal);

    /* ---- explorer controls ---- */
    var thr = el('thr'), shr = el('shr'), regionSel = el('region');
    data.regions.forEach(function (r) { var o = document.createElement('option'); o.value = r; o.textContent = r; regionSel.appendChild(o); });
    regionSel.value = state.region;

    function setMode(m) {
      state.mode = m;
      el('mode-central').setAttribute('aria-pressed', m === 'central');
      el('mode-neutral').setAttribute('aria-pressed', m === 'neutral');
      shr.disabled = m === 'central';
      el('shr-note').textContent = m === 'central'
        ? 'Fixed at 50:50 in the Green Paper scenario. Switch to "Neutral anchors" to vary it.'
        : 'Share of seats that are local constituencies. In neutral mode each party’s 2024 local wins are scaled down to fit.';
      update();
    }
    thr.addEventListener('input', function () { state.threshold = thr.value / 100; update(); });
    shr.addEventListener('input', function () { state.share = shr.value / 100; update(); });
    regionSel.addEventListener('change', function () { state.region = regionSel.value; update(); });
    el('mode-central').addEventListener('click', function () { setMode('central'); });
    el('mode-neutral').addEventListener('click', function () { setMode('neutral'); });

    function preset(t, m, s) {
      thr.value = t * 100; state.threshold = t; shr.value = s * 100; state.share = s; setMode(m);
    }
    el('p-proposed').addEventListener('click', function () { preset(0.03, 'central', 0.5); });
    el('p-central').addEventListener('click', function () { preset(0.05, 'central', 0.5); });
    el('p-high').addEventListener('click', function () { preset(0.07, 'central', 0.5); });
    el('p-6040').addEventListener('click', function () { preset(0.05, 'neutral', 0.6); });

    function update() {
      el('thr-out').textContent = pct(state.threshold * 100, 1);
      el('shr-out').textContent = Math.round(state.share * 100) + ':' + (100 - Math.round(state.share * 100));
      var res = RDCR.run(data, { threshold: state.threshold, mode: state.mode, share: state.share });
      renderNational(res);
      renderRegion(res);
    }

    function renderNational(res) {
      var nat = res.national;
      var parties = Object.keys(nat).sort(function (a, b) { return nat[b] - nat[a]; });
      // parliament squares
      var h = '';
      parties.forEach(function (p) { for (var i = 0; i < nat[p]; i++) h += '<i style="background:' + col(p) + '" title="' + nm(p) + '"></i>'; });
      el('hemi').innerHTML = h;
      el('hemi').setAttribute('aria-label', 'Seat grid: ' + parties.map(function (p) { return nm(p) + ' ' + nat[p]; }).join(', '));
      el('legend').innerHTML = parties.map(function (p) { return '<span><span class="swatch" style="background:' + col(p) + '"></span>' + nm(p) + ' ' + nat[p] + '</span>'; }).join('');
      // readouts
      var lab = nat.Lab || 0;
      var big = Math.max.apply(null, parties.map(function (p) { return nat[p]; }));
      el('r-largest').textContent = big;
      el('r-largest-s').textContent = 'seats for the largest party (majority needs 326)';
      el('r-short').textContent = Math.max(0, 326 - big);
      el('r-gi').textContent = res.gallagherIncl.toFixed(2);
      el('r-gx').textContent = res.gallagherExcl.toFixed(2);
      el('r-const').textContent = res.constituencySeats + ' / ' + (650 - res.constituencySeats);
      // bars: vote vs seats
      var rows = MAJOR.filter(function (p) { return (natVotes[p] || 0) > 0 || nat[p]; });
      rows.sort(function (a, b) { return (natVotes[b] || 0) - (natVotes[a] || 0); });
      var maxv = 0; rows.forEach(function (p) { maxv = Math.max(maxv, (natVotes[p] || 0) / natVotesTotal * 100, (nat[p] || 0) / 650 * 100); });
      el('bars').innerHTML = rows.map(function (p) {
        var v = (natVotes[p] || 0) / natVotesTotal * 100, s = (nat[p] || 0) / 650 * 100;
        return '<div class="row"><span>' + nm(p) + '</span><div class="track">' +
          '<div class="vote" style="width:' + (v / maxv * 100) + '%;background:' + col(p) + '"></div>' +
          '<div class="seat" style="width:' + (s / maxv * 100) + '%;background:' + col(p) + '"></div></div>' +
          '<span class="num">' + pct(v) + ' → ' + pct(s) + '</span></div>';
      }).join('');
    }

    function renderRegion(res) {
      var r = state.region, rr = res.regional[r], v = data.votes[r], tot = 0;
      for (var p in v) tot += v[p];
      var seats = rr.seats;
      var parties = Object.keys(v).filter(function (p) { return v[p] / tot >= 0.02 || seats[p]; });
      parties.sort(function (a, b) { return v[b] - v[a]; });
      var qual = rr.qualifying;
      var html = '<div class="tablewrap"><table><thead><tr><th>Party</th><th>Votes</th><th>Vote share</th><th>Local seats</th><th>Top-up seats</th><th>Total</th><th>Seat share</th></tr></thead><tbody>';
      parties.forEach(function (p) {
        var d = rr.direct[p] || 0, f = seats[p] || 0;
        var below = qual.indexOf(p) < 0 && ['Speaker', 'Independent', 'Others'].indexOf(p) < 0;
        html += '<tr><td><span class="swatch" style="background:' + col(p) + '"></span>' + nm(p) + (below ? ' <small>(below threshold)</small>' : '') + '</td><td>' + v[p].toLocaleString('en-GB') + '</td><td>' + pct(v[p] / tot * 100) + '</td><td>' + d + '</td><td>' + (f - d) + '</td><td><b>' + f + '</b></td><td>' + pct(f / rr.T * 100) + '</td></tr>';
      });
      html += '</tbody></table></div><p style="font-size:.85rem;color:var(--muted)">' + rr.T + ' seats: ' + rr.C + ' local + ' + (rr.T - rr.C) + ' top-up. Local seats are the scenario assumption, not a map of real constituencies.</p>';
      el('region-table').innerHTML = html;
    }

    setMode('central');
    thr.value = 5; shr.value = 50; update();
  }

  function renderFptp(data, natVotes, tot) {
    var order = ['Lab','Con','Reform','LD','Green','SNP','Plaid','SF','DUP'];
    var rows = order.map(function (p) {
      var v = natVotes[p] / tot * 100, s = (data.fptp[p] || 0) / 650 * 100;
      return { p: p, v: v, s: s, n: data.fptp[p] || 0 };
    });
    var maxv = Math.max.apply(null, rows.map(function (r) { return Math.max(r.v, r.s); }));
    el('fptp-bars').innerHTML = rows.map(function (r) {
      return '<div class="row"><span>' + nm(r.p) + '</span><div class="track"><div class="vote" style="width:' + (r.v / maxv * 100) + '%;background:' + col(r.p) + '"></div><div class="seat" style="width:' + (r.s / maxv * 100) + '%;background:' + col(r.p) + '"></div></div><span class="num">' + pct(r.v) + ' → ' + r.n + ' seats</span></div>';
    }).join('');
  }
})();
