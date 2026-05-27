# Remotion Lesson Pipeline Reference

## Fast Orientation

Run these first:

```powershell
rg -n "Composition|Lesson.*Duration" src\Root.tsx src
rg -n "VOICEOVER|Timing.generated|caption-" src scripts
Get-Content package.json
```

Look for:

- `src/Root.tsx`: registered composition ids and durations.
- `src/Lesson*.tsx`: layout, subtitle bar, agenda panel, brand card, outro frame.
- `src/lesson*Data.ts`: chapters, fallback captions, generated timing mapping.
- `scripts/generate-lesson*-edge-tts.py`: TTS voice, speech-only transforms, output files, caption count guards.
- `scripts/validate-lesson-*.mjs`: timing and artifact assertions.

## Batch TTS Regeneration

```powershell
foreach ($i in 1..8) {
  Write-Host "Generating lesson $i TTS..."
  python "scripts\generate-lesson$i-edge-tts.py"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

If a caption is added, update fixed caption-count guards in both:

- `scripts/generate-lessonN-edge-tts.py`
- `scripts/validate-lesson-name.mjs`

## Validation

```powershell
npx tsc --noEmit
foreach ($name in 'one','two','three','four','five','six','seven','eight') {
  node "scripts\validate-lesson-$name.mjs"
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
```

Then probe rendered files:

```powershell
foreach ($f in Get-ChildItem out\lesson*-human-1080p.mp4 | Sort-Object Name) {
  $probe = ffprobe -v error -select_streams v:0 `
    -show_entries stream=width,height,r_frame_rate `
    -show_entries format=duration -of csv=p=0 $f.FullName
  "$($f.Name),$probe,$($f.Length),$($f.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))"
}
```

## Rendering

Render one at a time for long videos:

```powershell
npx remotion render src/index.ts LessonOneAiCodingIntro out/lesson1-ai-coding-intro-human-1080p.mp4 --codec=h264 --crf=23 --concurrency=4 --log=error
```

If a render command times out or is interrupted:

```powershell
Get-Process node,ffmpeg -ErrorAction SilentlyContinue |
  Where-Object { $_.StartTime -gt (Get-Date).AddHours(-4) } |
  Select-Object ProcessName,Id,CPU,StartTime,Path

Get-ChildItem out\lesson*-human-1080p.mp4 |
  Sort-Object Name |
  Select-Object Name,Length,LastWriteTime
```

Wait for active Remotion `ffmpeg` processes before restarting the same lesson.

## Visual Checks

Extract representative frames:

```powershell
for ($i=1; $i -le 8; $i++) {
  ffmpeg -hide_banner -loglevel error -y -ss 00:00:25 `
    -i "out\lesson$i-..." -frames:v 1 "out\lesson$i-final-check.png"
}
```

For exact filenames, build a PowerShell array. Then create a contact sheet:

```powershell
ffmpeg -hide_banner -loglevel error -y -framerate 1 -start_number 1 `
  -i out\lesson%d-final-check.png `
  -vf "scale=480:270,tile=4x2" `
  -frames:v 1 out\all-lessons-final-check-contact.png
```

Open the contact sheet before reporting completion.

## Common Pitfalls

- Do not edit generated timing JSON by hand when captions changed; regenerate TTS.
- Do not claim "human voice" cloning. The current Edge TTS pipeline approximates a natural voice but is not a custom clone.
- If subtitles should display `AI` but TTS should pronounce it naturally, keep caption text as `AI` and transform only inside `speech_text(...)`.
- If adding an outro, add one final caption and use its start time to switch the visual scene.
- If source text shows mojibake, repair encoding before adding new content.
