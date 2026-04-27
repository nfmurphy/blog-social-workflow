import { extractArticleFromHtml } from './extract-article.js';
import { generateSocialPackage } from './generator.js';

const coldBrewHtml = `
<html>
  <head>
    <meta property="og:title" content="Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean" />
    <meta property="og:description" content="The best cold brew starts with the right bean." />
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
      <h2>Pick the right roast</h2>
      <p>Medium to medium-dark roasts work best.</p>
      <h2>Grind coarse</h2>
      <p>Extra coarse grind matters.</p>
      <h2>Steep patiently</h2>
      <p>Steep for 16 to 20 hours.</p>
    </article>
  </body>
</html>`;

const article = extractArticleFromHtml(
  coldBrewHtml,
  'https://hiswordcoffee.com/blogs/news/best-coffee-for-cold-brew',
);

const output = await generateSocialPackage({
  ...article,
  featuredProduct: 'Colombia El Tiple',
  audience: 'coffee drinkers who want smoother cold brew at home',
});

console.log(JSON.stringify(output, null, 2));
