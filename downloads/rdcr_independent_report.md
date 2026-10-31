# Regional Direct–Compensatory Representation: Independent Model, Cross-Validation, and Suitability Analysis

**Status:** Independent reproduction and assessment. Produced without reuse of the Green Paper author's code or embedded data.
**Data edition:** House of Commons Library, *General election 2024 results* (CBP-10009), `HoC-GE2024-results-by-constituency.csv`, corrected edition, Record of changes to 5 January 2026.
**Companion files:** `rdcr_independent_reproducibility.py` (self-contained, embeds the reconciled regional layer), `rdcr_independent_model.xlsx`, `uk_ge2024_regional_votes_reconciled.csv`, `rdcr_independent_results.csv`, `ge2024_by_constituency_reconciled.csv`.

---

## Part 1 — Independent modelling and results

### 1.1 Data pipeline and verification

The vote layer was rebuilt bottom-up from the Commons Library constituency-level file rather than from any previously transcribed regional table. The transcription into the analysis environment was accepted only after passing all of the following checksums simultaneously:

- 650 constituency rows; regional row counts match the 2024 allocation (NE 27, NW 73, Y&H 54, EM 47, WM 57, EE 61, London 75, SE 91, SW 58, Scotland 57, Wales 32, NI 18).
- National valid votes equal to **28,809,340 exactly**.
- Every party's national vote total equal to the published Library figure to the vote (Lab 9,708,716; Con 6,828,925; Reform 4,117,610; LD 3,519,143; all-Greens 1,944,501; SNP 724,758; Plaid 194,811; SF 210,891; DUP 172,058; Alliance 117,191; UUP 94,779; SDLP 86,861).
- Every row's party columns sum to that row's declared valid votes (maximum discrepancy: 0).
- Winner counts by party equal to the official result in every region.

A dropped row, transposed digit, or misfiled column cannot survive this battery, so the regional aggregates derived from it are reconciled by construction. This closes the reconciliation item that the original scrutiny report left open.

Two classification steps were required because the Library file folds minor candidates into an "All other candidates" column: the Speaker's 25,238 Chorley votes were separated in the North West, and in Northern Ireland the TUV (48,685), PBP (8,438) and Aontú (7,466) were separated using their official national totals, all three being NI-only parties. The remaining residual forms the Others bucket, which includes independents.

### 1.2 Model implementation

The allocation engine was written from the Green Paper §18 prose specification: registered groupings qualify with at least the threshold share of regional valid votes; F is the count of direct seats held by non-qualifying entities; targets are (T − F) × V_p / Q over qualifying votes Q; the T − C regional seats are awarded sequentially to the largest deficit with ties broken by raw regional votes. Regional entitlements follow the Green Paper specification (650 seats: London 85, SE 90, NW 73 … NI 18) with C = ⌈T/2⌉, giving 327 constituency and 323 regional seats.

Direct-seat inputs are assumptions by construction — no ward-built counterfactual boundaries exist — so two scenario families were run: the Green Paper's published central anchors (for like-for-like comparison) and pure Hamilton largest-remainder compressions of the actual 2024 winners, with ties broken by regional votes rather than alphabetically.

### 1.3 Central results (reconciled data, Green Paper central anchors)

| Party | Vote share | Seats @5% | Share @5% | Seats @3% (the proposal) | Share @3% | FPTP 2024 |
|---|---|---|---|---|---|---|
| Labour | 33.70% | **234** | 36.00% | 233 | 35.85% | 411 |
| Conservative | 23.70% | **160** | 24.62% | 160 | 24.62% | 121 |
| Reform UK | 14.29% | 96 | 14.77% | 96 | 14.77% | 5 |
| Liberal Democrat | 12.22% | 78 | 12.00% | 78 | 12.00% | 72 |
| Green (all) | 6.75% | 41 | 6.31% | **44** | 6.77% | 4 |
| SNP | 2.52% | 17 | 2.62% | 16 | 2.46% | 9 |
| Plaid Cymru | 0.68% | 5 | 0.77% | 4 | 0.62% | 4 |
| SF / DUP / Alliance / UUP / SDLP / TUV | — | 5/4/3/3/2/1 | — | 5/4/3/3/2/1 | — | 7/5/1/1/2/1 |
| Speaker | 0.09% | 1 | — | 1 | — | 1 |
| Independents | in Others | 0 | — | 0 | — | 6 |

At the proposed 3% threshold the Scottish Greens (3.84%) and Welsh Greens (4.67%) qualify, lifting the Greens to 44 at the expense of one seat each from Labour, the SNP and Plaid. At 4% only the Welsh Greens enter (Green 42). No configuration returns Labour a majority: 234 of 650 is 92 short.

### 1.4 Disproportionality

