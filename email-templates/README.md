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
| Subject   | `New diagnostic request: [field id="5cec3a85"]` |
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

### Caveat

Elementor's editor and MCP tools strip HTML tags from the form's message setting when they
save it. The template was written straight into the page's `_elementor_data` post meta via the
WordPress REST API. If the contact page is re-saved in the Elementor editor and the email turns
into plain text again, re-apply the `.min.html` file the same way.
