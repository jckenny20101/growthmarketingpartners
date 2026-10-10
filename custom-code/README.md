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

It calls `freeBusy`, then falls back to the public events feed. Any slot overlapping a busy
block is disabled, and a day with no free slots is disabled. If the request fails, all slots
stay available. Availability is checked in the browser only; the form does not enforce it.
