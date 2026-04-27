import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../src/cli.js';

test('parseArgs reads url and output path', () => {
  const args = parseArgs(['--url', 'https://example.com', '--out', 'out.json']);
  assert.equal(args.url, 'https://example.com');
  assert.equal(args.out, 'out.json');
});
