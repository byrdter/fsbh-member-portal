import { sql } from '@vercel/postgres';
import { UserRole } from '@/types/next-auth';

export interface DbUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  class_year?: string;
  created_at: Date;
  updated_at: Date;
}

// Initialize the database tables
export async function initializeDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'white',
      class_year VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

// Find user by email
export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result.rows[0] as DbUser | null;
}

// Find user by ID
export async function findUserById(id: string): Promise<DbUser | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${id}
  `;
  return result.rows[0] as DbUser | null;
}

// Create a new user
export async function createUser(
  email: string,
  name: string,
  hashedPassword: string,
  role: UserRole = 'white',
  classYear?: string
): Promise<DbUser> {
  const result = await sql`
    INSERT INTO users (email, name, password, role, class_year)
    VALUES (${email}, ${name}, ${hashedPassword}, ${role}, ${classYear || null})
    RETURNING *
  `;
  return result.rows[0] as DbUser;
}

// Get all users (for admin)
export async function getAllUsers(): Promise<Omit<DbUser, 'password'>[]> {
  const result = await sql`
    SELECT id, email, name, role, class_year, created_at, updated_at
    FROM users
    ORDER BY created_at DESC
  `;
  return result.rows as Omit<DbUser, 'password'>[];
}

// Update user role
export async function updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
  const result = await sql`
    UPDATE users
    SET role = ${newRole}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
  `;
  return (result.rowCount ?? 0) > 0;
}

// Delete user
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM users WHERE id = ${userId}
  `;
  return (result.rowCount ?? 0) > 0;
}

// Seed default users (for initial setup)
export async function seedDefaultUsers(hashedPasswords: {
  admin: string;
  tiger: string;
  maroon: string;
  white: string;
  demo: string;
}) {
  // Check if users already exist
  const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
  if (parseInt(existingUsers.rows[0].count) > 0) {
    return; // Users already seeded
  }

  await sql`
    INSERT INTO users (email, name, password, role, class_year) VALUES
    ('admin@fsbhtiger.com', 'Admin User', ${hashedPasswords.admin}, 'admin', NULL),
    ('tiger@fsbhtiger.com', 'Tiger Member', ${hashedPasswords.tiger}, 'tiger', '1965'),
    ('maroon@fsbhtiger.com', 'Maroon Member', ${hashedPasswords.maroon}, 'maroon', '1960'),
    ('white@fsbhtiger.com', 'White Member', ${hashedPasswords.white}, 'white', '1955'),
    ('demo@fsbhtiger.com', 'Demo Member', ${hashedPasswords.demo}, 'tiger', '1965')
  `;
}
// Database: Neon Postgres

// ==================== CONTENT TABLES ====================

