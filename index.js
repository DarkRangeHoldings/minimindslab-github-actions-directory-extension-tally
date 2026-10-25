import { appendFileSync } from 'node:fs';

const payloadRaw = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

function fail(message) {
  throw new Error(message);
}

if (typeof payloadRaw !== 'string') fail('Invalid input');
if (typeof outputPath !== 'string' || outputPath.length === 0) fail('Invalid output');

let parsed;
try {
  parsed = JSON.parse(payloadRaw);
} catch {
  fail('Invalid input');
}

if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) fail('Invalid input');
if (!Object.prototype.hasOwnProperty.call(parsed, 'paths')) fail('Invalid input');

const { paths } = parsed;
if (!Array.isArray(paths)) fail('Invalid input');

const counts = Object.create(null);
let total = 0;

for (let i = 0; i < paths.length; i++) {
  const p = paths[i];
  if (typeof p !== 'string') fail('Invalid input');

  const slash = p.lastIndexOf('/');
  const base = slash >= 0 ? p.slice(slash + 1) : p;

  const dot = base.lastIndexOf('.');
  const ext = dot > 0 ? base.slice(dot) : '<none>';

  counts[ext] = (counts[ext] || 0) + 1;
  total++;
}

const extensions = Object.keys(counts).sort();
const sortedCounts = Object.create(null);
for (let i = 0; i < extensions.length; i++) {
  const ext = extensions[i];
  sortedCounts[ext] = counts[ext];
}

const result = { counts: sortedCounts, extensions, total };
appendFileSync(outputPath, `result=${JSON.stringify(result)}\n`);