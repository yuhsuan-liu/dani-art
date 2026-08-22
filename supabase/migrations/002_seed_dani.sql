-- Seed Dani as the first artist
-- Replace the email with Dani's actual Gmail address

INSERT INTO artists (email, name, bio)
VALUES (
    'REPLACE_WITH_DANI_EMAIL@gmail.com',
    'Dani',
    'Artist and jazz drummer based in Monterey. Creating art that speaks to the soul.'
)
ON CONFLICT (email) DO NOTHING;

-- Create a default room for Dani
-- (Run this after getting Dani's artist ID)
-- INSERT INTO rooms (artist_id, name, "order", width, height)
-- SELECT id, 'Living Room', 0, 800, 600
-- FROM artists WHERE email = 'REPLACE_WITH_DANI_EMAIL@gmail.com';
