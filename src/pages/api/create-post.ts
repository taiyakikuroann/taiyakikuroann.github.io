import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export const POST: APIRoute = async ({ request }) => {
  // 開発環境以外でのアクセスを防止（ビルド除外漏れ対策）
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Not allowed in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await request.json();
    const { title, description, tags, type, category, content, draft } = data;

    if (!title || !content || !type) {
      return new Response(JSON.stringify({ error: 'Required fields missing' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const slug = data.slug ? data.slug.trim().toLowerCase() : '';
    if (!slug || !/^[a-z0-9-_]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: 'Slug must be alphanumeric, hyphen, or underscore only' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    
    let frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
`;

    if (type === 'blog') {
      frontmatter += `pubDate: ${todayStr}\n`;
    } else {
      frontmatter += `category: "${(category || 'Other').replace(/"/g, '\\"')}"\n`;
      frontmatter += `updatedDate: ${todayStr}\n`;
    }

    const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    frontmatter += `tags: ${JSON.stringify(tagsArray)}\n`;
    frontmatter += `draft: ${!!draft}\n`;
    frontmatter += `---\n\n${content}\n`;

    const targetDir = type === 'blog' ? 'src/content/blog' : 'src/content/wiki';
    const filePath = path.join(process.cwd(), targetDir, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: `File already exists: ${slug}.md` }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    fs.writeFileSync(filePath, frontmatter, 'utf-8');

    return new Response(JSON.stringify({ success: true, path: `${targetDir}/${slug}.md` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
