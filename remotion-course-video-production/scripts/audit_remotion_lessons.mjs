import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = process.cwd();

const lessons = [
  ['1', 'one', 'lesson1-ai-coding-intro-human-1080p.mp4'],
  ['2', 'two', 'lesson2-ai-coding-tools-human-1080p.mp4'],
  ['3', 'three', 'lesson3-ai-coding-workflow-human-1080p.mp4'],
  ['4', 'four', 'lesson4-ai-requirement-prompts-human-1080p.mp4'],
  ['5', 'five', 'lesson5-ai-content-agent-homepage-human-1080p.mp4'],
  ['6', 'six', 'lesson6-ai-content-agent-interaction-human-1080p.mp4'],
  ['7', 'seven', 'lesson7-debug-practice-human-1080p.mp4'],
  ['8', 'eight', 'lesson8-agent-workflow-human-1080p.mp4'],
];

const outroText = '恭喜你已经学习完这节课，坚持下去，一定会有收获的';
const failures = [];

function requireFile(file) {
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${path.relative(root, file)}`);
    return false;
  }
  return true;
}

for (const [number, name, videoName] of lessons) {
  const timingPath = path.join(root, 'src', `lesson${number}Timing.generated.json`);
  const publicTimingPath = path.join(root, 'public', `lesson${number}-timing.json`);
  const audioPath = path.join(root, 'public', `lesson${number}-voice-human.mp3`);
  const videoPath = path.join(root, 'out', videoName);
  const validatorPath = path.join(root, 'scripts', `validate-lesson-${name}.mjs`);

  for (const file of [timingPath, publicTimingPath, audioPath, videoPath, validatorPath]) {
    requireFile(file);
  }

  if (fs.existsSync(timingPath)) {
    const timing = JSON.parse(fs.readFileSync(timingPath, 'utf8'));
    const last = timing.captions?.[timing.captions.length - 1];
    if (!last) failures.push(`Lesson ${number}: missing captions`);
    if (last && last.text !== outroText) {
      failures.push(`Lesson ${number}: final caption is not the standard outro`);
    }
    if (typeof timing.durationSeconds !== 'number' || timing.durationSeconds <= 0) {
      failures.push(`Lesson ${number}: invalid timing duration`);
    }
  }

  if (fs.existsSync(videoPath)) {
    const probe = spawnSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height,r_frame_rate',
        '-show_entries',
        'format=duration',
        '-of',
        'json',
        videoPath,
      ],
      {encoding: 'utf8'},
    );

    if (probe.status !== 0) {
      failures.push(`Lesson ${number}: ffprobe failed`);
    } else {
      const meta = JSON.parse(probe.stdout);
      const stream = meta.streams?.[0];
      if (stream?.width !== 1920 || stream?.height !== 1080) {
        failures.push(`Lesson ${number}: expected 1920x1080, got ${stream?.width}x${stream?.height}`);
      }
      if (stream?.r_frame_rate !== '30/1') {
        failures.push(`Lesson ${number}: expected 30fps, got ${stream?.r_frame_rate}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ok: false, failures}, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ok: true, lessons: lessons.length}, null, 2));
