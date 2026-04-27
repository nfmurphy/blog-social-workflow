# Output Schema

The workflow can return either a single content package or a batch wrapper when multiple URLs are processed.

```json
{
  "article": {
    "title": "",
    "summary": "",
    "keyPoints": [],
    "url": ""
  },
  "contentBrief": {
    "title": "",
    "summary": "",
    "keyTakeaway": "",
    "audience": "",
    "bestAngle": "",
    "recommendedFormats": []
  },
  "facebookPost": {
    "copy": "",
    "cta": "",
    "linkStrategy": ""
  },
  "instagramCaption": {
    "copy": "",
    "cta": "",
    "hashtags": []
  },
  "carousel": [
    {
      "slide": 1,
      "onSlideCopy": "",
      "purpose": "",
      "imagePrompt": "",
      "designNotes": "",
      "altText": ""
    }
  ],
  "imageJobs": [
    {
      "slide": 1,
      "filename": "slide-01.json",
      "title": "",
      "articleUrl": "",
      "prompt": "",
      "altText": "",
      "designNotes": ""
    }
  ],
  "prompts": {
    "generation": "",
    "facebook": "",
    "instagram": "",
    "carousel": ["", ""]
  }
}
```

When the CLI processes multiple URLs, it writes:

```json
{
  "batch": true,
  "count": 2,
  "items": [
    {
      "article": { "title": "" },
      "contentBrief": {},
      "facebookPost": {},
      "instagramCaption": {},
      "carousel": [],
      "imageJobs": [],
      "prompts": {}
    }
  ]
}
```

## Carousel requirements

If `carousel` is present, each slide must include:

- `onSlideCopy`
- `purpose`
- `imagePrompt`
- `designNotes`
- `altText`

If `imageJobs` is present, each job should include the slide number, filename, prompt text, and alt text so the carousel can be rendered or handed off to another image tool.

That makes the workflow usable by both content and design pipelines.
