# Output Schema

The workflow should return a single structured object so it can be reviewed, stored, or sent to publishing tools.

```json
{
  "content_brief": {
    "title": "",
    "summary": "",
    "key_takeaway": "",
    "audience": "",
    "best_angle": "",
    "recommended_formats": []
  },
  "facebook_post": {
    "copy": "",
    "cta": "",
    "link_strategy": ""
  },
  "instagram_caption": {
    "copy": "",
    "cta": "",
    "hashtags": []
  },
  "carousel": [
    {
      "slide": 1,
      "on_slide_copy": "",
      "purpose": "",
      "image_prompt": "",
      "design_notes": "",
      "alt_text": ""
    }
  ]
}
```

## Carousel requirements

If `carousel` is present, each slide must include:

- `on_slide_copy`
- `purpose`
- `image_prompt`
- `design_notes`
- `alt_text`

That makes the carousel usable by both content and design workflows.
