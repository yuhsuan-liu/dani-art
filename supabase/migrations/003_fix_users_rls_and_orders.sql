-- Fix infinite recursion on users RLS (42P17) and guest checkout via RPC.
-- Run in Supabase SQL Editor after 001 + 002.

-- ── Helpers (SECURITY DEFINER bypasses RLS on internal reads) ───────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE email = auth.jwt() ->> 'email'
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM users WHERE email = auth.jwt() ->> 'email' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.auth_user_is_artist_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE email = auth.jwt() ->> 'email'
      AND role IN ('artist', 'admin')
  );
$$;

DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users" ON users
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Optional: simplify artist policies (avoids extra users subqueries under RLS)
DROP POLICY IF EXISTS "Artists can manage own rooms" ON rooms;
CREATE POLICY "Artists can manage own rooms" ON rooms
  FOR ALL
  USING (user_id = public.auth_user_id() AND public.auth_user_is_artist_or_admin())
  WITH CHECK (user_id = public.auth_user_id() AND public.auth_user_is_artist_or_admin());

DROP POLICY IF EXISTS "Artists can manage own artwork" ON artwork;
CREATE POLICY "Artists can manage own artwork" ON artwork
  FOR ALL
  USING (user_id = public.auth_user_id() AND public.auth_user_is_artist_or_admin())
  WITH CHECK (user_id = public.auth_user_id() AND public.auth_user_is_artist_or_admin());

-- ── Room decor (walls, floor, carpet) ───────────────────────────────────────

ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS decor JSONB NOT NULL DEFAULT '{
    "wall_style": "warm",
    "floor_style": "oak",
    "carpet": { "enabled": true, "tone": "sand" }
  }'::jsonb;

-- ── Guest checkout (anon buyers, no SELECT on orders needed) ────────────────

CREATE OR REPLACE FUNCTION public.create_guest_order(
  p_artwork_id uuid,
  p_furniture_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_delivery_type text,
  p_shipping_address jsonb,
  p_special_instructions text,
  p_total_amount numeric,
  p_shipping_fee numeric,
  p_payment_method text
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  art_status text;
  furn_status text;
  new_order orders;
BEGIN
  SELECT status INTO art_status FROM artwork WHERE id = p_artwork_id FOR UPDATE;
  IF art_status IS NULL THEN
    RAISE EXCEPTION 'Artwork not found';
  END IF;
  IF art_status <> 'available' THEN
    RAISE EXCEPTION 'Artwork is no longer available';
  END IF;

  SELECT status INTO furn_status FROM furniture WHERE id = p_furniture_id FOR UPDATE;
  IF furn_status IS NULL THEN
    RAISE EXCEPTION 'Furniture not found';
  END IF;
  IF furn_status <> 'available' THEN
    RAISE EXCEPTION 'Linked furniture is no longer available';
  END IF;

  INSERT INTO orders (
    artwork_id,
    furniture_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_type,
    shipping_address,
    special_instructions,
    total_amount,
    shipping_fee,
    status,
    payment_method
  ) VALUES (
    p_artwork_id,
    p_furniture_id,
    p_customer_name,
    p_customer_email,
    NULLIF(trim(p_customer_phone), ''),
    p_delivery_type,
    p_shipping_address,
    NULLIF(trim(p_special_instructions), ''),
    p_total_amount,
    p_shipping_fee,
    'pending',
    p_payment_method
  )
  RETURNING * INTO new_order;

  UPDATE artwork SET status = 'reserved', updated_at = NOW() WHERE id = p_artwork_id;
  UPDATE furniture SET status = 'reserved', updated_at = NOW() WHERE id = p_furniture_id;

  RETURN new_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_guest_order TO anon, authenticated;
