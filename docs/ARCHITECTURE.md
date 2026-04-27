# Architecture

This repo is designed around a simple pipeline:

1. **Ingest blog content**
2. **Summarize into a content brief**
3. **Choose the best social format**
4. **Generate platform-specific copy**
5. **If a carousel is recommended, generate slide assets and image jobs**
6. **Package everything for human review**
7. **Optionally write JSON artifacts from the CLI**

## Design goals

- Be easy to extend
- Keep Facebook and Instagram logic separate
- Make carousel generation first-class
- Produce production-ready prompts for each carousel slide
- Avoid Twitter/X assumptions such as 280-character compression

## Proposed module layout

```text
src/
  types.js
  workflow.js
  demo.js
```

## Workflow responsibilities

### `analyzeArticle`
Creates a structured brief from the source blog post.

### `recommendFormats`
Chooses whether the article should become:
- a Facebook post
- an Instagram caption
- an Instagram carousel
- some combination of the above

### `generateFacebookPost`
Produces a slightly longer, helpful, link-friendly post.

### `generateInstagramCaption`
Produces a short, hook-first caption with line breaks and hashtags.

### `generateCarousel`
Produces slide objects. Each slide must include:
- slide copy
- purpose
- image prompt
- design notes
- alt text

## Carousel rule

If the workflow recommends a carousel, the repo must generate **image prompts for every slide**. This is a hard requirement.

## Publishing model

This repo is intended to be used in a review-first workflow:

1. generate draft package
2. review and edit
3. publish to Facebook / Instagram
4. archive the final payload

## Future additions

- real URL extraction
- LLM prompt layer
- platform-specific publishing adapters
- queue or cron-based automation
- asset generation for image templates
```