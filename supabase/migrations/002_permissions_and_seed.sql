-- =============================================
-- STEP 2: RUN AFTER migration 001_initial_schema.sql
-- This fixes permissions and adds test data
-- =============================================

-- =============================================
-- PART A: FIX PERMISSIONS
-- =============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON orders TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;

-- =============================================
-- PART B: SEED TEST DATA
-- =============================================

-- Add Dani as artist
INSERT INTO users (email, name, bio, role)
VALUES ('dani@test.com', 'Dani', 'Artist and jazz drummer based in Monterey. Creating art that speaks to the soul.', 'artist')
ON CONFLICT (email) DO NOTHING;

-- Add admin
INSERT INTO users (email, name, bio, role)
VALUES ('admin@test.com', 'Admin', 'Site administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Get Dani's user ID for subsequent inserts
DO $$
DECLARE
  dani_id UUID;
  bedroom_id UUID;
  art1_id UUID;
  art2_id UUID;
  art3_id UUID;
BEGIN
  -- Get Dani's ID
  SELECT id INTO dani_id FROM users WHERE name = 'Dani' LIMIT 1;
  
  IF dani_id IS NULL THEN
    RAISE NOTICE 'Dani not found, skipping seed data';
    RETURN;
  END IF;

  -- Create Bedroom if not exists
  IF NOT EXISTS (SELECT 1 FROM rooms WHERE user_id = dani_id) THEN
    INSERT INTO rooms (user_id, name, "order", width, height)
    VALUES (dani_id, 'Bedroom', 0, 800, 560)
    RETURNING id INTO bedroom_id;
  ELSE
    SELECT id INTO bedroom_id FROM rooms WHERE user_id = dani_id LIMIT 1;
  END IF;

  -- Add artwork if not exists
  IF NOT EXISTS (SELECT 1 FROM artwork WHERE user_id = dani_id AND title = 'Sunset Over Monterey') THEN
    INSERT INTO artwork (user_id, title, description, price, image_url, medium, dimensions, status)
    VALUES (dani_id, 'Sunset Over Monterey', 'A beautiful sunset painting capturing the golden hour over Monterey Bay.', 400, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800', 'Oil on canvas', '24x36 inches', 'available')
    RETURNING id INTO art1_id;
  ELSE
    SELECT id INTO art1_id FROM artwork WHERE user_id = dani_id AND title = 'Sunset Over Monterey' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM artwork WHERE user_id = dani_id AND title = 'Jazz Night') THEN
    INSERT INTO artwork (user_id, title, description, price, image_url, medium, dimensions, status)
    VALUES (dani_id, 'Jazz Night', 'Abstract representation of a jazz performance.', 250, 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', 'Acrylic on canvas', '18x24 inches', 'available')
    RETURNING id INTO art2_id;
  ELSE
    SELECT id INTO art2_id FROM artwork WHERE user_id = dani_id AND title = 'Jazz Night' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM artwork WHERE user_id = dani_id AND title = 'Ocean Waves') THEN
    INSERT INTO artwork (user_id, title, description, price, image_url, medium, dimensions, status)
    VALUES (dani_id, 'Ocean Waves', 'Capturing the powerful motion of Pacific waves.', 350, 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800', 'Watercolor', '20x30 inches', 'available')
    RETURNING id INTO art3_id;
  ELSE
    SELECT id INTO art3_id FROM artwork WHERE user_id = dani_id AND title = 'Ocean Waves' LIMIT 1;
  END IF;

  -- Add furniture if not exists
  IF NOT EXISTS (SELECT 1 FROM furniture WHERE room_id = bedroom_id AND name = 'Bed Frame') THEN
    INSERT INTO furniture (room_id, name, image_url, price, position_x, position_y, width, height, artwork_id, status)
    VALUES (bedroom_id, 'Bed Frame', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400', 400, 300, 100, 220, 180, art1_id, 'available');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM furniture WHERE room_id = bedroom_id AND name = 'Nightstand Lamp') THEN
    INSERT INTO furniture (room_id, name, image_url, price, position_x, position_y, width, height, artwork_id, status)
    VALUES (bedroom_id, 'Nightstand Lamp', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 250, 550, 150, 80, 100, art2_id, 'available');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM furniture WHERE room_id = bedroom_id AND name = 'Dresser') THEN
    INSERT INTO furniture (room_id, name, image_url, price, position_x, position_y, width, height, artwork_id, status)
    VALUES (bedroom_id, 'Dresser', 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400', 350, 80, 200, 150, 120, art3_id, 'available');
  END IF;

  RAISE NOTICE 'Seed data created successfully for Dani (ID: %)', dani_id;
END $$;

-- =============================================
-- VERIFY: Run these to check
-- =============================================
-- SELECT * FROM users;
-- SELECT * FROM rooms;
-- SELECT * FROM artwork;
-- SELECT * FROM furniture;
