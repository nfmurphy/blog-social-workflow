import test from 'node:test';
import assert from 'node:assert/strict';
import { extractArticleFromHtml } from '../src/extract-article.js';
import { buildPromptBundle } from '../src/prompts.js';
import { runWorkflow } from '../src/workflow.js';

const sampleHtml = `
<html>
  <head>
    <title>Best Coffee for Cold Brew</title>
    <meta property="og:title" content="Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean" />
    <meta property="og:description" content="Learn the best coffee choices for smoother cold brew." />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean",
        "description": "The best cold brew starts with the right bean.",
        "articleBody": "Medium to medium-dark roasts work best. Extra coarse grind matters. Steep for 16 to 20 hours."
      }
    </script>
  </head>
  <body>
    <article>
      <h1>Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean</h1>
      <h2>Pick the right roast</h2>
      <p>Medium to medium-dark roasts work best.</p>
      <h2>Grind coarse</h2>
      <p>Extra coarse grind matters.</p>
      <h2>Steep patiently</h2>
      <p>Steep for 16 to 20 hours.</p>
    </article>
  </body>
</html>`;

test('extractArticleFromHtml reads title, summary, and key points', () => {
  const article = extractArticleFromHtml(sampleHtml, 'https://example.com/blog');

  assert.equal(article.title, 'Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean');
  assert.equal(article.summary, 'Learn the best coffee choices for smoother cold brew.');
  assert.deepEqual(article.keyPoints, [
    'Pick the right roast — Medium to medium-dark roasts work best.',
    'Grind coarse — Extra coarse grind matters.',
    'Steep patiently — Steep for 16 to 20 hours.',
  ]);
  assert.equal(article.url, 'https://example.com/blog');
});

test('runWorkflow recommends carousel and emits slide image prompts', () => {
  const output = runWorkflow({
    title: 'Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean',
    summary: 'The best cold brew starts with the right bean.',
    keyPoints: [
      'Medium to medium-dark roast works best',
      'Extra coarse grind matters',
      'Steep for 16 to 20 hours',
    ],
    featuredProduct: 'Colombia El Tiple',
    audience: 'coffee drinkers who want smoother cold brew at home',
    url: 'https://hiswordcoffee.com/blogs/news/best-coffee-for-cold-brew',
  });

  assert.ok(output.contentBrief.recommendedFormats.includes('instagram_carousel'));
  assert.equal(output.carousel.length, 7);
  assert.ok(output.carousel.every((slide) => slide.imagePrompt.length > 20));
  assert.equal(output.prompts.carousel.length, 7);
  assert.match(output.prompts.facebook, /Facebook post/);
  assert.match(output.prompts.instagram, /Instagram caption/);
});

 test('buildPromptBundle creates one prompt per carousel slide and includes brand voice guidance', () => {
  const article = {
    title: 'Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean',
    summary: 'The best cold brew starts with the right bean.',
    keyPoints: ['Medium to medium-dark roast works best', 'Extra coarse grind matters', 'Steep for 16 to 20 hours'],
    url: 'https://hiswordcoffee.com/blogs/news/best-coffee-for-cold-brew',
  };
  const output = runWorkflow(article);
  const bundle = buildPromptBundle(article, output.contentBrief, output.carousel);

  assert.equal(bundle.carousel.length, output.carousel.length);
  assert.match(bundle.carousel[0], /Slide number: 1/);
  assert.match(bundle.facebook, /warm, knowledgeable/);
  assert.match(bundle.instagram, /line breaks/);
  assert.match(bundle.facebook, /hiswordcoffee\.com/);
});
