-- Seed initial users
-- Run this AFTER running 001_initial_schema.sql

-- Insert admin (replace with your Gmail)
INSERT INTO users (email, name, bio, role)
VALUES (
    'YOUR_EMAIL@gmail.com',
    'Admin',
    'Site administrator',
    'admin'
);

-- Insert Dani as artist (replace with Dani's Gmail)
INSERT INTO users (email, name, bio, role)
VALUES (
    'DANIS_EMAIL@gmail.com',
    'Dani',
    'Artist and jazz drummer based in Monterey. Creating art that speaks to the soul.',
    'artist'
);

-- Create a default room for Dani
INSERT INTO rooms (user_id, name, "order", width, height)
SELECT id, 'Living Room', 0, 800, 600
FROM users WHERE role = 'artist' LIMIT 1;
