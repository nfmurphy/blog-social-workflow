# Output Schema

The workflow should return a single structured object so it can be reviewed, stored, or sent to downstream tools.

```json
{
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

## Carousel requirements

If `carousel` is present, each slide must include:

- `onSlideCopy`
- `purpose`
- `imagePrompt`
- `designNotes`
- `altText`

If `imageJobs` is present, each job should include the slide number, filename, prompt text, and alt text so the carousel can be rendered or handed off to another image tool.

That makes the workflow usable by both content and design pipelines.
