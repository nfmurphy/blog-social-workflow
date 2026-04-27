import { runWorkflow } from './workflow.js';

const coldBrewArticle = {
  title: 'Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean',
  summary:
    'The best cold brew starts with the right bean. Medium and medium-dark roasts, extra coarse grind, and long steeping produce the smoothest, sweetest cup.',
  keyPoints: [
    'Medium to medium-dark roast works best',
    'Chocolate, caramel, and nutty notes shine in cold brew',
    'Extra coarse grind and 16–20 hour steep time are ideal',
    'Colombia El Tiple is the featured product pick',
  ],
  featuredProduct: 'Colombia El Tiple',
  audience: 'coffee drinkers who want smoother cold brew at home',
  url: 'https://hiswordcoffee.com/blogs/news/best-coffee-for-cold-brew',
};

const output = runWorkflow(coldBrewArticle);
console.log(JSON.stringify(output, null, 2));