Gallagher indices were computed under both residual conventions, because the choice dominates the result:

- **Including Others as a pseudo-party:** national 3.06 (regional range 1.54–5.39, London highest).
- **Excluding the unrepresentable residual:** national **1.03** (regional range 0.31–4.06).

The first convention largely measures the disenfranchisement of the sub-threshold and independent residual (3.5% of the national vote); the second measures disproportionality among represented groupings, which the mechanism drives to near-perfect. Both are legitimate; publications must state which is in use. For reference, 2024 under FPTP scores 23.75 (include-Others) and 23.23 (exclude-Others) on the same index, computed from the same data — so the mechanism removes about 87% of the mismatch under the first convention and about 96% under the second.

### 1.5 Robustness

A broadened perturbation test varied direct seats for every grouping with ≥8% regional vote share, a scenario seat, or an actual 2024 seat — a strict superset of the Green Paper's test, which varied only 2024 winners and therefore never allowed Reform or the Greens a direct seat outside the regions where they won one. Perturbations of ±2 per party, total L1 ≤ 4, constituency totals fixed:

- **Invariant final delegations** in Yorkshire & the Humber, East Midlands, West Midlands, East of England, London, South East and Scotland — including scenarios in which Reform wins direct seats there.
- Sensitive at the margin: North East (Lab 12–13, LD 1–2), North West (Lab 34–35, Reform 12–13), South West (Lab 13–14, Reform 7–8), Wales (Lab 12–14, Plaid 4–5, Con 5–6, LD 2–3), Northern Ireland (SF 5–6, SDLP 2–3, UUP 2–3, TUV 1–2).
- **National envelope** (sum of regional extremes, not a confidence interval): Lab 233–238, Con 159–160, Reform 94–96, LD 78–80, Green 41, SNP 17.

The headline property survives strengthening of the test: national party totals are close to invariant to which constituencies each party notionally wins, because compensation absorbs the difference. The mechanism, not the seat guesses, carries the result.

### 1.6 Design-parameter sensitivity

**Threshold ladder** (central anchors): 3% → Green 44 / SNP 16; 4% → Green 42; 5% → Green 41; 7% → Green collapses to 23 (below threshold everywhere except three regions) and Gallagher-excl-Others jumps from ~1.0 to 3.13. The system's proportionality claim is fragile above ~5%.

**Constituency-share ladder** (pure Hamilton anchors recompressed at each C, 5%): 45% → Lab 232; 50% → Lab 235; 55% → Lab 240; 60% → Lab 252, Reform 89, Gallagher-excl-Others 3.18, and four independents survive because compression is weaker. Compensation capacity degrades smoothly up to ~55% and visibly beyond it; 50:50 is a reasonable knee point, and 60:40 is materially less proportional.

**Allocation method:** replacing the greedy largest-deficit rule with Sainte-Laguë on the residual changes exactly one seat nationally — in Northern Ireland (SF +1, UUP −1). The method choice is consequential only at the NI margin, but in NI that margin is politically salient and the statute must fix the rule explicitly.

---

## Part 2 — Comparison of the two models

### 2.1 What was independent

The two exercises differ on every axis that matters for cross-validation: data path (author's manual regional transcription vs bottom-up aggregation of the checksummed Library file), implementation (author's script vs a clean-room build from the prose spec, with different internal structure and tie-break machinery), robustness design (2024-winners-only perturbation vs the broadened ≥8% superset), and metric conventions (single Gallagher convention vs both). The direct-seat central scenario is deliberately shared, since it is the object under test.

### 2.2 Points of agreement

- The Green Paper's ACTUAL_WINNERS table matches the official file exactly in all twelve regions.
- Eleven of twelve regional final delegations reproduce identically from reconciled data under the same scenario.
- The formula's mechanics — overhang retention, F-handling for the Speaker, threshold behaviour, tie handling — behave as documented; the earlier double-subtraction fix is confirmed correct.
- The threshold and ratio sensitivities run in the same direction with similar magnitudes.
- The robustness conclusion is not merely confirmed but strengthened: seven regions are invariant even when Reform and Green direct wins are admitted to the perturbation space, a scenario family the original test never explored.
- The workbook's variant claims (no-Speaker, London independent survives, Wales Labour-13) verify exactly, as does the Isle of Wight combined-margin claim (986 votes).

### 2.3 Points of divergence

