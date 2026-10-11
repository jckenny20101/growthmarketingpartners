# Content added in October 2026

## Pages

- **/benchmarks/** (page 285): five themed sections of sourced figures, built by `build/benchmarks.py` from the home page research section. Re-check figures quarterly.
- **/tools/** (page 288): the tools hub, rendered by `gt.js` after the hero (`data-id="7001700a"`).
- Footer: "Free tools" and "Benchmarks" added to the Company column.

## Guides (posts, shown on /insights/)

- **Buyers pick before they call. Here is how to be the pick.** (Positioning and messaging): `/2026/10/11/buyers-pick-before-they-call/`. Source text: `content/guides/g1.json`.
- **The no-decision problem: why good deals stall, and how to keep them moving** (Conversion and testing): `/2026/10/11/the-no-decision-problem/`. Source text: `content/guides/g2.json`.
- **Pricing in the agent era: what replaces the seat** (Pricing and packaging): `/2026/10/11/pricing-in-the-agent-era/`. Source text: `content/guides/g3.json`.
- **The 19-minute window: fixing fintech onboarding drop-off** (Conversion and testing): `/2026/10/11/the-19-minute-window-fintech-onboarding/`. Source text: `content/guides/g4.json`.

Each guide was built by `content/guides/make.py` from the privacy policy layout (hero, sections, sources, CTA).
Figures in the guides and on /benchmarks/ were checked against the publishers' own releases where reachable (6sense via Business Wire, G2, Ebsta and Pavilion, Gartner, Benchmarkit, SaaS Capital, Fenergo); Forrester figures come from Digital Commerce 360 coverage, Signicat and JOLT figures from secondary summaries.

## Research consent

Every tool gate (except the AI shortlist snapshot request) has an optional, unticked box to include anonymised numbers in benchmark research. It is sent as `research` (Yes/No), shown in the lead email, never remembered in the browser, and covered in the privacy policy.
