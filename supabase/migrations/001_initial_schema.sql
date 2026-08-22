-- Dani's Art Registry Database Schema
-- Run this in Supabase SQL Editor
-- NOTE: If rebuilding, run the DROP section first

-- ============================================
-- SECTION 1: DROP EXISTING TABLES (if rebuilding)
-- ============================================
-- Uncomment and run this section first if you need to rebuild:

-- DROP TABLE IF EXISTS blog_posts CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS furniture CASCADE;
-- DROP TABLE IF EXISTS artwork CASCADE;
-- DROP TABLE IF EXISTS rooms CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- SECTION 2: CREATE TABLES
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (replaces artists table)
-- Roles: admin, artist, customer
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    profile_pic_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'artist', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table (only artists have rooms)
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    "order" INTEGER DEFAULT 0,
    background_url TEXT,
    width INTEGER DEFAULT 800,
    height INTEGER DEFAULT 600,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artwork table
CREATE TABLE artwork (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT NOT NULL,
    medium TEXT,
    dimensions TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Furniture table
CREATE TABLE furniture (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    position_x INTEGER NOT NULL DEFAULT 0,
    position_y INTEGER NOT NULL DEFAULT 0,
    width INTEGER,
    height INTEGER,
    rotation INTEGER DEFAULT 0,
    z_index INTEGER DEFAULT 0,
    external_url TEXT,
    artwork_id UUID REFERENCES artwork(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'purchased')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID REFERENCES artwork(id),
    furniture_id UUID REFERENCES furniture(id),
    customer_id UUID REFERENCES users(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    delivery_type TEXT NOT NULL CHECK (delivery_type IN ('pickup', 'local_delivery', 'shipping')),
    shipping_address JSONB,
    special_instructions TEXT,
    total_amount DECIMAL(10,2),
    shipping_fee DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('venmo', 'paypal')),
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category TEXT CHECK (category IN ('art_fair', 'drumming', 'general')),
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 3: INDEXES
-- ============================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_rooms_user ON rooms(user_id);
CREATE INDEX idx_artwork_user ON artwork(user_id);
CREATE INDEX idx_artwork_status ON artwork(status);
CREATE INDEX idx_furniture_room ON furniture(room_id);
CREATE INDEX idx_furniture_artwork ON furniture(artwork_id);
CREATE INDEX idx_orders_artwork ON orders(artwork_id);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_blog_posts_user ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(is_published);

-- ============================================
-- SECTION 4: ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE artwork ENABLE ROW LEVEL SECURITY;
ALTER TABLE furniture ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Users: Public read, users can update own profile
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.jwt() ->> 'email' = email);
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE email = auth.jwt() ->> 'email' AND role = 'admin')
);

-- Rooms: Public read, artists/admins can manage
CREATE POLICY "Rooms are viewable by everyone" ON rooms FOR SELECT USING (true);
CREATE POLICY "Artists can manage own rooms" ON rooms FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('artist', 'admin'))
);

-- Artwork: Public read, artists/admins can manage
CREATE POLICY "Artwork is viewable by everyone" ON artwork FOR SELECT USING (true);
CREATE POLICY "Artists can manage own artwork" ON artwork FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('artist', 'admin'))
);

-- Furniture: Public read, artists/admins can manage
CREATE POLICY "Furniture is viewable by everyone" ON furniture FOR SELECT USING (true);
CREATE POLICY "Artists can manage furniture in own rooms" ON furniture FOR ALL USING (
    room_id IN (
        SELECT r.id FROM rooms r 
        JOIN users u ON r.user_id = u.id 
        WHERE u.email = auth.jwt() ->> 'email' AND u.role IN ('artist', 'admin')
    )
);

-- Orders: Customers can create, artists/admins can view/update
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers can view own orders" ON orders FOR SELECT USING (
    customer_email = auth.jwt() ->> 'email'
);
CREATE POLICY "Artists can view orders for their artwork" ON orders FOR SELECT USING (
    artwork_id IN (
        SELECT art.id FROM artwork art
        JOIN users u ON art.user_id = u.id
        WHERE u.email = auth.jwt() ->> 'email' AND u.role IN ('artist', 'admin')
    )
);
CREATE POLICY "Artists can update orders for their artwork" ON orders FOR UPDATE USING (
    artwork_id IN (
        SELECT art.id FROM artwork art
        JOIN users u ON art.user_id = u.id
        WHERE u.email = auth.jwt() ->> 'email' AND u.role IN ('artist', 'admin')
    )
);

-- Blog posts: Public read for published, artists/admins can manage
CREATE POLICY "Published blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Authors can view own unpublished posts" ON blog_posts FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE email = auth.jwt() ->> 'email')
);
CREATE POLICY "Authors can manage own blog posts" ON blog_posts FOR ALL USING (
    user_id IN (SELECT id FROM users WHERE email = auth.jwt() ->> 'email' AND role IN ('artist', 'admin'))
);
