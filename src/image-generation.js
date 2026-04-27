function padSlideNumber(slide) {
  return String(slide).padStart(2, '0');
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
