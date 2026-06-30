---
name: astro-development-flow
description: Guides the project-scoped AI agents through initializing, styling, content structuring, testing, and deploying an Astro site on GitHub Pages.
---

# Astro Website Development & Deployment Flow

Use this skill to guide the team when building the Astro website for `taiyakikuroann.github.io`.

## 1. Project Initialization

To create a clean Astro project, the DevOps or Frontend Engineer should initialize it in the workspace root.
Because the workspace directory `/Users/shimizutomoko/workspace/my-site/taiyakikuroann.github.io` is already initialized with git and has `index.html` / `README.md`, we should:
1. Initialize a new Astro project using `npm create astro@latest ./ -- --yes --install --git false` (avoiding resetting the git configurations).
2. Clean up any default templates to fit our custom design.

*Command Template:*
```bash
npm create astro@latest ./ -- --template minimal --install --git false --typescript strict
```

---

## 2. Premium Design & Styling Guidelines (Frontend)

To make the site look premium and wow the user:
- **Typography:** Load high-quality Google Fonts (e.g., *Outfit*, *Inter*, or *Playfair Display* for headings) instead of system fonts.
- **Color System:** Use HSL variables in `src/styles/global.css` (e.g. Sleek dark mode or vibrant modern palette) rather than standard primary colors.
- **Glassmorphism & Gradients:** Apply subtle background gradients (`linear-gradient`) and translucent backdrops with `backdrop-filter: blur(10px)`.
- **Transitions:** Use CSS transitions/animations (`transition: all 0.3s ease`) for hover interactions on all cards, links, and buttons.
- **Structure:**
  - Create layout in `src/layouts/Layout.astro` including metadata.
  - Implement components inside `src/components/` (e.g., `Header.astro`, `Card.astro`, `Footer.astro`).

---

## 3. Scalable Content Collections (Content Creator)

Define a robust schema for technical memos to ensure they can scale to a blog or forum later.
- Set up Content Collections in `src/content/config.ts`.
- Structure metadata inside `src/content/memos/` markdown files:
  ```yaml
  title: "Title of Memo"
  description: "Short description"
  pubDate: 2026-06-30
  category: "Tech"
  tags: ["astro", "css"]
  draft: false
  ```
- Retrieve collections in pages:
  ```typescript
  import { getCollection } from 'astro:content';
  const memos = await getCollection('memos', ({ data }) => !data.draft);
  ```

---

## 4. Verification & QA Checks (QA)

Before presenting the build to the user, ensure:
- The site compiles correctly without errors: `npm run build`
- Run linting or styling audits to ensure no layout breakages.
- Check that every page contains a single `<h1>` tag, proper SEO `<meta>` tags (title, description, open graph tags), and unique element IDs.

---

## 5. Local Review & User Feedback Loop (PM)

To obtain feedback from the User:
1. Provide instructions to run `npm run dev` to launch the local preview server.
2. Present the layout design details as a clear markdown artifact.
3. Explicitly ask the User:
   - "How do you feel about the color palette and layout?"
   - "Are the category tags and memo structure aligned with your technical note-taking style?"
4. Receive feedback, document changes needed, and assign them back to the corresponding agents.

---

## 6. GitHub Pages Deployment Configuration (DevOps)

Since this site will be served at `taiyakikuroann.github.io`, configure Astro for base root deploy:
- In `astro.config.mjs`:
  ```javascript
  import { defineConfig } from 'astro/config';
  export default defineConfig({
    site: 'https://taiyakikuroann.github.io',
    // Since it's a user/organization site, base is '/' (default)
  });
  ```
- Set up a GitHub Actions workflow `.github/workflows/deploy.yml` for automated builds:
  ```yaml
  name: Deploy to GitHub Pages

  on:
    push:
      branches: [ main ]

  permissions:
    contents: read
    pages: write
    id-token: write

  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - name: Checkout
          uses: actions/checkout@v4
        - name: Install, build, and upload Astro Site
          uses: withastro/action@v3
  ```
