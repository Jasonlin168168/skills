---
name: remotion-course-video-production
description: Use when creating, updating, rendering, or validating one narrated Remotion course video with TTS audio, synced captions, slide pages, optional outro frame, and a 1080p MP4 output.
---

# Remotion Course Video Production

## Use This For

Use this skill when the user asks to make or revise **one** course video in a Remotion project, especially:

- turn one lesson outline or teaching script into a narrated video
- create a Remotion slide-style lesson composition
- generate TTS audio and caption timing for the lesson
- keep page content, subtitles, and narration synchronized
- add a centered intro or outro frame
- render and validate one 1080p MP4

This skill captures the production process from the AI coding course work, but it is scoped to one course video at a time: one lesson data file, one Remotion component, one TTS script, one validator, one MP4 output.

This skill is for scripted Remotion compositions. It does not create real-person or AI-avatar footage unless the project already has a separate avatar pipeline.

## Single-Video Workflow

1. Inspect the Remotion project.
   - Read `src/Root.tsx` to find the target composition id.
   - Read `package.json` to confirm Remotion scripts and dependencies.
   - Search lesson files with `rg -n "Composition|VOICEOVER|Timing.generated|caption-" src scripts`.

2. Establish the one-video file set.
   - Component: for example `src/LessonOne.tsx`.
   - Lesson data: for example `src/lessonOneData.ts`.
   - TTS generator: for example `scripts/generate-lesson1-edge-tts.py`.
   - Validator: for example `scripts/validate-lesson-one.mjs`.
   - Audio: for example `public/lesson1-voice-human.mp3`.
   - Timing: for example `src/lesson1Timing.generated.json` and `public/lesson1-timing.json`.
   - Output: for example `out/lesson1-course-video-1080p.mp4`.

3. Convert the lesson script into visual structure.
   - Split narration into caption-sized segments.
   - Group segments into chapters or scenes.
   - Build page views for concepts, comparisons, workflows, demos, summaries, and homework.
   - Keep visual text shorter than narration; do not paste full narration onto slides.

4. Implement synchronized subtitles.
   - Subtitle text should come from the same caption data used for TTS.
   - Use generated timing JSON to map caption start/end seconds to frames.
   - If the user asks for single-line subtitles, use centered `whiteSpace: 'nowrap'` plus responsive font sizing.

5. Generate narration and timing.
   - Run the relevant TTS script.
   - If caption count changed, update fixed count guards in both generator and validator.
   - For pronunciation-only changes, keep displayed text unchanged and transform speech text inside the TTS script.

6. Add optional outro frame.
   - Add one final caption with the outro narration.
   - Make the component switch to an outro scene when the final caption starts.
   - The outro frame text can be three centered lines while the subtitle remains the exact narrated sentence.

7. Validate before render.
   - Run `npx tsc --noEmit`.
   - Run the target validator script.
   - Optionally copy `scripts/audit_remotion_lesson.mjs` from this skill into the project and run it against the one output.

8. Render and inspect.
   - Render with H.264:
     `npx remotion render src/index.ts <CompositionId> <out-file> --codec=h264 --crf=23 --concurrency=4 --log=error`
   - Probe with `ffprobe` for `1920x1080`, `30/1`, and expected duration.
   - Extract at least one content frame and one outro/final frame, then visually inspect them.

## Quality Bar

Before saying the video is complete, verify:

- TypeScript compiles.
- The target timing/validator script passes.
- The final MP4 exists and is `1920x1080`, `30fps`.
- Captions map one-to-one to generated audio timing.
- The requested page layout appears in an extracted frame.
- The requested intro/outro appears in an extracted frame if applicable.
- The narration and visible subtitles use the same caption source.

## References

Read `references/remotion-lesson-pipeline.md` for command templates and common recovery steps.

## Script

Copy `scripts/audit_remotion_lesson.mjs` into a Remotion project and run it with explicit paths:

```powershell
node scripts\audit_remotion_lesson.mjs `
  --video out\lesson1-course-video-1080p.mp4 `
  --timing src\lesson1Timing.generated.json `
  --audio public\lesson1-voice-human.mp3 `
  --outro "恭喜你已经学习完这节课，坚持下去，一定会有收获的"
```

The script is a quick consistency check. It complements TypeScript, project validators, `ffprobe`, and visual screenshots.
