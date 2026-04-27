const DEFAULT_KEY_POINT_LIMIT = 6;

function stripTags(value) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getMetaContent(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return stripTags(match[1]);
    }
  }

  return '';
}

function parseJsonLdBlocks(html) {
  const blocks = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html))) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      // Ignore malformed blocks.
    }
  }
  return blocks;
}

function pickBlogPosting(blocks) {
  return blocks.find((block) => {
    const type = block?.['@type'];
    return type === 'BlogPosting' || type === 'Article' || type === 'NewsArticle';
  });
}

function extractHeadingPairs(html) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  const source = articleMatch?.[0] ?? html;
  const lines = source.match(/<(h[23]|p)[^>]*>[\s\S]*?<\/(h[23]|p)>/gi) ?? [];

  const pairs = [];
  let pendingHeading = '';

  for (const line of lines) {
    if (/<h[23][^>]*>/i.test(line)) {
      pendingHeading = stripTags(line);
      continue;
    }

    if (!pendingHeading) continue;

    const text = stripTags(line);
    if (!text) continue;

    if (text.length < 35 && /^(read more|continue reading)$/i.test(text)) {
      continue;
    }

    pairs.push(`${pendingHeading} — ${text}`);
    pendingHeading = '';
  }

  return pairs.slice(0, DEFAULT_KEY_POINT_LIMIT);
}

export function extractArticleFromHtml(html, url = '') {
  const jsonLd = pickBlogPosting(parseJsonLdBlocks(html));

  const title =
    getMetaContent(html, 'og:title') ||
    jsonLd?.headline ||
    stripTags((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ?? [])[1] ?? '') ||
    stripTags((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? '');

  const summary =
    getMetaContent(html, 'og:description') ||
    jsonLd?.description ||
    stripTags((html.match(/<p[^>]*>([\s\S]*?)<\/p>/i) ?? [])[1] ?? '');

  const keyPoints = extractHeadingPairs(html);

  const articleBody = typeof jsonLd?.articleBody === 'string' ? stripTags(jsonLd.articleBody) : '';
  if (!keyPoints.length && articleBody) {
    keyPoints.push(...articleBody.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, DEFAULT_KEY_POINT_LIMIT));
  }

  return {
    title: title || 'Untitled article',
    summary: summary || 'No summary available.',
    keyPoints: keyPoints.length ? keyPoints : ['No key points were extracted from the article.'],
    url,
    audience: 'coffee drinkers who want better social content',
  };
}

export async function extractArticleFromUrl(url, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; BlogSocialWorkflow/0.1)',
      accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch article (${response.status}) from ${url}`);
  }

  const html = await response.text();
  return extractArticleFromHtml(html, url);
}
