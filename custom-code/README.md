# Custom code

`site-behaviour.html` mirrors Elementor Custom Code snippet **#181**
("Site behaviour: mega menu and pipeline calculator", location `elementor_body_end`).
It is the source of truth on the site; this copy is a backup.

## Booking slots and Google Calendar

`scheduler()` turns the Contact form's day and time fields into slot buttons
(Monday to Friday, 12 to 1, 3 to 4 and 4 to 5 pm Mountain Time, next 10+ weekdays).

Set `GCAL={id:'…',key:'…'}` to grey out slots that are busy on a Google Calendar:

- `id`: the calendar ID (for a primary calendar, the Gmail address). The calendar must be
  shared publicly as **See only free/busy (hide details)**.
- `key`: a Google Cloud API key with the Google Calendar API enabled, restricted to the
  Calendar API and to `https://www.growthmarketingpartners.ca/*` and
  `https://growthmarketingpartners.ca/*` referrers.

Current setup: calendar `ckenny@growthmarketingpartners.ca`, key "GMP website calendar" in Google Cloud
project `gmp-website-261010` (browser key, restricted as above; it is public in the page source by design).

It calls `freeBusy`, then falls back to the public events feed. Any slot overlapping a busy
block is disabled, and a day with no free slots is disabled. If the request fails, all slots
stay available. Availability is checked in the browser only; the form does not enforce it.

## Caution: Elementor MCP `manage-elements`

Every `manage-elements` save rewrites the whole document. In testing on 2026-10-10 it:

- dropped every style variant's `custom_css` on the home page (58 entries, restored from a REST backup);
- stripped HTML from the form's email message settings (see `email-templates/README.md`);
- silently ignored `background-size`, `background-position` and `background-repeat` for gradient
  backgrounds (why the timeline rule fix lives in the custom code).

- dropped `margin-inline: auto` on the Fintech page's tab menu (fixed in the custom code). Note that atomic
  tab parts have no `elementor-element-<id>` class; target them with `[data-id="…"]`.

Before using it, back up `_elementor_data` via `GET /wp-json/wp/v2/pages/<id>?context=edit`, and diff after.
Small text changes are safer written directly into `_elementor_data` through the REST API.
