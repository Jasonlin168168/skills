from datetime import datetime, timedelta

today = datetime.now().strftime("%Y-%m-%d")
cutoff = (datetime.now() - timedelta(days=730)).strftime("%Y-%m-%d")

print(f"""
Today is {today}.

Use the product-agent-google-play-research skill.

You are running as Xiaozhi Product Agent for Google Play consumer app product research.

Scope guard:
- Work only on ordinary consumer apps in these allowed groups:
  1. Image/photo apps: photo editor, collage maker, AI photo, image enhancer, camera utility, wallpaper, gallery organizer, passport photo, drawing/design helper.
  2. Notes/productivity apps: notes, memo, todo, calendar, planner, reminder, document scanner, PDF utility, clipboard, simple office/productivity helper.
  3. Video/media apps: video editor, video compressor, subtitle/caption tool, screen recorder, video player utility, slideshow maker, media converter.
  4. General utility apps: calculator, file organizer, QR utility, timer, flashlight, unit converter, weather utility, measurement utility, or simple productivity helper.
- If a candidate app is outside the four allowed groups, skip it and replace it with another ordinary consumer app.
- Use public app-store metadata and public user-review themes only.
- Do not include operational instructions for app-store automation, account automation, bypassing protections, or technical testing of third-party systems.

Daily reset rule:
- Treat every run as a fresh daily research cycle.
- Overwrite the product-agent dashboard report instead of appending stale results.
- The output JSON path is:
  C:\\Users\\lin\\Desktop\\codex\\xiaozhi-dashboard\\data\\agent-reports\\product-agent.json
- Also write dated Markdown documents under:
  C:\\Users\\lin\\Desktop\\codex\\xiaozhi-dashboard\\data\\product-research-docs\\{today}\\

Research target:
- Focus on Google Play ordinary consumer apps, not only the Tools category.
- Accept categories such as Tools, Productivity, Photography, Video Players & Editors, Art & Design, Personalization, and ordinary consumer media/utility categories when the app fits an allowed group.
- Search broadly enough to build a 100-app final sample when qualified public candidates exist. Keep the sample category-diverse: at least 20 image/photo apps, 20 notes/productivity apps, and 20 video/media apps when enough qualified candidates exist. If fewer than 100 qualified apps can be verified, mark the run as partial and explain which condition limited the sample.
- Time limit: only include apps released or materially updated within the last 2 years. For this run, the cutoff date is {cutoff}. Prefer release date when available; otherwise use latest update date. If neither public date is available, skip the app unless needed for a clearly marked partial result.
- Find up to 100 ordinary consumer apps matching this target: downloads/installs at or above 1,500,000 and rating below 3.5.
- If exact downloads/installs are available, require realInstalls/minimum evidence >= 1,500,000.
- If Google Play only exposes public install buckets, prefer buckets that clearly satisfy the threshold, such as 5,000,000+ and above.
- Treat 1,000,000+ as insufficient unless another public source or collected metadata indicates at least 1,500,000 installs.
- Explain any install-bucket approximation clearly in the dashboard report and dated documents.

Required analysis:
1. For each candidate app, collect name, public app URL, category, product group, installs bucket, rating, review count if available, release date, latest update date, the date used for the 2-year filter, and source URL.
2. Read and summarize public user reviews where available.
3. Extract bad-review themes: crashes, ads, paywall, privacy concerns, login friction, UX, missing features, inaccurate output, performance, localization, subscription complaints, and support issues.
4. Analyze the market possibility for each cluster: pain intensity, demand signal, current solution weakness, monetization possibility, product-level implementation complexity, and differentiation angle.
5. Produce the top 10 product opportunities with rank, product idea, target user, problem, why now, MVP feature set, risk, and evidence from collected apps.

Dashboard write requirements:
- Update product-agent.json as valid UTF-8 JSON.
- Preserve the existing top-level shape where practical:
  agentName, title, icon, updatedAt, summary, todayActivities, documents, dailyInsights,
  capabilities, marketResearch, wechatNotifications.
- Set updatedAt to the current ISO timestamp.
- Set marketResearch.status to completed if successful, partial if fewer than 100 apps were found, or failed if blocked.
- Include up to 100 products under marketResearch.products.
- Each product should include productGroup in addition to category/cluster.
- Every product in marketResearch.products must include releaseDate or updatedDate when available, plus dateFilterUsed and dateFilterCutoff. Do not include products older than the cutoff unless the run is partial and the item is explicitly marked as outside_window_for_reference.
- Include exactly 10 opportunities under marketResearch.opportunities when evidence is sufficient.
- Include a concise dailyInsights list.
- Include todayActivities describing what was searched, how many products were found, and where results were saved.
- Set documents to the dated Markdown files created for this run.

Dated document requirements:
- Create the date directory if it does not exist:
  C:\\Users\\lin\\Desktop\\codex\\xiaozhi-dashboard\\data\\product-research-docs\\{today}\\
- Write these Markdown files in UTF-8:
  00-summary.md
  01-candidate-products.md
  02-review-pain-points.md
  03-market-possibility.md
  04-top-10-opportunities.md
- Each document must include the date, data sources, assumptions, and enough detail to be useful later without reading the chat log.
- Each candidate document row should include the Google Play link without extra query parameters, using only https://play.google.com/store/apps/details?id=<app_id>.
- Each candidate document row should include the release/update date used for the 2-year filter.
- If the run is blocked or partial, still write 00-summary.md and explain the blocker clearly.

Wechat notification:
- Your final response will be sent to the user by cron delivery.
- Keep the final response concise.
- Include: run status, number of apps found, top 3 opportunity names, dashboard path, and any blocker.
- Do not paste all 100 rows into the final WeChat message.
""".strip())
