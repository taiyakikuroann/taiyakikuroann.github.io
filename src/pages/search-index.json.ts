import { getCollection } from 'astro:content';

export async function GET() {
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);
  const wikiPosts = await getCollection('wiki', ({ data }) => !data.draft);

  const searchIndex = [
    ...blogPosts.map(post => ({
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags || [],
      type: 'blog',
      category: 'Blog',
      url: `/blog/${post.slug}`
    })),
    ...wikiPosts.map(post => ({
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags || [],
      type: 'wiki',
      category: `Wiki (${post.data.category})`,
      url: `/wiki/${post.slug}`
    }))
  ];

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json' }
  });
}
