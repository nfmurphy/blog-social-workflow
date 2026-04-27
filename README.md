# Blog Social Workflow

A standalone repo for turning blog posts into **Facebook posts**, **Instagram captions**, and **Instagram carousel plans** with **slide-by-slide image prompts**.

## Why this repo exists

The LangChain social-media-agent repo is a useful starting point, but it is optimized for Twitter/X and LinkedIn. This repo is being designed specifically for:

- blog article ingestion
- format recommendation per article
- Facebook copy generation
- Instagram caption generation
- Instagram carousel generation
- image prompts for every carousel slide
- human review before publishing

## Core output philosophy

Each blog post should produce a complete social package:

- content brief
- recommended format(s)
- Facebook post
- Instagram caption
- carousel slides, when useful
- image prompt for every slide
- alt text and design notes

## Repository status

This repo is currently in **design + starter implementation** mode.

### Included
- architecture docs
- output schema
- working demo data for one blog post
- starter JavaScript workflow modules

### Next steps
- connect real article extraction
- connect an LLM for copy generation
- add publishing integrations
- add tests and validation

## Demo

The repository includes a worked example for:

`Best Coffee for Cold Brew: What Makes a Great Cold Brew Bean`

See:

- `examples/cold-brew-workflow-output.json`
- `src/demo.ts`

## Recommended architecture

See `docs/ARCHITECTURE.md` and `docs/OUTPUT_SCHEMA.md`.
