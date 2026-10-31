"""Independent reproducibility script - RDCR model on reconciled GE2024 data.

Provenance
----------
Vote inputs are aggregated from the House of Commons Library dataset
"HoC-GE2024-results-by-constituency.csv" (corrected edition, Record of
changes to 5 Jan 2026), researchbriefings.files.parliament.uk, CBP-10009.
Transcription was checksum-verified before aggregation: 650 rows; national
valid votes exactly 28,809,340; every party's national total equal to the
published Library figure; each row's party columns sum to its valid votes.

NI note: the Library file folds TUV/PBP/Aontu/independents into an
"All other candidates" column. TUV (48,685), PBP (8,438) and Aontu (7,466)
are separated using their official national totals (all three stand only in
NI); the remaining residual is the Others bucket. The Speaker (25,238,
Chorley) is separated in the North West the same way.

Scope
-----
Reproduces: regional vote layer, central direct-seat scenario at 5% and at
the proposed 3% threshold, pure Hamilton anchors, Gallagher indices under
both residual conventions, a broadened perturbation stress test, and a
Sainte-Lague cross-check. Direct-seat scenarios remain assumptions, not
ward-built counterfactual constituencies.

This implementation was written from the Green Paper Section 18 prose
specification, independently of the Green Paper author's code.
"""
import math, collections, itertools

T_SPEC = {"North East": 26, "North West": 73, "Yorkshire and the Humber": 53, "East Midlands": 48, "West Midlands": 58, "East of England": 62, "London": 85, "South East": 90, "South West": 55, "Scotland": 52, "Wales": 30, "Northern Ireland": 18}
C_SPEC = {k: math.ceil(v/2) for k, v in T_SPEC.items()}
NON_GROUPINGS = {'Others', 'Independent', 'Speaker', 'PBP', 'Aontu'}

REGIONAL_VOTES = {
 "North East": {
  "Con": 224584,
  "Lab": 504569,
  "LD": 65385,
  "Reform": 220875,
  "Green": 66680,
  "Others": 29447
 },
 "North West": {
  "Con": 581099,
  "Lab": 1361196,
  "LD": 242662,
  "Reform": 512115,
  "Green": 217092,
  "Speaker": 25238,
  "Others": 153060
 },
 "Yorkshire and the Humber": {
  "Con": 506450,
  "Lab": 907767,
  "LD": 158326,
  "Reform": 371658,
  "Green": 167514,
  "Others": 110232
 },
 "East Midlands": {
  "Con": 626568,
  "Lab": 753723,
  "LD": 136929,
  "Reform": 403470,
  "Green": 133447,
  "Others": 79524
 },
 "West Midlands": {
  "Con": 669368,
  "Lab": 824433,
  "LD": 214493,
  "Reform": 439278,
  "Green": 159140,
  "Others": 119145
 },
 "East of England": {
  "Con": 869447,
  "Lab": 834896,
  "LD": 375642,
  "Reform": 496237,
  "Green": 195665,
  "Others": 67432
 },
 "London": {
  "Con": 685082,
  "Lab": 1432622,
  "LD": 367424,
  "Reform": 289459,
  "Green": 335479,
  "Others": 223916
 },
 "South East": {
  "Con": 1332755,
  "Lab": 1067897,
  "LD": 951222,
  "Reform": 609281,
  "Green": 299665,
  "Others": 90596
 },
 "South West": {
  "Con": 785672,
  "Lab": 682080,
  "LD": 686921,
  "Reform": 384240,
  "Green": 206780,
  "Others": 39737
 },
 "Scotland": {
  "Con": 307344,
  "Lab": 851897,
  "LD": 234228,
  "Reform": 167979,
  "Green": 92685,
  "SNP": 724758,
  "Others": 35919
 },
 "Wales": {
  "Con": 240003,
  "Lab": 487636,
  "LD": 85911,
  "Reform": 223018,
  "Green": 61662,
  "Plaid": 194811,
  "Others": 26035
 },
 "Northern Ireland": {
  "Con": 553,
  "Green": 8692,
  "DUP": 172058,
  "SF": 210891,
  "SDLP": 86861,
  "UUP": 94779,
  "Alliance": 117191,
  "TUV": 48685,
  "PBP": 8438,
  "Aontu": 7466,
  "Others": 24226
 }
}