1. **The published central scenario is off by one seat.** On reconciled data the identical scenario yields **Labour 234 / Conservative 160**, not 233/161. The flip is in the North West, where the Green Paper inputs are short 25,218 Labour votes (with ~20k misfiled into Others, plus an apparent Green↔LD swap of 2,166 and a Con↔Reform swap of ~2,117 in single constituencies). Correcting the data raises Labour's NW target from 33.296 to 33.631 and moves one compensatory seat from the Conservatives to Labour. The scrutiny report's assurance that the reconciliation gap leaves party-level allocation unchanged is therefore false at national level.
2. **The scrutiny "correction" to the North East was itself the error.** Against the current corrected Library edition, NE valid votes are 1,111,540 with party splits matching the *original* workbook exactly; the audit's "corrected official aggregate" of 1,111,625 does not exist in the current dataset and its four-party reshuffle degraded correct figures. The likely cause is source-version drift — precisely the failure mode the audit's own protocol (§15.5) warns against. Scotland, Wales and Northern Ireland inputs are exact in both models.
3. **Reconciliation magnitude.** The true gross divergence between the Green Paper inputs and the official file is ≈61k votes of real misallocation (NI classification differences aside), dominated by the North West — not the diffuse 6.5k net shortfall the audit reported. Net figures concealed offsetting errors.
4. **Gallagher convention.** The Green Paper's figures (national 3.05) are the include-Others convention; excluding the unrepresentable residual gives 1.03. Neither model is wrong, but the paper compares its figures with published FPTP/AMS values without stating the convention, and the include-Others values are dominated by the residual bucket rather than party-system disproportionality.

### 2.4 Verdict: do the models reinforce each other?

**Yes, decisively, at the level that matters — and the divergences sharpen rather than undermine the conclusion.** Two implementations built on different data paths and different code converge on the same mechanism behaviour, the same regional allocations in eleven of twelve regions, the same sensitivity structure, and a robustness property that survives a strictly harder test. That is the signature of a real result rather than a shared artefact. The divergences are all attributable to identified defects in the original *inputs and audit trail* — a mistranscribed North West, a phantom North East correction, an understated error census — not to the model or the mechanism. The corrected headline (Labour 234/650, a hung parliament by 92) differs by one seat from the published one and by nothing in substance. The proper conclusion is the standard one for replication work: the architecture is validated; every published number should be regenerated from the reconciled layer, at the proposed 3% threshold, before quotation.

---

## Part 3 — Suitability as an electoral system

The modelling supports the analysis but cannot settle it: everything below rests on a static counterfactual of 2024 votes cast under FPTP incentives. Under compensation, tactical voting largely unwinds, turnout incentives change in safe areas, and party strategy adapts; the true post-reform vote distribution is unobservable. Judgements are flagged as such.

### 3.a General suitability

**Strengths.**

- **Proportionality with a constituency link.** The mechanism delivers near-perfect proportionality among qualifying groupings (excl-Others Gallagher ≈1) while retaining a directly elected member for every constituency — the core MMP bargain, achieved here without a second national tier.
- **Single-vote design is gaming-resistant.** Because compensation derives from the one constituency vote, the decoy-list and split-ticket strategies that broke two-vote MMP in Albania (2005), Lesotho (2007) and Venezuela's *morochas* have no purchase: a party cannot separate its list entitlement from its constituency support. This is a genuine and under-appreciated strength. The cost is expressive: voters cannot back a local candidate and a different party, and a vote for a strong independent is a vote withdrawn from any grouping's compensation.
- **Scenario-invariance.** The demonstrated insensitivity of national totals to which constituencies each party wins means boundary drawing loses most of its partisan stakes — a structural answer to gerrymandering-adjacent pressure and to the bitterness of boundary reviews.
- **Overhang is bounded by design.** Fixing the house at T per region and absorbing overhang inside the regional pool avoids the German problem of a parliament that swells with overhang and levelling seats; the 2024 counterfactual generates only one to two overhang seats nationally.

**Weaknesses and risks.**

- **Independents are structurally excluded.** 2024 elected six independents on ~564k votes plus the Speaker; the central counterfactual returns none (bar the Speaker convention) unless they win a direct seat outright on doubled-size constituencies. A system that mechanically zeroes out the most electorally successful independent cohort in modern history has a legitimacy exposure that the Green Paper acknowledges but does not solve.
- **Sub-threshold votes are silently redistributed.** Because targets are computed over qualifying votes only, the residual's entitlement transfers pro rata to qualifying parties. In London the residual is 6.7% of the vote — larger than several represented parties. This is common to threshold-PR systems but should be stated, not implied.
- **The candidate-ranking rule imports pathology.** Filling regional seats by candidates' constituency vote *percentage* rewards packed safe seats and thin candidate fields over near-misses in crowded marginals, so a party's effective list order is set by where its vote happens to be concentrated — re-importing the geography the system exists to neutralise. The closest working precedent, Baden-Württemberg's best-loser (*Zweitmandat*) system, has long been criticised for related distortions. Ranking by absolute votes, or a modest party-ordered list, are the standard fixes; this needs resolving before any statute.
- **Largest-remainder mechanics.** The greedy static-deficit allocation is a largest-remainder method with floors and inherits the Alabama-paradox family of non-monotonicities; the Sainte-Laguë cross-check shows the practical stakes are one NI seat on 2024 data, but a statute should adopt a divisor method for defensibility, and must specify tie-breaks that are not alphabetical.
- **Threshold cliff-edges.** The 3%↔5% choice moves five seats among Greens, SNP, Plaid and Labour on identical votes; 7% collapses Green representation. Threshold-adjacent parties gain existential stakes in a single parameter, which is a lobbying magnet and a legitimacy risk at the boundary.

