import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createOpenAIImageRenderer, renderImageJob, buildImageJobsForCarousel } from '../src/image-generation.js';

test('buildImageJobsForCarousel creates one job per slide', () => {
  const jobs = buildImageJobsForCarousel([
    { slide: 1, imagePrompt: 'A', altText: 'a' },
    { slide: 2, imagePrompt: 'B', altText: 'b' },
  ]);

  assert.equal(jobs.length, 2);
  assert.equal(jobs[0].slide, 1);
  assert.equal(jobs[1].prompt, 'B');
});

test('createOpenAIImageRenderer sends a prompt to OpenAI and returns image bytes', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 200,
      json: async () => ({ data: [{ b64_json: Buffer.from('PNGDATA').toString('base64') }] }),
    };
  };

  const renderer = createOpenAIImageRenderer({ apiKey: 'test-key', fetchImpl });
  const result = await renderer.render({ prompt: 'A warm coffee flat lay', filename: 'slide-01.png' });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.openai.com/v1/images/generations');
  assert.match(JSON.parse(calls[0].options.body).prompt, /warm coffee flat lay/);
  assert.equal(result.mimeType, 'image/png');
  assert.equal(result.buffer.toString(), 'PNGDATA');
});

test('renderImageJob writes a generated image file to disk', async () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'blog-social-images-'));
  const renderer = {
    render: async () => ({
      buffer: Buffer.from('FAKEPNG'),
      mimeType: 'image/png',
      extension: '.png',
    }),
  };

  const written = await renderImageJob({ filename: 'slide-01.png', prompt: 'A coffee scene' }, { outputDir: tmp, renderer });

  assert.equal(written.filename, 'slide-01.png');
  assert.equal(written.path, path.join(tmp, 'slide-01.png'));
  assert.equal(existsSync(written.path), true);
  assert.equal(readFileSync(written.path).toString(), 'FAKEPNG');
});
