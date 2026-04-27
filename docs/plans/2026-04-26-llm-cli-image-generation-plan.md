# LLM + CLI + Carousel Image Automation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add an LLM-powered generation path, a usable CLI command for blog URLs, and automated carousel image generation support while keeping publishing out of scope.

**Architecture:**
The repo will keep its current extraction + workflow core, but add a thin orchestration layer that can run in three modes: deterministic local rules, LLM-assisted generation, and optional image rendering for carousel slides. The workflow should always emit a structured social package, and the CLI should make it easy to run from a blog URL and save JSON or image artifacts.

**Tech Stack:**
Node.js 20+, native `node:test`, built-in `fetch`, optional OpenAI-compatible HTTP APIs via env vars, `sharp` or simple file output only if image rendering is added later, and plain ES modules.

---

### Task 1: Add a generator abstraction and LLM-backed content generation path

**Objective:** Create a provider interface that can turn an article brief into Facebook copy, Instagram copy, and carousel slide plans using either deterministic rules or a remote LLM API.

**Files:**
- Create: `src/generator.js`
- Modify: `src/workflow.js`
- Modify: `src/prompts.js`
- Test: `tests/generator.test.js`

**Step 1: Write failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSocialPackage } from '../src/generator.js';

test('generateSocialPackage uses the provided LLM adapter', async () => {
  const adapter = {
    generate: async () => ({
      facebookPost: { copy: 'FB', cta: 'CTA', linkStrategy: 'link' },
      instagramCaption: { copy: 'IG', cta: 'CTA', hashtags: ['#tag'] },
      carousel: [],
    }),
  };

  const output = await generateSocialPackage({ title: 'T', summary: 'S', keyPoints: [] }, { adapter });
  assert.equal(output.facebookPost.copy, 'FB');
});
```

**Step 2: Run test to verify failure**

Run: `node --test tests/generator.test.js`
Expected: FAIL — module or function missing

**Step 3: Write minimal implementation**

```js
export async function generateSocialPackage(article, { adapter }) {
  return adapter.generate(article);
}
```

**Step 4: Run test to verify pass**

Run: `node --test tests/generator.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/generator.js tests/generator.test.js src/workflow.js src/prompts.js
git commit -m "feat: add generator abstraction"
```

---

### Task 2: Add a CLI command for blog URLs and local/LLM generation modes

**Objective:** Provide a single command that fetches a blog URL, extracts article data, runs the workflow, and writes JSON output.

**Files:**
- Create: `src/cli.js`
- Modify: `package.json`
- Modify: `README.md`
- Test: `tests/cli.test.js`

**Step 1: Write failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../src/cli.js';

test('parseArgs reads url and output path', () => {
  const args = parseArgs(['--url', 'https://example.com', '--out', 'out.json']);
  assert.equal(args.url, 'https://example.com');
  assert.equal(args.out, 'out.json');
});
```

**Step 2: Run test to verify failure**

Run: `node --test tests/cli.test.js`
Expected: FAIL — parseArgs missing

**Step 3: Write minimal implementation**

```js
export function parseArgs(argv) {
  return { url: argv[1], out: argv[3] };
}
```

**Step 4: Run test to verify pass**

Run: `node --test tests/cli.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/cli.js tests/cli.test.js package.json README.md
git commit -m "feat: add CLI entrypoint"
```

---

### Task 3: Add carousel image generation automation

**Objective:** Add an automation path that can turn each recommended carousel slide into an image-generation job or image asset request.

**Files:**
- Create: `src/image-generation.js`
- Modify: `src/generator.js`
- Modify: `src/cli.js`
- Test: `tests/image-generation.test.js`

**Step 1: Write failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildImageJobsForCarousel } from '../src/image-generation.js';

test('buildImageJobsForCarousel creates one job per slide', () => {
  const jobs = buildImageJobsForCarousel([
    { slide: 1, imagePrompt: 'A', altText: 'a' },
    { slide: 2, imagePrompt: 'B', altText: 'b' },
  ]);

  assert.equal(jobs.length, 2);
  assert.equal(jobs[0].slide, 1);
});
```

**Step 2: Run test to verify failure**

Run: `node --test tests/image-generation.test.js`
Expected: FAIL — function missing

**Step 3: Write minimal implementation**

```js
export function buildImageJobsForCarousel(carousel) {
  return carousel.map((slide) => ({ slide: slide.slide, prompt: slide.imagePrompt, altText: slide.altText }));
}
```

**Step 4: Run test to verify pass**

Run: `node --test tests/image-generation.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/image-generation.js tests/image-generation.test.js src/workflow.js
git commit -m "feat: add carousel image automation"
```

---

### Task 4: Final integration, docs, and verification

**Objective:** Wire the new generator, CLI, and image jobs together, verify the demo, and document how to use the repo.

**Files:**
- Modify: `src/demo.js`
- Modify: `README.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/OUTPUT_SCHEMA.md`
- Test: `tests/workflow.test.js`

**Verification**

Run:
- `npm test`
- `node src/demo.js`

Expected:
- tests pass
- demo emits JSON with content brief, platform copy, prompts, and image jobs

**Commit**

```bash
git add -A
git commit -m "feat: integrate generator, cli, and image automation"
```
