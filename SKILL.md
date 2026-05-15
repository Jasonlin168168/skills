---
name: product-agent-google-play-research
description: Run Xiaozhi Product Agent daily Google Play consumer app market research, filtering high-install low-rating apps, writing dashboard JSON, dated HTML/Markdown docs, and a concise WeChat summary.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [windows]
---

# product-agent-google-play-research

Use this skill when the user asks Product Agent to research Google Play market opportunities, find high-install low-rating consumer apps, or run the daily Product Agent report.

## Daily research contract

- Target store: Google Play public app metadata and public user-review themes only.
- Target apps: ordinary consumer apps, not security or network tooling.
- Install/download threshold: `>= 1,500,000`.
- Rating threshold: `< 3.5`.
- Time window: released or materially updated within the last 2 years.
- Final sample target: up to 100 qualified apps.
- Final opportunity output: exactly 10 product opportunities when evidence is sufficient.
- Output language: Chinese for dashboard summaries, dated documents, and WeChat delivery.

Allowed product groups:

1. `image/photo`: photo editor, collage maker, AI photo, image enhancer, camera utility, wallpaper, gallery organizer, passport photo, drawing/design helper.
2. `notes/productivity`: notes, memo, todo, calendar, planner, reminder, document scanner, PDF utility, clipboard, simple office/productivity helper.
3. `video/media`: video editor, video compressor, subtitle/caption tool, screen recorder, video player utility, slideshow maker, media converter.
4. `general utility`: calculator, file organizer, QR utility, timer, flashlight, unit converter, weather utility, measurement utility, simple productivity helper.

Excluded categories:

- VPN, proxy, network scanning, cybersecurity, password/authentication, privacy evasion, device management, gambling, adult content, medical, crypto/finance, or anything that would require operational instructions against third-party systems.

## Required artifacts

Dashboard JSON:

```text
C:\Users\lin\Desktop\codex\xiaozhi-dashboard\data\agent-reports\product-agent.json
```

Dated documents:

```text
C:\Users\lin\Desktop\codex\xiaozhi-dashboard\data\product-research-docs\<YYYY-MM-DD>\
  00-summary.md
  01-candidate-products.md
  02-review-pain-points.md
  03-market-possibility.md
  04-top-10-opportunities.md
```

The dashboard server automatically renders the Markdown files as sibling `.html` files when they are listed in the UI.

## Data rules

Every product row should include:

- `name`
- `appId`
- `publicAppUrl` using only `https://play.google.com/store/apps/details?id=<app_id>`
- `category`
- `productGroup`
- `installsBucket`
- rating or score
- rating count / review count when available
- release date and/or update date
- `dateFilterUsed`, `dateFilterValue`, `dateFilterCutoff`
- install evidence field such as `realInstalls`, `maxInstalls`, or `installEvidenceValue`
- bad-review themes and a short review summary

Install evidence rule:

- Public `1,000,000+` bucket alone is not enough.
- Accept `1,000,000+` only when collected evidence shows `>= 1,500,000`.
- Public `5,000,000+` and above qualifies.
- Explain bucket approximation in dashboard and dated docs.

## Workflow

1. Run the daily prompt script in `scripts/daily_prompt.py` or let the cron job inject it.
2. Search broadly enough to fill 100 qualified products if available.
3. Keep product groups diverse, aiming for at least 20 image/photo, 20 notes/productivity, and 20 video/media products when enough qualified apps exist.
4. Write the dashboard JSON as UTF-8.
5. Write the five dated Markdown documents as UTF-8.
6. Return a concise WeChat summary with status, count, top 3 opportunities, dashboard path, and blockers.

## If Hermes reaches max iterations

If the run collects temporary data but stops before final report writing:

1. Check:

```text
C:\Users\lin\Desktop\codex\xiaozhi-dashboard\tmp\product-research-<YYYY-MM-DD>\accepted_products_final.json
```

2. If it contains 100 qualified products, generate the dashboard JSON and dated documents from that file.
3. Mark the dashboard report `marketResearch.status` as `completed`.
4. Add a refresh warning noting that the cron hit `max_iterations` but the report was recovered from temp data.

## Cron wiring

The installed daily cron job should attach this skill and use:

```text
script: product_market_research_daily.py
schedule: 0 0 * * *
deliver: weixin:o9cq807JtFyo79ybbZSULmu5RJp4@im.wechat
```

The script under `~/.hermes/scripts/product_market_research_daily.py` is a thin wrapper that runs this skill's `scripts/daily_prompt.py`.
