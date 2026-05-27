# Remotion Single-Lesson Pipeline Reference

## Fast Orientation

Run these first:

```powershell
rg -n "Composition|durationInFrames" src\Root.tsx src
rg -n "VOICEOVER|Timing.generated|caption-" src scripts
Get-Content package.json
```

Find the one target composition and its supporting files:

- `src/Root.tsx`: composition id and duration.
- `src/Lesson*.tsx` or equivalent: page layout, subtitle bar, outro frame.
- `src/lesson*Data.ts` or equivalent: chapters, captions, timing mapping.
- `scripts/generate-*-tts.py`: voice, speech-only transforms, output audio, timing JSON.
- `scripts/validate-*.mjs`: checks for timing and artifacts.

## TTS Regeneration

Run the target TTS script, for example:

```powershell
python scripts\generate-lesson1-edge-tts.py
```

If a caption is added or removed, update any fixed caption-count guards in:

- the generator script
- the validator script

Do not hand-edit generated timing JSON after narration changes. Regenerate it.

## Validation

```powershell
npx tsc --noEmit
node scripts\validate-lesson-one.mjs
```

Probe the rendered file:

```powershell
ffprobe -v error -select_streams v:0 `
  -show_entries stream=width,height,r_frame_rate `
  -show_entries format=duration `
  -of csv=p=0 out\lesson1-course-video-1080p.mp4
```

## Rendering

```powershell
npx remotion render src/index.ts LessonOneAiCodingIntro out\lesson1-course-video-1080p.mp4 --codec=h264 --crf=23 --concurrency=4 --log=error
```

If a render is interrupted:

```powershell
Get-Process node,ffmpeg -ErrorAction SilentlyContinue |
  Where-Object { $_.StartTime -gt (Get-Date).AddHours(-4) } |
  Select-Object ProcessName,Id,CPU,StartTime,Path

Get-Item out\lesson1-course-video-1080p.mp4 |
  Select-Object Name,Length,LastWriteTime
```

Wait for an active Remotion `ffmpeg` process before restarting the same render.

## Visual Checks

Extract content and final frames:

```powershell
ffmpeg -hide_banner -loglevel error -y -ss 00:00:25 `
  -i out\lesson1-course-video-1080p.mp4 `
  -frames:v 1 out\lesson1-content-check.png

ffmpeg -hide_banner -loglevel error -y -sseof -3 `
  -i out\lesson1-course-video-1080p.mp4 `
  -frames:v 1 out\lesson1-outro-check.png
```

Open the images before reporting completion.

## Common Pitfalls

- Do not describe a Remotion video as real-person or digital-human output unless the project includes that pipeline.
- If subtitles should display `AI` but TTS should pronounce it as separate letters, keep caption text as `AI` and transform only inside `speech_text(...)`.
- If adding an outro, use one final caption for narration and a visual scene that starts at that caption's start frame.
- If source Chinese text is mojibake, repair encoding before extending the lesson.
- Avoid overloading slides with full narration; slides should support the spoken explanation.
