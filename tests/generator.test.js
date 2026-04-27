import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSocialPackage } from '../src/generator.js';

const article = {
  title: 'Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean',
  summary: 'The best cold brew starts with the right bean.',
  keyPoints: ['Medium to medium-dark roast works best', 'Extra coarse grind matters', 'Steep for 16 to 20 hours'],
  featuredProduct: 'Colombia El Tiple',
  audience: 'coffee drinkers who want smoother cold brew at home',
  url: 'https://hiswordcoffee.com/blogs/news/best-coffee-for-cold-brew',
};

test('generateSocialPackage uses the provided LLM adapter and returns structured output', async () => {
  const adapter = {
    generate: async () => ({
      facebookPost: { copy: 'FB', cta: 'CTA', linkStrategy: 'link' },
      instagramCaption: { copy: 'IG', cta: 'CTA', hashtags: ['#tag'] },
      carousel: [{ slide: 1, onSlideCopy: 'A', purpose: 'B', imagePrompt: 'C', designNotes: 'D', altText: 'E' }],
      imageJobs: [{ slide: 1, prompt: 'C' }],
    }),
  };

  const output = await generateSocialPackage(article, { adapter });

  assert.equal(output.facebookPost.copy, 'FB');
  assert.equal(output.instagramCaption.copy, 'IG');
  assert.equal(output.carousel.length, 1);
  assert.equal(output.imageJobs.length, 1);
});
