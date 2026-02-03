# FSBH Member Portal - Project Tasks

## Project Info
- **Production URL:** https://fsbh-member-portal.vercel.app
- **GitHub Repo:** https://github.com/byrdter/fsbh-member-portal.git
- **Database:** Neon Postgres (via Vercel Marketplace)

## User Roles & Access Levels
| Role | Yearbooks | Photos | History | Admin |
|------|-----------|--------|---------|-------|
| admin | ✓ | ✓ | ✓ | ✓ |
| tiger | ✓ | ✓ | ✓ | - |
| maroon | - | ✓ | ✓ | - |
| white | - | - | ✓ | - |

## Default Test Users
- admin@fsbhtiger.com / admin123
- tiger@fsbhtiger.com / tiger123
- maroon@fsbhtiger.com / maroon123
- white@fsbhtiger.com / white123
- demo@fsbhtiger.com / demo123

---

## Completed Tasks
- [x] Set up Next.js project with TypeScript
- [x] Implement NextAuth.js authentication
- [x] Create role-based access control (admin, tiger, maroon, white)
- [x] Remove photo access from white role
- [x] Deploy to Vercel with GitHub integration
- [x] Set up Neon Postgres database
- [x] Create users table and seed default users
- [x] Parse WordPress XML export (196 posts, 14 categories, 2778 attachments)
- [x] Create content tables schema (categories, posts, post_categories, media)
- [x] Create /api/import endpoint for WordPress content
- [x] Run /api/setup on production to create content tables
- [x] Run /api/import on production to import WordPress content
- [x] Create API endpoints for content (/api/posts, /api/categories, /api/posts/[slug])
- [x] Update History page to fetch from database
- [x] Update Photos page to fetch from database (events-photos category)
- [x] Update Yearbooks page to fetch from database (yearbooks category)
- [x] Create post detail page (/post/[slug])

## In Progress
- [ ] Test content display pages on production

## Pending Tasks
- [ ] Set up Vercel Blob storage for media files
- [ ] Download and migrate 2,778 media files from WordPress
- [ ] Clean WordPress content HTML (remove Elementor shortcodes, fix image URLs)
- [ ] Handle 83 WordPress pages (rebuild or extract content)
- [ ] Build admin dashboard for user management
- [ ] Build admin dashboard for content management
- [ ] Add pagination to content listing pages

---

## API Endpoints
- `/api/setup` - Initialize database tables and seed users
- `/api/import` - Import WordPress content from JSON files
- `/api/register` - User registration (defaults to 'white' role)
- `/api/auth/[...nextauth]` - NextAuth.js authentication
- `/api/posts` - Get posts (supports ?category=slug, ?limit=N, ?offset=N)
- `/api/posts/[slug]` - Get single post by slug
- `/api/categories` - Get all categories with post counts

## Content Pages
- `/history` - All posts, filterable by category (all members)
- `/photos` - Posts in events-photos category (maroon+ access)
- `/yearbooks` - Posts in yearbooks category (tiger+ access)
- `/post/[slug]` - View single post content

## WordPress Import Stats
- Categories: 14
- Posts: 196
- Pages: 83 (not yet migrated - contain Elementor content)
- Attachments: 2,778 (not yet migrated)
