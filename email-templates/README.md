# Email templates

## Book a diagnostic: internal notification

Sent to the team when someone submits the **Book a diagnostic** form on `/contact/`
(page 115, Elementor V4 form `20d1f704`).

- `book-a-diagnostic-notification.html`: readable source.
- `book-a-diagnostic-notification.min.html`: single-line version stored in the form's
  email "Message" setting. It is kept on one line so line breaks are not turned into `<br>`.

Form email settings:

| Setting   | Value |
|-----------|-------|
| To        | j.christopher.kenny@outlook.com |
| From      | ckenny@growthmarketingpartners.ca |
| Subject   | New call request from the website |
| From name | Growth Marketing Partners |
| Reply-To  | `[field id="7b072996"]` (the visitor's email) |
| Send as   | HTML |

Field shortcodes (`[field id="…"]` uses the element id of each input):

| Field | Element id |
|-------|------------|
| Name | `5cec3a85` |
| Work email | `7b072996` |
| Focus areas | `101eaee1` |
| Message | `630e0247` |
| Day | `2269bd84` |
| Time | `5397fd0e` |
| Backup day | `41d242c` |
| Backup time | `30e5dc5c` |

## Book a diagnostic: visitor confirmation

Wording mirrors the Contact page (30-minute call → one-page scope → kick-off) so the page and emails match.

Sent to the visitor (form action `email_2`) with the details of their request.

- `book-a-diagnostic-confirmation.html` / `.min.html`
- To: `[field id="7b072996"]` · Subject: "We have your call request"
- From name: Growth Marketing Partners · From and Reply-To: ckenny@growthmarketingpartners.ca

Form actions after submit: `collect-submissions`, `email`, `email_2`.

### Caveat

Elementor's editor and MCP tools strip HTML tags from the form's message setting when they
save it. The template was written straight into the page's `_elementor_data` post meta via the
WordPress REST API. If the contact page is re-saved in the Elementor editor and the email turns
into plain text again, re-apply both `.min.html` files the same way. Saving the form through the
Elementor MCP `manage-elements` tool also strips them, so re-apply after any such edit.

## Subjects and preview text

Elementor's atomic forms replace `[field id="…"]` in the message, To and Reply-To, but **not in the subject**,
so every subject is fixed text. Each template starts with a hidden preheader that uses field shortcodes, so the
inbox preview still shows the person and result (for example "Dana used the Discount leakage calculator.").
The preheader has no zero-width padding and no text colour matched to the background: both are classic
spam-filter signals, and Outlook/Hotmail was already sending these emails to Junk.

| Form | Internal subject | Visitor subject |
|------|------------------|-----------------|
| Book a diagnostic (`20d1f704`, page 115) | New call request from the website | We have your call request |
| Website tools (`5bffcb2a`, page 284) | New tool lead from the website | Your results from Growth Marketing Partners |
| Snapshot requests (`8258be06`, page 284) | New AI shortlist snapshot request | We have your AI shortlist snapshot request |

All emails set From to ckenny@growthmarketingpartners.ca. FluentSMTP sends them through a **Gmail / Google Workspace API**
connection (OAuth client "FluentSMTP" in Google Cloud project `gmp-website-261010`). Don't use an SMTP connection
(smtp.gmail.com): the Railway host blocks outgoing SMTP ports, so sends hang until they time out.

## If the emails arrive as a block of text

That means the form's stored message has lost its HTML. In October the booking form (page 115) was found holding
only the bare text of both templates; nothing in the page's revisions showed when it changed. The Elementor MCP
`manage-elements` tool is known to do this, and editing the form's email action in the Elementor editor may too.

Check all six emails against the templates in this folder, and put them back if they differ:

```
WP_USER=ckenny WP_APP_PASSWORD='…' python3 build/check_email_templates.py            # check only
WP_USER=ckenny WP_APP_PASSWORD='…' python3 build/check_email_templates.py --restore  # restore
```

Change the wording in these template files, then restore. Don't edit the message in the Elementor editor.