On general criteria — proportionality, resistance to strategic manipulation, bounded chamber size, retention of local representation — the design is a serious, coherent member of the MMP family, closer to best practice than to novelty, with its weakest components (candidate ranking, remainder mechanics, independents) all fixable without touching the architecture.

### 3.b Suitability for the United Kingdom specifically

- **Governability.** On 2024 votes no party approaches a majority: Labour 234 needs 92 more. Lab+LD reaches 312; Lab+LD+SNP 329 or Lab+LD+Green 353 clear 326; the right bloc (Con+Reform+DUP+UUP+TUV) musters 264. Every plausible parliament is a coalition or confidence-and-supply parliament. Whether that is a defect or the point is the central political question; the modelling only establishes that it is the certain consequence. Westminster's institutions — investiture-free government formation, the confidence convention, a permanent civil service — have handled hung parliaments (2010, 2017) but are culturally untuned to them as the norm.
- **The constituency link is halved, not kept.** 327 constituencies of ~145k electors roughly double current size — larger than any Westminster seat now, comparable to an Assemblée nationale circonscription. The Green Paper's "retains the link" claim is honest only with that qualifier attached; rural seats (a doubled Highland or mid-Wales constituency) bear the worst of it, and the whole-island Isle of Wight becomes a genuinely competitive ~1,000-margin seat, which cuts both ways.
- **Boundary machinery.** A full redraw of 650→327 seats is a parliament-length Boundary Commission programme; the scenario-invariance result is the strongest argument that the redraw's partisan stakes would be low, which is itself a selling point to whichever party fears the review.
- **Apportionment basis is a buried constitutional choice.** The Green Paper's regional entitlements match Hamilton apportionment on *total resident population*, not the statutory *registered electorate*: London 75→85, Scotland 57→52, Wales 32→30. The modelling shows the partisan effect is small (compensation tracks vote shares; SNP 17 vs 18 is the main sensitivity) — but "who counts for representation" is a first-order constitutional question that must be argued openly, not embedded as a modelling default.
- **Scotland and Wales.** The nationalist parties are the clearest structural losers versus FPTP-2015-style outcomes but gain proportional insurance against wipeouts (SNP 17 on 2024 votes vs 9 actual). The 3% threshold admits the Scottish and Welsh Greens at the SNP's and Plaid's direct expense — a predictable flashpoint in any devolved-nations negotiation, and one the paper's own tables mis-state.
- **Northern Ireland.** NI outcomes are the most method- and scenario-sensitive in the model: SF 5–6, UUP 2–3, SDLP 2–3, TUV 1–2 across the envelope, and the one seat that moves under Sainte-Laguë is an SF/UUP seat. Importing a Westminster-designed compensation formula into NI's community-balance politics, alongside STV for every other NI election, needs its own consultation; the unionist/nationalist aggregate happens to remain stable in the model, but a statute that lets a rounding rule decide a unionist–nationalist marginal will not be experienced as neutral.
- **Behavioural counterfactual, UK edition.** 2024 was an extreme tactical-voting election; under compensation the incentive to vote tactically largely disappears, which on any reasonable prior raises Reform and Green shares above the modelled 96 and 41–44 and lowers the two-party floor further. The modelled parliament is therefore best read as a conservative lower bound on fragmentation.
- **Adoption realism.** The system asks the two parties advantaged by FPTP to legislate away roughly 250 of their combined seats; the 2011 AV referendum is the cautionary precedent, and AV offered far less change. Suitability and adoptability are different questions; this report addresses only the first.

**Overall assessment.** As engineering, RDCR is sound and now twice-validated: proportional, gaming-resistant in its single-vote core, robust to boundary uncertainty, and repairable in its weak components. As a UK proposition, its honest prospectus is: permanent coalition politics, halved constituency granularity, a solved gerrymandering problem, a genuine independents problem, and three parameters — threshold, candidate ranking, apportionment basis — each of which quietly decides who governs and therefore belongs in the political argument, not the technical annex.

---

*Prepared as an independent scrutiny companion to the RDCR Green Paper. All figures derive from the reconciled dataset and are regenerable via `rdcr_independent_reproducibility.py`.*