// Initialize content tables
export async function initializeContentTables() {
  // Categories table
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      wp_id INTEGER,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      parent_slug VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Posts table
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      wp_id INTEGER,
      title TEXT NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      content TEXT,
      excerpt TEXT,
      status VARCHAR(50) DEFAULT 'publish',
      post_type VARCHAR(50) DEFAULT 'post',
      featured_image TEXT,
      author VARCHAR(255),
      published_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      access_level VARCHAR(50) DEFAULT 'white'
    )
  `;

  // Post categories junction table
  await sql`
    CREATE TABLE IF NOT EXISTS post_categories (
      post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, category_id)
    )
  `;

  // Media/attachments table
  await sql`
    CREATE TABLE IF NOT EXISTS media (
      id SERIAL PRIMARY KEY,
      wp_id INTEGER,
      title TEXT,
      filename VARCHAR(255),
      url TEXT NOT NULL,
      blob_url TEXT,
      mime_type VARCHAR(100),
      alt_text TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

// Category functions
export async function createCategory(name: string, slug: string, wpId?: number, parentSlug?: string) {
  const result = await sql`
    INSERT INTO categories (name, slug, wp_id, parent_slug)
    VALUES (${name}, ${slug}, ${wpId || null}, ${parentSlug || null})
    ON CONFLICT (slug) DO UPDATE SET name = ${name}
    RETURNING *
  `;
  return result.rows[0];
}

export async function getAllCategories() {
  const result = await sql`SELECT * FROM categories ORDER BY name`;
  return result.rows;
}

export async function updateCategory(id: number, name: string, slug: string, parentSlug?: string) {
  const result = await sql`
    UPDATE categories
    SET name = ${name}, slug = ${slug}, parent_slug = ${parentSlug || null}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] || null;
}

export async function deleteCategory(id: number): Promise<boolean> {
  await sql`DELETE FROM post_categories WHERE category_id = ${id}`;
  const result = await sql`DELETE FROM categories WHERE id = ${id}`;
  return (result.rowCount ?? 0) > 0;
}

// Post functions
export async function createPost(post: {
  wpId?: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  status?: string;
  postType?: string;
  featuredImage?: string;
  author?: string;
  publishedAt?: Date;
  accessLevel?: string;
}) {
  const result = await sql`
    INSERT INTO posts (wp_id, title, slug, content, excerpt, status, post_type, featured_image, author, published_at, access_level)
    VALUES (
      ${post.wpId || null},
      ${post.title},
      ${post.slug},
      ${post.content || null},
      ${post.excerpt || null},
      ${post.status || 'publish'},
      ${post.postType || 'post'},
      ${post.featuredImage || null},
      ${post.author || null},
      ${post.publishedAt?.toISOString() || null},
      ${post.accessLevel || 'white'}
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = ${post.title},
      content = ${post.content || null},
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  return result.rows[0];
}

export async function getPostsByCategory(categorySlug: string, limit = 50, offset = 0) {
  const result = await sql`
    SELECT p.* FROM posts p
    JOIN post_categories pc ON p.id = pc.post_id
    JOIN categories c ON pc.category_id = c.id
    WHERE c.slug = ${categorySlug} AND p.status = 'publish'
    ORDER BY p.published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result.rows;
}

export async function getPostsByType(postType: string, limit = 50, offset = 0) {
  const result = await sql`
    SELECT * FROM posts
    WHERE post_type = ${postType} AND status = 'publish'
    ORDER BY published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result.rows;
}

export async function getPostBySlug(slug: string) {
  const result = await sql`
    SELECT * FROM posts WHERE slug = ${slug}
  `;
  return result.rows[0] || null;
}

export async function linkPostToCategory(postId: number, categoryId: number) {
  await sql`
    INSERT INTO post_categories (post_id, category_id)
    VALUES (${postId}, ${categoryId})
    ON CONFLICT DO NOTHING
  `;
}

export async function updatePost(id: number, post: {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: string;
  featuredImage?: string;
  author?: string;
  accessLevel?: string;
}) {
  const result = await sql`
    UPDATE posts SET
      title = COALESCE(${post.title || null}, title),
      slug = COALESCE(${post.slug || null}, slug),
      content = COALESCE(${post.content ?? null}, content),
      excerpt = COALESCE(${post.excerpt ?? null}, excerpt),
      status = COALESCE(${post.status || null}, status),
      featured_image = COALESCE(${post.featuredImage ?? null}, featured_image),
      author = COALESCE(${post.author ?? null}, author),
      access_level = COALESCE(${post.accessLevel || null}, access_level),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0] || null;
}

export async function deletePost(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM posts WHERE id = ${id}`;
  return (result.rowCount ?? 0) > 0;
}

export async function unlinkPostCategories(postId: number) {
  await sql`DELETE FROM post_categories WHERE post_id = ${postId}`;
}

// Media functions
export async function createMedia(media: {
  wpId?: number;
  title?: string;
  filename?: string;
  url: string;
  blobUrl?: string;
  mimeType?: string;
  altText?: string;
}) {
  const result = await sql`
    INSERT INTO media (wp_id, title, filename, url, blob_url, mime_type, alt_text)
    VALUES (
      ${media.wpId || null},
      ${media.title || null},
      ${media.filename || null},
      ${media.url},
      ${media.blobUrl || null},
      ${media.mimeType || null},
      ${media.altText || null}
    )
    RETURNING *
  `;
  return result.rows[0];
}

export async function getAllMedia(limit = 100, offset = 0) {
  const result = await sql`
    SELECT * FROM media
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result.rows;
}
