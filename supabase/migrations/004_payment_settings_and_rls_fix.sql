-- Add payment info columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS venmo_handle TEXT,
  ADD COLUMN IF NOT EXISTS paypal_email TEXT;

-- Fix furniture RLS policy to use SECURITY DEFINER helper
-- The old policy caused issues because auth.jwt() isn't always available immediately

DROP POLICY IF EXISTS "Artists can manage furniture in own rooms" ON furniture;

CREATE POLICY "Artists can manage furniture in own rooms" ON furniture
  FOR ALL
  USING (
    room_id IN (
      SELECT r.id FROM rooms r WHERE r.user_id = public.auth_user_id()
    )
    AND public.auth_user_is_artist_or_admin()
  )
  WITH CHECK (
    room_id IN (
      SELECT r.id FROM rooms r WHERE r.user_id = public.auth_user_id()
    )
    AND public.auth_user_is_artist_or_admin()
  );

-- Also fix rooms policy if not already using helpers
DROP POLICY IF EXISTS "Artists can manage own rooms" ON rooms;

CREATE POLICY "Artists can manage own rooms" ON rooms
  FOR ALL
  USING (user_id = public.auth_user_id() AND public.auth_user_is_artist_or_admin())
  WITH CHECK (user_id = public.auth_user_id() AND public.auth_user_is_artist_or_admin());

-- Fix artwork policy
DROP POLICY IF EXISTS "Artists can manage own artwork" ON artwork;

CREATE POLICY "Artists can manage own artwork" ON artwork
  FOR ALL
  USING (user_id = public.auth_user_id() AND public.auth_user_is_artist_or_admin())
  WITH CHECK (user_id = public.auth_user_id() AND public.auth_user_is_artist_or_admin());
