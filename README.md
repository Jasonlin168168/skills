# Product Agent Google Play Research Skill

Hermes skill for Xiaozhi Product Agent daily Google Play consumer app market research.

It targets ordinary consumer apps with:

- downloads/installs `>= 1,500,000`
- rating `< 3.5`
- release or material update within the last 2 years
- allowed groups: image/photo, notes/productivity, video/media, and general utility

The daily prompt script is:

```text
scripts/daily_prompt.py
```

In the local Hermes setup, the cron wrapper is:

```text
C:\Users\lin\.hermes\scripts\product_market_research_daily.py
```

The scheduled job should attach this skill:

```text
product-agent-google-play-research
```
