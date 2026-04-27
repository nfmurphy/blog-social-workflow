export function buildGenerationInstructions(article, contentBrief) {
  return [
    'You are generating a complete social content package for a coffee brand blog article.',
    `Article title: ${article.title}`,
    `Article summary: ${article.summary}`,
    `Key takeaway: ${contentBrief.keyTakeaway}`,
    `Best angle: ${contentBrief.bestAngle}`,
    `Audience: ${contentBrief.audience}`,
    'Return valid JSON with facebookPost, instagramCaption, carousel, and imageJobs when relevant.',
    'The carousel must include one image prompt per slide.',
  ].join('\n');
}

export function buildFacebookPrompt(article, contentBrief) {
  return [
    'You are writing a Facebook post for a coffee brand.',
    'Goal: create a helpful, conversational post that encourages readers to open the article.',
    'Keep the tone brand-safe, useful, and not overly salesy.',
    `Article title: ${article.title}`,
    `Summary: ${contentBrief.summary}`,
    `Key takeaway: ${contentBrief.keyTakeaway}`,
    `Best angle: ${contentBrief.bestAngle}`,
    `CTA: read the full guide and include the article link when available.`,
  ].join('\n');
}

export function buildInstagramPrompt(article, contentBrief) {
  return [
    'You are writing an Instagram caption for a coffee brand.',
    'Goal: create a hook-first caption with line breaks, sensory language, and a clean CTA.',
    'Make the first line scroll-stopping.',
    `Article title: ${article.title}`,
    `Summary: ${contentBrief.summary}`,
    `Key takeaway: ${contentBrief.keyTakeaway}`,
    `Best angle: ${contentBrief.bestAngle}`,
    'Include hashtags when useful.',
  ].join('\n');
}

export function buildCarouselSlidePrompt({ article, slide, contentBrief }) {
  return [
    'You are designing a single Instagram carousel slide.',
    `Article title: ${article.title}`,
    `Slide number: ${slide.slide}`,
    `On-slide copy: ${slide.onSlideCopy}`,
    `Purpose: ${slide.purpose}`,
    `Content brief: ${contentBrief.bestAngle}`,
    'Create an image prompt that matches the slide concept and brand aesthetic.',
    'Include enough specificity for a designer or image model to generate the asset.',
  ].join('\n');
}

export function buildPromptBundle(article, contentBrief, carousel) {
  return {
    generation: buildGenerationInstructions(article, contentBrief),
    facebook: buildFacebookPrompt(article, contentBrief),
    instagram: buildInstagramPrompt(article, contentBrief),
    carousel: carousel.map((slide) => buildCarouselSlidePrompt({ article, slide, contentBrief })),
  };
}
