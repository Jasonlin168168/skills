---
name: remotion-course-video-production
description: Use when creating, updating, rendering, or validating a narrated multi-lesson Remotion course video series with synced TTS audio, captions, slide layouts, outro frames, and 1080p MP4 outputs.
---

# Remotion Course Video Production

## Use This For

Use this skill when the user asks to produce or revise course videos in a Remotion project, especially requests like:

- turn lesson outlines into narrated videos
- keep audio, captions, and page transitions synchronized
- adjust shared slide layout across many lesson videos
- regenerate TTS and timing files
- add intro or outro frames
- render and validate 1080p lesson MP4s

This skill is specialized for **multi-lesson course-video production**, using the 8-video AI coding course pipeline as its concrete default pattern. It can still guide a single Remotion lesson video, but its strongest use case is keeping a series consistent across layout, TTS, captions, timing, output names, and validation.

This skill is for scripted Remotion compositions. It does not generate real-person or AI-avatar footage unless a separate avatar pipeline already exists.

## Core Workflow

1. Inspect the project before editing.
   - Read `src/Root.tsx` for composition ids.
   - Find lesson components with `rg -n "Lesson.*React.FC|Composition" src`.
   - Find lesson data and generated timing files with `rg -n "Timing.generated|VOICEOVER|caption-" src scripts`.
   - Check render scripts in `package.json`.

2. Identify the source of truth.
   - Lesson narration should live in `src/lesson*Data.ts` caption text.
   - Generated timing should live in `src/lesson*Timing.generated.json` and `public/lesson*-timing.json`.
   - Final audio should live under `public/lesson*-voice-human.mp3`.
   - Final videos usually live under `out/`.

3. Make content or layout changes.
   - For narration changes, edit the caption text in `lesson*Data.ts`.
   - For shared visual changes, update every `src/Lesson*.tsx` consistently.
   - For pronunciation differences, keep the displayed caption text unchanged and transform speech-only text in the TTS script.
   - For end cards, add a final caption and make the component switch to an outro scene when the final caption starts.

4. Regenerate audio and timing.
   - Run each `scripts/generate-lesson*-edge-tts.py`.
   - If caption counts changed, update fixed count guards in the matching generator and validator scripts.
   - Confirm the last caption, duration, and voiceover filename in the generated JSON.

5. Validate before rendering.
   - Run `npx tsc --noEmit`.
   - Run every `scripts/validate-lesson-*.mjs`.
   - Use `scripts/audit_remotion_lessons.mjs` from this skill if copied into the project.

6. Render final videos.
   - Render one composition at a time when videos are long.
   - Use 1080p Remotion compositions and H.264 output:
     `npx remotion render src/index.ts <CompositionId> <out-file> --codec=h264 --crf=23 --concurrency=4 --log=error`
   - If a long render is interrupted, inspect `Get-Process node,ffmpeg` and output timestamps before restarting.

7. Verify final artifacts.
   - Probe MP4s with `ffprobe` for `1920x1080`, `30/1`, and duration.
   - Extract contact-sheet screenshots from representative frames and the final outro frame.
   - Open the contact sheet visually before claiming completion.

## Project Conventions

For the 8-lesson AI coding course in `C:\Users\lin\Desktop\codex\video`, the expected composition and output mapping is:

| Lesson | Composition | Output |
| --- | --- | --- |
| 1 | `LessonOneAiCodingIntro` | `out/lesson1-ai-coding-intro-human-1080p.mp4` |
| 2 | `LessonTwoAiCodingTools` | `out/lesson2-ai-coding-tools-human-1080p.mp4` |
| 3 | `LessonThreeAiCodingWorkflow` | `out/lesson3-ai-coding-workflow-human-1080p.mp4` |
| 4 | `LessonFourPromptWriting` | `out/lesson4-ai-requirement-prompts-human-1080p.mp4` |
| 5 | `LessonFiveFirstWebProject` | `out/lesson5-ai-content-agent-homepage-human-1080p.mp4` |
| 6 | `LessonSixCoreInteraction` | `out/lesson6-ai-content-agent-interaction-human-1080p.mp4` |
| 7 | `LessonSevenDebugPractice` | `out/lesson7-debug-practice-human-1080p.mp4` |
| 8 | `LessonEightAgentWorkflow` | `out/lesson8-agent-workflow-human-1080p.mp4` |

## Quality Bar

Before final response, verify all applicable requirements with commands:

- TypeScript compiles.
- Every lesson validator passes.
- Every final MP4 is `1920x1080` and `30fps`.
- Captions map one-to-one to generated audio timing.
- Any requested shared layout change appears in all 8 `Lesson*.tsx` files.
- Any requested outro or intro appears in extracted video frames, not only in source code.

## References

Read `references/remotion-lesson-pipeline.md` for command templates, render recovery steps, and common pitfalls.

## Scripts

Copy `scripts/audit_remotion_lessons.mjs` into the Remotion project root and run:

```powershell
node scripts\audit_remotion_lessons.mjs
```

Use it as a quick consistency check; it complements but does not replace TypeScript, validators, `ffprobe`, and visual screenshots.
