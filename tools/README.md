# Website tools (gated calculators)

Ten tools, injected by `gt.js` (bundled with `gt.css` at the end of Custom Code snippet #181).
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

If a page section is deleted or rebuilt (new `data-id`), its tool stops appearing; update the anchor in `gt.js`.

## Gate and emails

- Form: **Website tools**, element `5bffcb2a` on draft page **284** ("Website tools form (system, do not publish)").
  Keep that page as a draft and don't delete it. Submissions appear under Elementor > Submissions.
- Fields sent: `gname`, `gemail`, `gcompany`, `tool`, `page`, `hlabel`, `headline`, `r1l`…`r5l`, `r1v`…`r5v`, `insight`, `inputs`.
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
