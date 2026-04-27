import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { parseArgs, runCli } from '../src/cli.js';

test('parseArgs reads repeated urls and output path', () => {
  const args = parseArgs(['--url', 'https://example.com/one', '--url', 'https://example.com/two', '--out', 'out.json']);
  assert.deepEqual(args.urls, ['https://example.com/one', 'https://example.com/two']);
  assert.equal(args.out, 'out.json');
});

test('runCli processes multiple blog urls as a batch', async () => {
  const htmlByUrl = {
    'https://example.com/one': `
      <html><head><meta property="og:title" content="First Post" /><meta property="og:description" content="First summary" /></head><body><article><h1>First Post</h1><h2>One</h2><p>First point.</p></article></body></html>
    `,
    'https://example.com/two': `
      <html><head><meta property="og:title" content="Second Post" /><meta property="og:description" content="Second summary" /></head><body><article><h1>Second Post</h1><h2>Two</h2><p>Second point.</p></article></body></html>
    `,
  };
  const tmp = mkdtempSync(path.join(tmpdir(), 'blog-social-cli-'));
  const outFile = path.join(tmp, 'batch-output.json');

  const fetchImpl = async (url) => ({
    ok: true,
    status: 200,
    text: async () => htmlByUrl[url],
  });

  const result = await runCli([
    '--url', 'https://example.com/one',
    '--url', 'https://example.com/two',
    '--out', outFile,
    '--provider', 'local',
  ], { fetchImpl });

  assert.equal(result.ok, true);
  assert.equal(result.output.batch, true);
  assert.equal(result.output.items.length, 2);
  assert.equal(result.output.items[0].article.title, 'First Post');
  assert.equal(result.output.items[1].article.title, 'Second Post');

  const written = JSON.parse(readFileSync(outFile, 'utf8'));
  assert.equal(written.count, 2);
});
