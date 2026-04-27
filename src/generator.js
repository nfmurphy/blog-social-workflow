import { buildContentBrief, generateCarousel, generateFacebookPost, generateInstagramCaption, normalizeArticle } from './workflow.js';
import { buildPromptBundle } from './prompts.js';
import { buildImageJobsForCarousel } from './image-generation.js';

function buildLocalPackage(article) {
  const normalizedArticle = normalizeArticle(article);
  const contentBrief = buildContentBrief(normalizedArticle);
  const carousel = generateCarousel(normalizedArticle);
  const prompts = buildPromptBundle(normalizedArticle, contentBrief, carousel);

  return {
    contentBrief,
    facebookPost: generateFacebookPost(normalizedArticle),
    instagramCaption: generateInstagramCaption(normalizedArticle),
    carousel,
    imageJobs: buildImageJobsForCarousel(carousel, {
      articleTitle: normalizedArticle.title,
      articleUrl: normalizedArticle.url,
    }),
    prompts,
  };
}

function createRuleBasedAdapter() {
  return {
    async generate(article) {
      return buildLocalPackage(article);
    },
  };
}

function parseJsonOrThrow(text, context = 'LLM output') {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${context} was not valid JSON: ${error.message}`);
  }
}

export function createOpenAIAdapter({ apiKey, model = 'gpt-4.1-mini', fetchImpl = fetch } = {}) {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for the OpenAI adapter');
  }

  return {
    async generate(article) {
      const local = buildLocalPackage(article);
      const response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.6,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content:
                'You generate structured Facebook and Instagram marketing assets from a blog article. Return valid JSON only.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                article,
                contentBrief: local.contentBrief,
                prompts: local.prompts,
                requiredSchema: {
                  facebookPost: { copy: 'string', cta: 'string', linkStrategy: 'string' },
                  instagramCaption: { copy: 'string', cta: 'string', hashtags: ['string'] },
                  carousel: [
                    {
                      slide: 'number',
                      onSlideCopy: 'string',
                      purpose: 'string',
                      imagePrompt: 'string',
                      designNotes: 'string',
                      altText: 'string',
                    },
                  ],
                },
                instructions:
                  'Use the article and prompts to write platform-specific copy. Keep carousel image prompts concrete and brand-safe.',
              }),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI adapter request failed (${response.status})`);
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content ?? '{}';
      const generated = parseJsonOrThrow(content, 'OpenAI response');

      const carousel = Array.isArray(generated.carousel) ? generated.carousel : local.carousel;
      return {
        ...local,
        ...generated,
        carousel,
        imageJobs: buildImageJobsForCarousel(carousel, {
          articleTitle: article.title,
          articleUrl: article.url,
        }),
      };
    },
  };
}

export async function generateSocialPackage(article, { adapter } = {}) {
  const activeAdapter = adapter ?? createRuleBasedAdapter();
  const generated = await activeAdapter.generate(article);

  if (!generated.imageJobs && Array.isArray(generated.carousel)) {
    generated.imageJobs = buildImageJobsForCarousel(generated.carousel, {
      articleTitle: article.title,
      articleUrl: article.url,
    });
  }

  return generated;
}

export function createGeneratorFromEnv(env = process.env, fetchImpl = fetch) {
  if (env.OPENAI_API_KEY) {
    return createOpenAIAdapter({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL || 'gpt-4.1-mini',
      fetchImpl,
    });
  }

  return createRuleBasedAdapter();
}
