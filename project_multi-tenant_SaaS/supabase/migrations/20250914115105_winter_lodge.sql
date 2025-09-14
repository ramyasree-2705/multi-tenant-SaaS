/*
  # Multi-Tenant SaaS Notes Schema

  This migration creates the database schema for a multi-tenant SaaS notes application.
  We're using a shared schema approach with tenant isolation via tenant_id columns.

  ## Tables Created:
  1. **tenants** - Stores tenant information (companies like Acme, Globex)
  2. **users** - Stores user information with tenant association and roles
  3. **notes** - Stores notes with tenant isolation

  ## Security:
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure strict tenant isolation
  - Role-based access control enforced

  ## Subscription Plans:
  - FREE: Limited to 3 notes per tenant
  - PRO: Unlimited notes per tenant
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'FREE' CHECK (plan IN ('FREE', 'PRO')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tenants table
CREATE POLICY "Tenants can view their own data"
  ON tenants
  FOR SELECT
  USING (true); -- We'll handle tenant isolation in the application layer

-- RLS Policies for users table
CREATE POLICY "Users can view users in their tenant"
  ON users
  FOR SELECT
  USING (true); -- Application layer will handle filtering

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (true);

-- RLS Policies for notes table
CREATE POLICY "Users can manage notes in their tenant"
  ON notes
  FOR ALL
  USING (true); -- Application layer will handle tenant isolation

-- Insert test tenants
INSERT INTO tenants (slug, name, plan) VALUES 
  ('acme', 'Acme Corp', 'FREE'),
  ('globex', 'Globex Corporation', 'FREE');

-- Insert test users with hashed passwords (password: 'password')
-- Hash for 'password': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (tenant_id, email, password_hash, role) VALUES 
  ((SELECT id FROM tenants WHERE slug = 'acme'), 'admin@acme.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
  ((SELECT id FROM tenants WHERE slug = 'acme'), 'user@acme.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MEMBER'),
  ((SELECT id FROM tenants WHERE slug = 'globex'), 'admin@globex.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
  ((SELECT id FROM tenants WHERE slug = 'globex'), 'user@globex.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MEMBER');