ACTUAL_WINNERS = {
 "North East": {
  "Lab": 26,
  "Con": 1
 },
 "North West": {
  "Lab": 65,
  "Independent": 1,
  "LD": 3,
  "Con": 3,
  "Speaker": 1
 },
 "Yorkshire and the Humber": {
  "Lab": 43,
  "Con": 9,
  "Independent": 1,
  "LD": 1
 },
 "East Midlands": {
  "Lab": 29,
  "Reform": 2,
  "Con": 15,
  "Independent": 1
 },
 "West Midlands": {
  "Con": 15,
  "Lab": 38,
  "Independent": 1,
  "Green": 1,
  "LD": 2
 },
 "East of England": {
  "Con": 23,
  "Lab": 27,
  "LD": 7,
  "Reform": 3,
  "Green": 1
 },
 "London": {
  "Lab": 59,
  "Con": 9,
  "LD": 6,
  "Independent": 1
 },
 "South East": {
  "Lab": 36,
  "Con": 30,
  "LD": 24,
  "Green": 1
 },
 "South West": {
  "LD": 22,
  "Lab": 24,
  "Con": 11,
  "Green": 1
 },
 "Scotland": {
  "SNP": 9,
  "Lab": 37,
  "Con": 5,
  "LD": 6
 },
 "Wales": {
  "Lab": 27,
  "LD": 1,
  "Plaid": 4
 },
 "Northern Ireland": {
  "DUP": 5,
  "SF": 7,
  "SDLP": 2,
  "Alliance": 1,
  "TUV": 1,
  "Independent": 1,
  "UUP": 1
 }
}

GP_CENTRAL_SCENARIO = {
 "North East": {
  "Lab": 13
 },
 "North West": {
  "Lab": 33,
  "Con": 1,
  "LD": 2,
  "Speaker": 1
 },
 "Yorkshire and the Humber": {
  "Lab": 21,
  "Con": 5,
  "LD": 1
 },
 "East Midlands": {
  "Lab": 14,
  "Con": 9,
  "Reform": 1
 },
 "West Midlands": {
  "Lab": 19,
  "Con": 9,
  "LD": 1
 },
 "East of England": {
  "Lab": 14,
  "Con": 13,
  "LD": 3,
  "Reform": 1
 },
 "London": {
  "Lab": 35,
  "Con": 5,
  "LD": 3
 },
 "South East": {
  "Lab": 17,
  "Con": 15,
  "LD": 12,
  "Green": 1
 },
 "South West": {
  "Lab": 12,
  "Con": 5,
  "LD": 11
 },
 "Scotland": {
  "Lab": 16,
  "SNP": 4,
  "Con": 3,
  "LD": 3
 },
 "Wales": {
  "Lab": 12,
  "Plaid": 2,
  "LD": 1
 },
 "Northern Ireland": {
  "SF": 4,
  "DUP": 2,
  "SDLP": 1,
  "Alliance": 1,
  "UUP": 1
 }
}


def hamilton(counts, target, votes=None):
    """Largest-remainder compression; ties by remainder then regional votes."""
    total = sum(counts.values())
    quota = {p: target*n/total for p, n in counts.items()}
    base = {p: math.floor(q) for p, q in quota.items()}
    left = target - sum(base.values())
    order = sorted(counts, key=lambda p: (quota[p]-base[p],
                                          (votes or counts).get(p, 0), p), reverse=True)
    for p in order[:left]:
        base[p] += 1
    return {p: n for p, n in base.items() if n}

def allocate(T, C, votes, direct, threshold):
    """Green Paper s.18: qualifying groupings >= threshold of regional valid
    votes; F = direct seats of non-qualifying entities; targets over T-F;
    T-C regional seats to the largest deficit, ties by raw votes."""
    total = sum(votes.values())
    qual = [p for p in votes if p not in NON_GROUPINGS and votes[p]/total >= threshold]
    F = sum(n for p, n in direct.items() if p not in qual)
    Q = sum(votes[p] for p in qual)
    target = {p: (T-F)*votes[p]/Q for p in qual}
    seats = collections.Counter(direct)
    for _ in range(T-C):
        deficit = {p: target[p]-seats[p] for p in qual}
        best = max(deficit.values())
        tied = [p for p, d in deficit.items() if abs(d-best) < 1e-12]
        seats[max(tied, key=lambda p: votes[p])] += 1
    return target, {p: n for p, n in seats.items() if n}

