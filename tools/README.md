# Website tools (gated calculators)

Twenty tools (19 in `gt.js` plus the home page in-house calculator), listed on the **/tools/** hub (page 288). Ten were the first release; injected by `gt.js` (bundled with `gt.css` at the end of Custom Code snippet #181).
Each one mounts after (or inside) an Elementor element by `data-id`, asks for name and work email
before showing results, then posts the results to the **Website tools** form.

| Tool | Page | Placed after |
|------|------|--------------|
| Go-to-market health check (12-question quiz, six areas) | /services/go-to-market-diagnostic/ | "Six places pipeline usually leaks" (`37eb8e98`) |
| Funnel leak finder | /services/pipeline-programs/ | "Fix the worst step first" (`1941beab`) |
| CAC payback by program | /services/pipeline-programs/ | "Four programs, each with its own target" (`68a3567f`) |
| Next-dollar check (marginal cost per opp) | /services/pipeline-programs/ | "Three rules before budget goes up" (`325b640a`) |
| Segment scorecard | /services/segments-icp/ | "We score every segment on four things" (`49d7735b`) |
| Discount leakage calculator | /services/pricing-packaging/ | "When pricing is the problem…" (`2a5401cf`) |
| Price increase simulator | /services/pricing-packaging/ | "Four numbers we watch…" (`798bd72e`) |
| Sales capacity planner | /industries/software-saas/ | "Four problems we see…" (`27837bf6`) |
| Fintech onboarding calculator | /industries/fintech/ | end of the consumer tab (`5fd2f7a8`) |
| Sandbox to live calculator | /industries/fintech/ | end of the B2B tab (`cbf5f22`) |
| SaaS efficiency benchmark | /services/go-to-market-diagnostic/ | "You probably need one if…" (`6420b47e`) |
| AI shortlist snapshot (request, not a calculator) | /services/segments-icp/ | "Buyers decide before they talk to you…" (`3676712`) |
| No-decision risk scorecard | /services/segments-icp/ | "Competition is stiff…" (`665069dd`) |
| Pricing model selector | /services/pricing-packaging/ | "Research first, then design…" (`53a666a7`) |
| AI feature margin calculator | /services/pricing-packaging/ | after the pricing model selector |
| Forecast accuracy checker | /services/pipeline-programs/ | "Every change ships as a test" (`be24d5e`) |
| Net revenue retention calculator | /industries/software-saas/ | "From diagnosis to a working pipeline engine…" (`43592b1b`) |
| Onboarding friction audit | /industries/fintech/ | end of the consumer tab, after the onboarding calculator |
| Integration time-to-value planner | /industries/fintech/ | end of the B2B tab, after the sandbox to live calculator |

Every tool can be linked directly as `/page/#gt-<key>`; links into a Fintech tab switch to that tab. The hub renders after the hero with
`data-id="7001700a"` on /tools/.

If a page section is deleted or rebuilt (new `data-id`), its tool stops appearing; update the anchor in `gt.js`.

## Gate and emails

- Form: **Website tools**, element `5bffcb2a` on draft page **284** ("Website tools form (system, do not publish)").
  Keep that page as a draft and don't delete it. Submissions appear under Elementor > Submissions.
- Fields sent: `gname`, `gemail`, `gcompany`, `tool`, `page`, `hlabel`, `headline`, `r1l`…`r5l`, `r1v`…`r5v`, `insight`, `inputs`.
- The visitor email's subject, headline and intro come from fields `esubj`, `etitle`, `eintro` (defaults: "Your … results",
  "Here are your results, NAME.", and the original intro). The AI shortlist snapshot sets its own.
- Emails: lead alert to j.christopher.kenny@outlook.com (`email-templates/tools-lead.min.html`,
  subject `Tool lead: [name] · [tool]`, reply-to the visitor) and results to the visitor
  (`email-templates/tools-results.min.html`, subject `Your [tool] results`).
  Both were written straight into `_elementor_data` (see the caveat in `email-templates/README.md`).
- The visitor's name, email and company are remembered in their browser (`localStorage`) to prefill the next tool's gate.
- If the email can't be sent, results still show, with a note.

## Assumptions to review

- Funnel leak finder targets (editable on the page): visit to demo request 2%, request to meeting held 70%,
  meeting to qualified 50%, qualified to closed-won 25%.
- Sales capacity planner assumes new reps ramp evenly (half productive during ramp).
- Next-dollar check verdicts follow the page's rule 3; "room to scale" also requires the average to be within target.

## Home page: build vs. partner calculator

`inhouse()` in `gt.js` turns the "Hiring in-house" card on the home page (section `38800e20`) into a live
calculator. It works on the existing Elementor elements rather than adding a new section:

- Each role's salary becomes an input (defaults: the Robert Half midpoints already on the page), with a
  checkbox to include or drop the role. The heading counts included roles ("What a four-person…").
- Benefits and payroll default to 42.86% of salary (wages = 70% of total compensation, per the BLS note),
  recruiting fees to 20%.
- The first-year total, the benefits and recruiting lines, and the dark comparison card (team total,
  one VP hire all-in, bar widths) update as people type. The Growth Marketing Partners bar stays at 25% of
  the team cost, matching "about 75% less"; no GMP price is shown.
- Numbers are not gated (they were already public). "Email me this breakdown" uses the same gate and
  Website tools form, with the tool name "In-house team cost calculator".
- Element ids it relies on: roles `5d3a80e3/dd1530b`, `1af52347/1897d4e5`, `fefc3d4/649af03f`,
  `68d7e80c/402a71c9`, `5ea75ab5/333d4db`; benefits `5aefb0dd/11e9dd50`; recruiting `791f4c25/765ae815`;
  total `2f8b5944`; heading `5d681796`; eyebrow `6e2c97f1`; comparison `2107fe2e`, `2a32fcf5`, `7221d3e`;
  bars `7a3159fa`, `46ff16`, `6c178c83`; note `5d4bb9f7`. If any are rebuilt, the card falls back to static.
