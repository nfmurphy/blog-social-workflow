export type RecommendedFormat =
  | 'facebook_post'
  | 'instagram_caption'
  | 'instagram_carousel'
  | 'combo';

export interface ContentBrief {
  title: string;
  summary: string;
  keyTakeaway: string;
  audience: string;
  bestAngle: string;
  recommendedFormats: RecommendedFormat[];
}

export interface CarouselSlide {
  slide: number;
  onSlideCopy: string;
  purpose: string;
  imagePrompt: string;
  designNotes: string;
  altText: string;
}

export interface SocialWorkflowOutput {
  contentBrief: ContentBrief;
  facebookPost: {
    copy: string;
    cta: string;
    linkStrategy: string;
  };
  instagramCaption: {
    copy: string;
    cta: string;
    hashtags: string[];
  };
  carousel: CarouselSlide[];
}

export interface ArticleInput {
  title: string;
  summary: string;
  keyPoints: string[];
  featuredProduct?: string;
  audience?: string;
  url?: string;
}
