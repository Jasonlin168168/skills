import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    result[key.slice(2)] = argv[i + 1];
    i += 1;
  }
  return result;
}

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const failures = [];

function requiredPath(name) {
  if (!args[name]) {
    failures.push(`Missing --${name}`);
    return null;
  }
  const file = path.resolve(root, args[name]);
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${args[name]}`);
    return null;
  }
  return file;
}

const videoPath = requiredPath('video');
const timingPath = requiredPath('timing');
const audioPath = requiredPath('audio');
const outroText = args.outro;

if (timingPath) {
  const timing = JSON.parse(fs.readFileSync(timingPath, 'utf8'));
  if (!Array.isArray(timing.captions) || timing.captions.length === 0) {
    failures.push('Timing JSON has no captions');
  } else {
    const last = timing.captions[timing.captions.length - 1];
    if (outroText && last.text !== outroText) {
      failures.push('Final caption does not match --outro');
    }
    for (let i = 1; i < timing.captions.length; i += 1) {
      if (timing.captions[i].start < timing.captions[i - 1].end - 0.02) {
        failures.push(`Overlapping captions: ${timing.captions[i - 1].id} -> ${timing.captions[i].id}`);
        break;
      }
    }
  }
  if (typeof timing.durationSeconds !== 'number' || timing.durationSeconds <= 0) {
    failures.push('Timing JSON has invalid durationSeconds');
  }
}

if (audioPath) {
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', audioPath], {
    encoding: 'utf8',
  });
  if (probe.status !== 0) {
    failures.push('ffprobe failed for audio');
  }
}

if (videoPath) {
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
    failures.push('ffprobe failed for video');
  } else {
    const meta = JSON.parse(probe.stdout);
    const stream = meta.streams?.[0];
    if (stream?.width !== 1920 || stream?.height !== 1080) {
      failures.push(`Expected 1920x1080, got ${stream?.width}x${stream?.height}`);
    }
    if (stream?.r_frame_rate !== '30/1') {
      failures.push(`Expected 30fps, got ${stream?.r_frame_rate}`);
    }
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ok: false, failures}, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ok: true}, null, 2));