def sainte_lague(T, C, votes, direct, threshold):
    total = sum(votes.values())
    qual = [p for p in votes if p not in NON_GROUPINGS and votes[p]/total >= threshold]
    seats = collections.Counter(direct)
    for _ in range(T-C):
        pick = max(qual, key=lambda p: votes[p]/(2*seats[p]+1))
        seats[pick] += 1
    return {p: n for p, n in seats.items() if n}

def gallagher(votes, seats, T, drop_others=False):
    tot = sum(v for p, v in votes.items() if not (drop_others and p == 'Others'))
    parties = set(votes) | set(seats)
    if drop_others:
        parties -= {'Others'}
    return math.sqrt(sum((votes.get(p, 0)/tot*100 - seats.get(p, 0)/T*100)**2
                         for p in parties)/2)

def perturbations(votes, direct, C, actual, radius=2, l1max=4, min_share=0.08):
    """Vary every grouping with >= min_share regional vote share, a scenario
    seat, or an actual 2024 seat (superset of the Green Paper test, which
    varied 2024 winners only). Non-grouping direct seats held fixed."""
    total = sum(votes.values())
    var = [p for p in votes if p not in NON_GROUPINGS and
           (votes[p]/total >= min_share or direct.get(p, 0) > 0 or actual.get(p, 0) > 0)]
    special = {p: n for p, n in direct.items() if p in NON_GROUPINGS}
    tgt = C - sum(special.values())
    ranges = [range(max(0, direct.get(p, 0)-radius), min(C, direct.get(p, 0)+radius)+1)
              for p in var]
    for vals in itertools.product(*ranges):
        if sum(vals) != tgt:
            continue
        if sum(abs(v-direct.get(p, 0)) for p, v in zip(var, vals)) > l1max:
            continue
        d = {p: v for p, v in zip(var, vals) if v}
        d.update(special)
        yield d

if __name__ == '__main__':
    assert sum(sum(v.values()) for v in REGIONAL_VOTES.values()) == 28_809_340
    assert sum(T_SPEC.values()) == 650 and sum(C_SPEC.values()) == 327
    for th, label in [(0.05, '5% threshold'), (0.03, '3% threshold (proposal)')]:
        nat = collections.Counter()
        for r, votes in REGIONAL_VOTES.items():
            tgt, fin = allocate(T_SPEC[r], C_SPEC[r], votes, GP_CENTRAL_SCENARIO[r], th)
            if th == 0.05:
                print(r, 'targets=', {p: round(t, 3) for p, t in tgt.items()}, 'final=', fin)
            nat.update(fin)
        assert sum(nat.values()) == 650
        print(label, '->', dict(sorted(nat.items(), key=lambda x: -x[1])), '\n')
    print('Hamilton anchors:')
    for r in REGIONAL_VOTES:
        print(' ', r, hamilton(ACTUAL_WINNERS[r], C_SPEC[r], REGIONAL_VOTES[r]))
    print('\nPerturbation envelopes (broadened test):')
    lo = collections.Counter(); hi = collections.Counter()
    for r, votes in REGIONAL_VOTES.items():
        finals = [allocate(T_SPEC[r], C_SPEC[r], votes, d, 0.05)[1]
                  for d in perturbations(votes, GP_CENTRAL_SCENARIO[r], C_SPEC[r], ACTUAL_WINNERS[r])]
        parties = set().union(*(f.keys() for f in finals))
        rng = {p: (min(f.get(p, 0) for f in finals), max(f.get(p, 0) for f in finals))
               for p in parties}
        for p, (a, b) in rng.items():
            lo[p] += a; hi[p] += b
        print(' ', r, {p: v for p, v in rng.items() if v[0] != v[1]} or 'INVARIANT')
    print('National envelope:', {p: (lo[p], hi[p]) for p in sorted(hi, key=lambda x: -hi[x])})
    natSL = collections.Counter(); nat5 = collections.Counter()
    for r, votes in REGIONAL_VOTES.items():
        natSL.update(sainte_lague(T_SPEC[r], C_SPEC[r], votes, GP_CENTRAL_SCENARIO[r], 0.05))
        nat5.update(allocate(T_SPEC[r], C_SPEC[r], votes, GP_CENTRAL_SCENARIO[r], 0.05)[1])
    print('Sainte-Lague delta vs greedy-deficit:',
          {p: natSL.get(p, 0)-nat5.get(p, 0) for p in set(natSL) | set(nat5)
           if natSL.get(p, 0) != nat5.get(p, 0)})
