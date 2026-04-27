export function createPublishingAdapter() {
  return {
    async publishFacebookPost() {
      throw new Error('Publishing adapter not configured. Add Facebook API integration here.');
    },
    async publishInstagramCaption() {
      throw new Error('Publishing adapter not configured. Add Instagram API integration here.');
    },
    async publishInstagramCarousel() {
      throw new Error('Publishing adapter not configured. Add Instagram carousel publishing here.');
    },
  };
}
