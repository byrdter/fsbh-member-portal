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
