import { buildImageManifest } from './image-generation.js';
import { createGeneratorFromEnv, generateSocialPackage } from './generator.js';
import { extractArticleFromHtml, extractArticleFromUrl } from './extract-article.js';
import { writeFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function readValue(argv, name) {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

function hasFlag(argv, name) {
  return argv.includes(name);
}

export function parseArgs(argv = process.argv.slice(2)) {
  return {
    url: readValue(argv, '--url'),
    html: readValue(argv, '--html'),
    out: readValue(argv, '--out') || 'social-output.json',
    imageDir: readValue(argv, '--image-dir') || 'carousel-images',
    provider: readValue(argv, '--provider') || 'auto',
    renderImages: hasFlag(argv, '--render-images'),
    title: readValue(argv, '--title'),
    summary: readValue(argv, '--summary'),
    featuredProduct: readValue(argv, '--featured-product'),
    audience: readValue(argv, '--audience'),
    help: hasFlag(argv, '--help') || hasFlag(argv, '-h'),
  };
}

function printHelp() {
  process.stdout.write(`Usage:\n  npm run generate -- --url <blog-url> [--out output.json] [--render-images]\n\nOptions:\n  --url            Blog URL to extract\n  --html           Raw HTML input instead of fetching\n  --out            Output JSON path\n  --image-dir      Directory for carousel image job files\n  --provider       auto | local | openai\n  --render-images  Write per-slide image job files\n  --title          Override article title\n  --summary        Override article summary\n  --featured-product  Override featured product\n  --audience       Override target audience\n`);
}

async function loadArticle(args) {
  if (args.html) {
    return extractArticleFromHtml(args.html, args.url || '');
  }

  if (args.url) {
    return extractArticleFromUrl(args.url);
  }

  throw new Error('Provide either --url or --html');
}

async function writeJson(filePath, data) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function runCli(argv = process.argv.slice(2), { fetchImpl = fetch } = {}) {
  const args = parseArgs(argv);

  if (args.help) {
    printHelp();
    return { ok: true, help: true };
  }

  const baseArticle = await loadArticle(args);
  const article = {
    ...baseArticle,
    title: args.title || baseArticle.title,
    summary: args.summary || baseArticle.summary,
    featuredProduct: args.featuredProduct || baseArticle.featuredProduct,
    audience: args.audience || baseArticle.audience,
  };

  const adapter = args.provider === 'local'
    ? createGeneratorFromEnv({})
    : createGeneratorFromEnv({ OPENAI_API_KEY: process.env.OPENAI_API_KEY, OPENAI_MODEL: process.env.OPENAI_MODEL }, fetchImpl);

  const output = await generateSocialPackage(article, { adapter });

  if (args.renderImages && output.imageJobs?.length) {
    const manifest = buildImageManifest({
      articleTitle: article.title,
      articleUrl: article.url,
      carousel: output.carousel,
    });

    await mkdir(args.imageDir, { recursive: true });
    await writeJson(path.join(args.imageDir, 'manifest.json'), manifest);
    for (const job of output.imageJobs) {
      await writeJson(path.join(args.imageDir, job.filename), job);
    }
  }

  await writeJson(args.out, output);
  return { ok: true, output };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
