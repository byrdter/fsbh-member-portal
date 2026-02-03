// WordPress XML Parser Script
// Parses WordPress export XML and creates JSON files for import

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const XML_FILE = path.join(__dirname, '../../fsbhtiger.WordPress.2026-02-03.xml');
const OUTPUT_DIR = path.join(__dirname, '../data/imported');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to extract CDATA content
function getCData(value) {
  if (!value) return '';
  if (Array.isArray(value)) value = value[0];
  if (typeof value === 'string') return value;
  if (value._) return value._;
  if (value['_']) return value['_'];
  return '';
}

// Helper to clean HTML content
function cleanContent(html) {
  if (!html) return '';
  // Keep the HTML but clean up some WordPress-specific stuff
  return html
    .replace(/\r\n/g, '\n')
    .replace(/<!--.*?-->/gs, '')
    .trim();
}

async function parseWordPress() {
  console.log('Reading WordPress XML file...');
  const xmlContent = fs.readFileSync(XML_FILE, 'utf-8');

  console.log('Parsing XML...');
  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
  });

  const result = await parser.parseStringPromise(xmlContent);
  const channel = result.rss.channel;

  // Extract categories
  console.log('Extracting categories...');
  const categories = [];
  const wpCategories = channel['wp:category'];
  if (wpCategories) {
    const catArray = Array.isArray(wpCategories) ? wpCategories : [wpCategories];
    for (const cat of catArray) {
      categories.push({
        wpId: parseInt(getCData(cat['wp:term_id'])),
        name: getCData(cat['wp:cat_name']),
        slug: getCData(cat['wp:category_nicename']),
        parentSlug: getCData(cat['wp:category_parent']) || null,
      });
    }
  }
  console.log(`Found ${categories.length} categories`);

  // Extract items (posts, pages, attachments)
  const items = channel.item;
  const itemArray = Array.isArray(items) ? items : [items];

  const posts = [];
  const pages = [];
  const attachments = [];

  console.log('Processing items...');
  for (const item of itemArray) {
    const postType = getCData(item['wp:post_type']);
    const status = getCData(item['wp:status']);

    const baseItem = {
      wpId: parseInt(getCData(item['wp:post_id'])),
      title: getCData(item.title) || '(Untitled)',
      slug: getCData(item['wp:post_name']),
      content: cleanContent(getCData(item['content:encoded'])),
      excerpt: cleanContent(getCData(item['excerpt:encoded'])),
      status: status,
      author: getCData(item['dc:creator']),
      publishedAt: getCData(item['wp:post_date']),
      link: getCData(item.link),
    };

    // Get categories for this item
    const itemCategories = [];
    if (item.category) {
      const cats = Array.isArray(item.category) ? item.category : [item.category];
      for (const cat of cats) {
        if (cat.domain === 'category') {
          itemCategories.push(cat.nicename || getCData(cat));
        }
      }
    }
    baseItem.categories = itemCategories;

    if (postType === 'post' && status === 'publish') {
      posts.push(baseItem);
    } else if (postType === 'page' && status === 'publish') {
      pages.push(baseItem);
    } else if (postType === 'attachment') {
      attachments.push({
        ...baseItem,
        url: getCData(item['wp:attachment_url']),
        mimeType: getCData(item['wp:post_mime_type']),
      });
    }
  }

  console.log(`Found ${posts.length} posts`);
  console.log(`Found ${pages.length} pages`);
  console.log(`Found ${attachments.length} attachments`);

  // Determine access levels based on categories
  const yearbookCategories = ['yearbooks'];
  const photoCategories = ['events-photos', 'reunion-photos', 'photos'];

  for (const post of posts) {
    // Default to 'white' (most restrictive for new members)
    post.accessLevel = 'white';

    // Check if it's a yearbook post
    if (post.categories.some(c => yearbookCategories.includes(c.toLowerCase()))) {
      post.accessLevel = 'tiger'; // Only tiger and admin can see yearbooks
    }
    // Check if it's a photo post
    else if (post.categories.some(c => photoCategories.includes(c.toLowerCase()))) {
      post.accessLevel = 'maroon'; // Maroon, tiger, and admin can see photos
    }
  }

  // Save to JSON files
  console.log('Writing JSON files...');

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'posts.json'),
    JSON.stringify(posts, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'pages.json'),
    JSON.stringify(pages, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'attachments.json'),
    JSON.stringify(attachments, null, 2)
  );

  // Create summary
  const summary = {
    exportDate: new Date().toISOString(),
    counts: {
      categories: categories.length,
      posts: posts.length,
      pages: pages.length,
      attachments: attachments.length,
    },
    categories: categories.map(c => c.name),
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  console.log('\nParsing complete!');
  console.log(`Output written to: ${OUTPUT_DIR}`);
  console.log('\nSummary:');
  console.log(JSON.stringify(summary, null, 2));
}

parseWordPress().catch(console.error);
