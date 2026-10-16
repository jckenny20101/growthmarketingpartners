# Custom code

`site-behaviour.html` mirrors Elementor Custom Code snippet **#181**
("Site behaviour: mega menu and pipeline calculator", location `elementor_body_end`).
It also holds the home page hero video player (see below).
It is the source of truth on the site; this copy is a backup.

## Home page hero video

The video is the hero. The hero section (`5dbad2d1`) holds two Elementor blocks:

- `b7e40c21`: an empty div block that `heroVideo()` fills with a muted, looping, autoplaying video.
- `d2a7f1c3` (hero bar): the H1 "Pipeline that turns into revenue." (visually hidden, kept for search and screen
  readers), the Book a call / See how it works buttons, and `e8b5c6d9`, where `heroVideo()` puts the
  "Watch with sound" button. It restarts the video with sound and native controls.

The video is as wide as the screen allows while the whole frame stays visible:
`min(100% - 64px, (100svh - 120px) * 16/9)`. That keeps the burned-in captions on screen; a true edge-to-edge
crop would cut them off. On phones it runs edge to edge. Visitors who ask for reduced motion get the poster and no
autoplay. The old hero eyebrow, intro paragraph and Positioning/Conversion/Testing/Scaling chips were removed.

| Media | ID | Notes |
|-------|----|-------|
| `pipeline-that-turns-into-revenue.mp4` | 441 | Original upload: 1080p, 60 fps, 25.5 MB. Not used on the page. |
| `gmp-hero-720p.mp4` | 442 | Web copy, 720p, 30 fps, 3.2 MB (H.264 + AAC, fast start). |
| `gmp-hero-720p.webm` | 444 | Fallback for browsers without H.264 (VP9 + Opus), 3.5 MB. |
| `gmp-hero-poster.jpg` | 443 | Frame at 1.5 s, shown while loading. |

To swap the video, upload a new original and re-encode:

```
ffmpeg -i in.mp4 -vf "scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart gmp-hero-720p.mp4
ffmpeg -i in.mp4 -vf "scale=1280:-2,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -c:a libopus -b:a 96k gmp-hero-720p.webm
```

Then update `SRC`, `POSTER` and the `1:27` length in `heroVideo()`.

The pipeline calculator card (`a29dec7`, class `gc-calc`) now sits in its own section under the ticker
(`c41c0a7e`). `calculators()` finds it by class, so moving it needed no code change.

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
