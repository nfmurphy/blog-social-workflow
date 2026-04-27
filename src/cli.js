import { buildImageManifest, createOpenAIImageRenderer, renderCarouselImages } from './image-generation.js';
import { createGeneratorFromEnv, createOpenAIAdapter, generateSocialPackage } from './generator.js';
import { extractArticleFromHtml, extractArticleFromUrl } from './extract-article.js';
import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function readValue(argv, name) {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

function collectValues(argv, name) {
  const values = [];
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] !== name) continue;
    const value = argv[index + 1];
    if (typeof value === 'string' && !value.startsWith('--')) {
      values.push(value);
    }
  }
  return values;
}

function splitUrls(values) {
  return values
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);
}

function hasFlag(argv, name) {
  return argv.includes(name);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'article';
}

export function parseArgs(argv = process.argv.slice(2)) {
  const urls = splitUrls([...collectValues(argv, '--url'), ...collectValues(argv, '--urls')]);
  return {
    url: urls[0],
    urls,
    html: readValue(argv, '--html'),
    out: readValue(argv, '--out') || 'social-output.json',
    imageDir: readValue(argv, '--image-dir') || 'carousel-images',
    provider: readValue(argv, '--provider') || 'auto',
    imageProvider: readValue(argv, '--image-provider') || 'auto',
    renderImages: hasFlag(argv, '--render-images'),
    title: readValue(argv, '--title'),
    summary: readValue(argv, '--summary'),
    featuredProduct: readValue(argv, '--featured-product'),
    audience: readValue(argv, '--audience'),
    help: hasFlag(argv, '--help') || hasFlag(argv, '-h'),
  };
}

function printHelp() {
  process.stdout.write(`Usage:\n  npm run generate -- --url <blog-url> [--out output.json] [--render-images]\n  npm run generate -- --url <url1> --url <url2> --out batch.json\n\nOptions:\n  --url            Blog URL to extract (repeatable)\n  --urls           Comma-separated blog URLs\n  --html           Raw HTML input instead of fetching\n  --out            Output JSON path\n  --image-dir      Directory for carousel image outputs\n  --provider       auto | local | openai\n  --image-provider auto | local | openai\n  --render-images  Write per-slide image files\n  --title          Override article title\n  --summary        Override article summary\n  --featured-product  Override featured product\n  --audience       Override target audience\n`);
}

async function loadArticles(args, fetchImpl) {
  if (args.html) {
    return [extractArticleFromHtml(args.html, args.url || '')];
  }

  if (args.urls.length) {
    return Promise.all(args.urls.map((url) => extractArticleFromUrl(url, fetchImpl)));
  }

  throw new Error('Provide either --url, --urls, or --html');
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

function buildContentAdapter(args, fetchImpl) {
  if (args.provider === 'local') {
    return createGeneratorFromEnv({});
  }

  if (args.provider === 'openai') {
    return createOpenAIAdapter({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      fetchImpl,
    });
  }

  return createGeneratorFromEnv(
    {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL,
    },
    fetchImpl,
  );
}

function buildImageRenderer(args, fetchImpl) {
  if (args.imageProvider === 'openai') {
    return createOpenAIImageRenderer({
      apiKey: process.env.OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      fetchImpl,
    });
  }

  if (args.imageProvider === 'auto' && (process.env.OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY)) {
    return createOpenAIImageRenderer({
      apiKey: process.env.OPENAI_IMAGE_API_KEY || process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',
      fetchImpl,
    });
  }

  return null;
}

async function writeImageArtifacts({ article, generated, outputDir, imageRenderer }) {
  const manifest = buildImageManifest({
    articleTitle: article.title,
    articleUrl: article.url,
    carousel: generated.carousel,
  });

  await mkdir(outputDir, { recursive: true });
  await writeJson(path.join(outputDir, 'manifest.json'), manifest);

  if (imageRenderer) {
    const rendered = await renderCarouselImages(generated.carousel, {
      outputDir,
      renderer: imageRenderer,
      articleTitle: article.title,
      articleUrl: article.url,
    });
    await writeJson(path.join(outputDir, 'rendered-images.json'), rendered);
    return;
  }

  for (const job of generated.imageJobs || []) {
    await writeJson(path.join(outputDir, job.filename), job);
  }
}

export async function runCli(argv = process.argv.slice(2), { fetchImpl = fetch } = {}) {
  const args = parseArgs(argv);

  if (args.help) {
    printHelp();
    return { ok: true, help: true };
  }

  const articles = await loadArticles(args, fetchImpl);
  const adapter = buildContentAdapter(args, fetchImpl);
  const imageRenderer = args.renderImages ? buildImageRenderer(args, fetchImpl) : null;
  const results = [];

  for (const [index, baseArticle] of articles.entries()) {
    const article = {
      ...baseArticle,
      title: args.title || baseArticle.title,
      summary: args.summary || baseArticle.summary,
      featuredProduct: args.featuredProduct || baseArticle.featuredProduct,
      audience: args.audience || baseArticle.audience,
    };
    const generated = await generateSocialPackage(article, { adapter });
    results.push({ article, ...generated });

    if (args.renderImages && generated.carousel?.length) {
      const outputDir = articles.length > 1 ? path.join(args.imageDir, `${String(index + 1).padStart(2, '0')}-${slugify(article.title)}`) : args.imageDir;
      await writeImageArtifacts({ article, generated, outputDir, imageRenderer });
    }
  }

  const output = results.length === 1
    ? results[0]
    : { batch: true, count: results.length, items: results };

  await writeJson(args.out, output);
  return { ok: true, output };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
