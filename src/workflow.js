export function recommendFormats(article) {
  const pointCount = article.keyPoints.length;
  const hasHowToStructure = pointCount >= 3;

  if (hasHowToStructure) {
    return ['facebook_post', 'instagram_caption', 'instagram_carousel'];
  }

  return ['facebook_post', 'instagram_caption'];
}

export function buildContentBrief(article) {
  const recommendedFormats = recommendFormats(article);

  return {
    title: article.title,
    summary: article.summary,
    keyTakeaway:
      'Better cold brew starts with the right bean, the right grind, and the right steep time.',
    audience: article.audience ?? 'coffee drinkers who want better home cold brew',
    bestAngle: 'Not every coffee makes great cold brew.',
    recommendedFormats,
  };
}

export function generateFacebookPost(article) {
  const productLine = article.featuredProduct
    ? `Our top pick is ${article.featuredProduct}.`
    : 'We highlight the best beans and brew settings to try.';

  return {
    copy:
      `Not every coffee is the right coffee for cold brew. ` +
      `If you want a smooth, sweet, low-acid cup, the bean matters just as much as the brew method. ` +
      `In this guide, we break down the roast level, origin, grind size, and steep time that make the biggest difference. ` +
      `${productLine} Read the full guide and brew better cold brew at home.`,
    cta: 'Read the full guide',
    linkStrategy: article.url
      ? `Include the article link directly in the post: ${article.url}`
      : 'Include the article link directly in the post.',
  };
}

export function generateInstagramCaption(article) {
  return {
    copy:
      `Not every coffee makes great cold brew.\n\n` +
      `For the smoothest, sweetest cup:\n` +
      `• go medium to medium-dark\n` +
      `• grind extra coarse\n` +
      `• steep 16–20 hours\n\n` +
      `${article.featuredProduct ? `Top pick: ${article.featuredProduct}.` : 'Start with a fresh-roasted bean that leans sweet and balanced.'}\n\n` +
      `Save this for your next brew day.`,
    cta: 'Save this for later',
    hashtags: ['#coldbrew', '#specialtycoffee', '#coffeetips', '#freshroastedcoffee', '#coffeelover', '#brewbetter'],
  };
}

export function generateCarousel(article) {
  if (recommendFormats(article).indexOf('instagram_carousel') === -1) {
    return [];
  }

  return [
    {
      slide: 1,
      onSlideCopy: 'Not every coffee makes great cold brew',
      purpose: 'Hook / stop-the-scroll opener',
      imagePrompt:
        'Premium specialty coffee flat lay with a cold brew glass, roasted coffee beans, and a grinder on a warm neutral surface, editorial lifestyle photography, minimal composition, natural light, earthy tones, modern coffee brand aesthetic',
      designNotes: 'Bold headline, high contrast, simple background, one focal beverage image',
      altText: 'A cold brew glass beside roasted coffee beans and a coffee grinder on a warm neutral tabletop',
    },
    {
      slide: 2,
      onSlideCopy: 'Best roast: medium to medium-dark',
      purpose: 'Teach the ideal roast level',
      imagePrompt:
        'Stylish coffee roast comparison composition with beans in medium and medium-dark tones, warm brown and caramel palette, clean infographic style, premium flat lay, soft natural light',
      designNotes: 'Simple visual comparison, roast labels, clean hierarchy',
      altText: 'A roast comparison showing medium and medium-dark coffee beans in warm earthy tones',
    },
    {
      slide: 3,
      onSlideCopy: 'Best flavors: chocolate, caramel, nutty',
      purpose: 'Highlight taste profile',
      imagePrompt:
        'Coffee tasting notes concept image with cocoa powder, caramel pieces, roasted nuts, and coffee beans arranged aesthetically, premium product photography, warm tones, soft shadows, editorial style',
      designNotes: 'Use three flavor callouts, keep it sensory and elegant',
      altText: 'Coffee beans arranged with chocolate, caramel, and nutty tasting note visuals',
    },
    {
      slide: 4,
      onSlideCopy: 'Best grind: extra coarse',
      purpose: 'Teach grind size',
      imagePrompt:
        'Close-up of coarse ground coffee in a grinder or bowl, macro product photography, crisp texture detail, warm neutral background, specialty coffee editorial style',
      designNotes: 'Show texture clearly, avoid clutter',
      altText: 'Extra coarse coffee grounds shown in a close-up textured arrangement',
    },
    {
      slide: 5,
      onSlideCopy: 'Best steep time: 16–20 hours',
      purpose: 'Teach brewing timing',
      imagePrompt:
        'Minimal kitchen or café scene with a cold brew jar steeping coffee overnight, soft morning light, premium lifestyle photography, modern glass container, warm neutral tones',
      designNotes: 'Use a clock or time cue if useful, keep the image calm and clean',
      altText: 'A glass cold brew jar steeping coffee overnight on a clean kitchen counter',
    },
    {
      slide: 6,
      onSlideCopy: article.featuredProduct ? `Top pick: ${article.featuredProduct}` : 'Top pick: a fresh-roasted balanced bean',
      purpose: 'Feature the product recommendation',
      imagePrompt:
        `${article.featuredProduct ?? 'Premium coffee bag'} styled next to a cold brew glass and scattered roasted beans, lifestyle product photography, warm earthy tones, natural light, polished ecommerce aesthetic`,
      designNotes: 'Make the product packaging legible and prominent',
      altText: article.featuredProduct
        ? `A bag of ${article.featuredProduct} coffee beside a cold brew glass and scattered beans`
        : 'A premium coffee bag beside a cold brew glass and scattered beans',
    },
    {
      slide: 7,
      onSlideCopy: 'Brew better cold brew at home',
      purpose: 'CTA / closing slide',
      imagePrompt:
        'Inviting cold brew serving scene with a glass of iced cold brew, subtle coffee styling, cozy morning light, premium editorial photography, minimal composition, earthy café aesthetic',
      designNotes: 'Include CTA text and brand logo if needed',
      altText: 'A finished glass of cold brew in a warm, inviting coffee setting',
    },
  ];
}

export function runWorkflow(article) {
  const contentBrief = buildContentBrief(article);
  return {
    contentBrief,
    facebookPost: generateFacebookPost(article),
    instagramCaption: generateInstagramCaption(article),
    carousel: generateCarousel(article),
  };
}
