# Development Plan: Astro Tech Wiki & Blog Site

We are building a premium, highly structured technical wiki and blog site for `taiyakikuroann.github.io`. The goal is to make it easy to write new content (using Markdown) while providing a visually stunning UI.

## 1. Project Requirements
- **Blog Section:** chronological tech updates, thoughts, and longer posts.
- **Tech Wiki Section:** categorized technical reference memos, cheat sheets, and documentation.
- **Profile Section:** a self-introduction page with social links, skills, and projects.
- **Easy Maintenance:** structured content using Astro Content Collections so adding a Markdown file automatically updates the site.
- **Premium Aesthetics:** modern dark/glassmorphic theme, sleek typography, dynamic hover interactions, and micro-animations using Vanilla CSS.

---

## 2. Directory & Routing Architecture

```text
/src
  ├── components/
  │    ├── Header.astro       # Dynamic navigation
  │    ├── Footer.astro       # Copyright and social icons
  │    ├── BlogCard.astro     # Premium card for blog previews
  │    └── WikiCard.astro     # Premium card for wiki pages
  ├── content/
  │    ├── config.ts          # Schemas for 'blog' and 'wiki' collections
  │    ├── blog/              # Markdown files for blog posts
  │    └── wiki/              # Markdown files for wiki articles
  ├── layouts/
  │    └── Layout.astro       # Base layouts, SEO tags, global styles
  ├── pages/
  │    ├── index.astro        # Home / Profile (Self Intro) & Recent items
  │    ├── blog/
  │    │    ├── index.astro   # Blog list page
  │    │    └── [slug].astro  # Blog article dynamic route
  │    └── wiki/
  │         ├── index.astro   # Wiki list & categories page
  │         └── [slug].astro  # Wiki article dynamic route
  └── styles/
       └── global.css         # Core CSS system (HSL, Gradients, Animations)
```

---

## 3. Technology Stack & Design System
- **Framework:** Astro
- **Styling:** Vanilla CSS (CSS variables, dynamic HSL colors, grid layouts, glassmorphism UI)
- **Typography:** *Outfit* (headings) & *Inter* (body text) loaded via Google Fonts
- **Icons:** SVG-based inline icons or CSS gradients for modern representation
- **Deployment:** GitHub Pages (`taiyakikuroann.github.io`) via GitHub Actions

---

## 4. Phase-by-Phase Task List

### Phase 1: Astro Initialization & DevOps Setup
1. [ ] Check `create-astro` options and initialize the project.
2. [ ] Configure `astro.config.mjs` with `site: "https://taiyakikuroann.github.io"`.
3. [ ] Configure GitHub Actions workflow for Page builds.

### Phase 2: Design System & Core Layout (Frontend Dev)
1. [ ] Create `global.css` with dark mode variables, fonts, glassmorphism utils, and animations.
2. [ ] Build `Layout.astro` incorporating SEO head tags.
3. [ ] Design `Header.astro` and `Footer.astro` navigation.

### Phase 3: Content Schema & Mock Data (Content Creator)
1. [ ] Define content collections in `src/content/config.ts`.
2. [ ] Write initial blog and wiki markdown files with rich metadata.

### Phase 4: Page Assembly & Routing (Frontend Dev)
1. [ ] Build the Home/Profile page (`index.astro`).
2. [ ] Build the blog list and post page (`[slug].astro`).
3. [ ] Build the wiki category navigation and post page (`[slug].astro`).

### Phase 5: QA & Verification (QA)
1. [ ] Run `npm run build` to verify compiling.
2. [ ] Review responsive designs, SEO titles, headings, and styling performance.
3. [ ] Prompt the User for review.
