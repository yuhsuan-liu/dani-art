-- Atomic cancel: pending order -> cancelled, artwork/furniture -> available.
-- Run in Supabase SQL Editor after 004.

CREATE OR REPLACE FUNCTION public.cancel_order_and_release(
  p_artwork_id uuid
)
RETURNS orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  art_row artwork%ROWTYPE;
  pending_order orders%ROWTYPE;
BEGIN
  SELECT * INTO art_row FROM artwork WHERE id = p_artwork_id FOR UPDATE;
  IF art_row IS NULL THEN
    RAISE EXCEPTION 'Artwork not found';
  END IF;

  IF art_row.user_id IS DISTINCT FROM public.auth_user_id()
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized to manage this artwork';
  END IF;

  SELECT * INTO pending_order
  FROM orders
  WHERE artwork_id = p_artwork_id
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF pending_order.id IS NOT NULL THEN
    UPDATE orders
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = pending_order.id;

    UPDATE furniture
    SET status = 'available', updated_at = NOW()
    WHERE id = pending_order.furniture_id
      AND status = 'reserved';
  END IF;

  IF art_row.status = 'reserved' THEN
    UPDATE artwork
    SET status = 'available', updated_at = NOW()
    WHERE id = p_artwork_id;
  END IF;

  UPDATE furniture
  SET status = 'available', updated_at = NOW()
  WHERE artwork_id = p_artwork_id
    AND status = 'reserved';

  RETURN pending_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cancel_order_and_release TO authenticated;
