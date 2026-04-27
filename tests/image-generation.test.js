import test from 'node:test';
import assert from 'node:assert/strict';
import { buildImageJobsForCarousel } from '../src/image-generation.js';

test('buildImageJobsForCarousel creates one job per slide', () => {
  const jobs = buildImageJobsForCarousel([
    { slide: 1, imagePrompt: 'A', altText: 'a' },
    { slide: 2, imagePrompt: 'B', altText: 'b' },
  ]);

  assert.equal(jobs.length, 2);
  assert.equal(jobs[0].slide, 1);
  assert.equal(jobs[1].prompt, 'B');
});
