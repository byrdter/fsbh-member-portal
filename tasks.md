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

## In Progress
- [ ] Run /api/setup on production to create content tables
- [ ] Run /api/import on production to import WordPress content

## Pending Tasks
- [ ] Create pages to display imported content with access control
- [ ] Set up Vercel Blob storage for media files
- [ ] Download and migrate 2,778 media files from WordPress
- [ ] Create yearbooks section (tiger+ access)
- [ ] Create photos section (maroon+ access)
- [ ] Create history section (all members)
- [ ] Build admin dashboard for user management
- [ ] Build admin dashboard for content management

---

## API Endpoints
- `/api/setup` - Initialize database tables and seed users
- `/api/import` - Import WordPress content from JSON files
- `/api/register` - User registration (defaults to 'white' role)
- `/api/auth/[...nextauth]` - NextAuth.js authentication

## WordPress Import Stats
- Categories: 14
- Posts: 196
- Pages: 83
- Attachments: 2,778
