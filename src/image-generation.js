import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function padSlideNumber(slide) {
  return String(slide).padStart(2, '0');
}

function toBuffer(value) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value);
}

export function buildImageJobsForCarousel(carousel, { articleTitle = '', articleUrl = '' } = {}) {
  return carousel.map((slide) => ({
    slide: slide.slide,
    filename: `slide-${padSlideNumber(slide.slide)}.json`,
    title: articleTitle,
    articleUrl,
    prompt: slide.imagePrompt,
    altText: slide.altText,
    designNotes: slide.designNotes,
  }));
}

export function buildImageManifest({ articleTitle = '', articleUrl = '', carousel = [] } = {}) {
  return {
    articleTitle,
    articleUrl,
    slideCount: carousel.length,
    imageJobs: buildImageJobsForCarousel(carousel, { articleTitle, articleUrl }),
  };
}

export function createOpenAIImageRenderer({ apiKey, model = 'gpt-image-1', size = '1024x1024', fetchImpl = fetch } = {}) {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for OpenAI image rendering');
  }

  return {
    async render(job) {
      const response = await fetchImpl('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: job.prompt,
          size,
          response_format: 'b64_json',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI image request failed (${response.status})`);
      }

      const payload = await response.json();
      const image = payload?.data?.[0];
      if (!image) {
        throw new Error('OpenAI image response did not include image data');
      }

      if (image.b64_json) {
        return {
          buffer: Buffer.from(image.b64_json, 'base64'),
          mimeType: 'image/png',
          extension: '.png',
          source: 'openai',
        };
      }

      if (image.url) {
        const urlResponse = await fetchImpl(image.url);
        if (!urlResponse.ok) {
          throw new Error(`Failed to download generated image (${urlResponse.status})`);
        }
        const arrayBuffer = await urlResponse.arrayBuffer();
        return {
          buffer: Buffer.from(arrayBuffer),
          mimeType: urlResponse.headers.get('content-type') || 'image/png',
          extension: '.png',
          source: 'openai',
        };
      }

      throw new Error('OpenAI image response did not include b64_json or url');
    },
  };
}

export async function renderImageJob(job, { outputDir, renderer }) {
  if (!outputDir) {
    throw new Error('outputDir is required to render an image job');
  }
  if (!renderer?.render) {
    throw new Error('renderer.render is required to render an image job');
  }

  await mkdir(outputDir, { recursive: true });
  const rendered = await renderer.render(job);
  const extension = rendered.extension || path.extname(job.filename) || '.png';
  const filename = job.filename.endsWith(extension) ? job.filename : `${path.basename(job.filename, path.extname(job.filename))}${extension}`;
  const filePath = path.join(outputDir, filename);
  await writeFile(filePath, toBuffer(rendered.buffer));

  return {
    ...job,
    filename,
    path: filePath,
    mimeType: rendered.mimeType || 'image/png',
    source: rendered.source || 'openai',
  };
}

export async function renderCarouselImages(carousel, { outputDir, renderer, articleTitle = '', articleUrl = '' } = {}) {
  const jobs = buildImageJobsForCarousel(carousel, { articleTitle, articleUrl });
  const rendered = [];

  for (const job of jobs) {
    rendered.push(await renderImageJob({ ...job, filename: job.filename.replace(/\.json$/i, '.png') }, { outputDir, renderer }));
  }

  return rendered;
}
