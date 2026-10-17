# Custom code

`site-behaviour.html` mirrors Elementor Custom Code snippet **#181**
("Site behaviour: mega menu and pipeline calculator", location `elementor_body_end`).
It also holds the home page hero video player (see below).
It is the source of truth on the site; this copy is a backup.

## Home page hero video

The video is the hero, full width and sized so the whole frame fits under the 72px header (its orange bottom rule is drawn inside that height) without scrolling.
It trims up to 12% of the frame's height (`object-position: 50% 79%`, so about 9.5% off the top and 2.5% off the
bottom; the video's top 10.8% and bottom 3.1% are always empty). On very wide, short screens it adds side margins
instead of trimming more. If a new video puts text closer to the top or bottom edge, re-check this. The hero section (`5dbad2d1`) holds two Elementor blocks:

- `b7e40c21`: an empty div block that `heroVideo()` fills with a muted, looping, autoplaying video. The video is
  silent, so there is no sound button. Visitors who ask for reduced motion get the poster with play controls.
- `d2a7f1c3` (hero bar): the H1 "Pipeline that turns into revenue." (visually hidden, kept for search and screen
  readers) and the Book a call / See how it works buttons.

The old hero eyebrow, intro paragraph and Positioning/Conversion/Testing/Scaling chips were removed.

`heroVideo()` picks the file by screen size: full HD when `innerWidth × devicePixelRatio ≥ 1400` (laptops, desktops,
tablets), otherwise the 720p copy (phones). All copies are silent; the video always plays muted.

| Media | ID | Notes |
|-------|----|-------|
| `pipeline-that-turns-into-revenue.mp4` | 441 | Original upload: 1080p, 60 fps, 25.5 MB. Not used on the page. |
| `gmp-hero-1080p.mp4` | 446 | Laptops and desktops: 1080p, 60 fps, H.264 CRF 18, no audio, 7.7 MB. Matches the original (SSIM 0.9995). |
| `gmp-hero-720p-hq.mp4` | 447 | Phones: 720p, 30 fps, H.264 CRF 20, no audio, 3.4 MB. |
| `gmp-hero-720p.webm` | 444 | Fallback for browsers without H.264 (VP9), 3.5 MB. |
| `gmp-hero-poster-1080p.jpg` / `gmp-hero-poster.jpg` | 448 / 443 | Frame at 1.5 s, shown while loading. |
| `gmp-hero-720p.mp4` | 442 | Earlier low-bitrate copy, no longer used. |

To swap the video, upload a new original and re-encode:

```
ffmpeg -i in.mp4 -an -c:v libx264 -preset slow -crf 18 -tune animation -pix_fmt yuv420p -movflags +faststart gmp-hero-1080p.mp4
ffmpeg -i in.mp4 -vf "scale=1280:-2:flags=lanczos,fps=30" -an -c:v libx264 -preset slow -crf 20 -tune animation -pix_fmt yuv420p -movflags +faststart gmp-hero-720p-hq.mp4
ffmpeg -i in.mp4 -vf "scale=1280:-2,fps=30" -an -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 gmp-hero-720p.webm
```

Then update the file names in `heroVideo()`.

The pipeline calculator card (`a29dec7`, class `gc-calc`) now sits in its own section under the ticker
(`c41c0a7e`). `calculators()` finds it by class, so moving it needed no code change.

## Contact page (book a call) layout

The hero grid (`6c2d2b4`) has three children: the intro (`4b6fd0dc`, with the trust checklist `1c7d58a0`), the form
card (`3f3c5213`) and "What happens next" (`9b625390`). On desktop the snippet places the form card in the right
column beside both; on tablet and phone the natural order puts the form straight after the intro. `contactAnchor()`
gives the form card `id="request-a-call"` so any "Book my free call" button can link to `#request-a-call`.

Every proof point on the page is copied from claims already published on the About and home pages
(20 years, $100s of millions in pipeline, PE and VC, the companies and investors, 100+ years, twenty clients a year).
Add client results only with real numbers and the client's permission.

## Insights articles: table of contents

`articleToc()` runs on single posts (`body.single-post`). It finds the article body (the section with the most H2s),
gives each H2 an id, and lays the body out as a grid: an "On this page" list in a 240px left column, sticky while
scrolling and highlighting the current section, then the 680px article column. Below 1025px the list becomes a
collapsible box above the article. It needs no per-post setup: any new guide with two or more H2s gets one.
The /insights/ index and pages are untouched.

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
