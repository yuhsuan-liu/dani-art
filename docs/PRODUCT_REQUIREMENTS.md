# Dani's Art Registry - Product Requirements Document

> **Project Type:** Gift project for artist friend Dani  
> **Last Updated:** August 21, 2026  
> **Status:** Planning Phase

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [User Roles & Personas](#3-user-roles--personas)
4. [Use Cases & User Flows](#4-use-cases--user-flows)
5. [Feature Specifications](#5-feature-specifications)
6. [Data Models](#6-data-models)
7. [UI/UX Guidelines](#7-uiux-guidelines)
8. [Payment & Shipping Logic](#8-payment--shipping-logic)
9. [Development Phases](#9-development-phases)
10. [Setup & Deployment Guide](#10-setup--deployment-guide)

---

## 1. Project Overview

### 1.1 Concept

An "art registry" web application that presents Dani's artwork for sale in a unique, visual way. Instead of a traditional gallery, customers see a **floor map of a room** with furniture. Each piece of furniture has a price tag representing an artwork Dani is selling. When a customer buys the artwork, Dani gets that piece of furniture.

**The Goal:** "So people know if they buy this painting, Dani gets a new mattress!"

### 1.2 Core Value Proposition

- **For Dani:** A fun, visual way to manage art sales while showing supporters what their purchase helps him acquire
- **For Customers:** A transparent, engaging way to support their favorite artist with tangible impact

### 1.3 Key Differentiators

- Visual room/floor map interface (IKEA-style)
- Hand-drawn furniture by Dani (personal touch)
- Real-time visual feedback on what's purchased vs available
- Multiple "rooms" for different goals (living room, drum studio, etc.)

---

## 2. Tech Stack

### 2.1 Frontend

| Technology | Purpose |
|------------|---------|
| **React 18+** | UI library for building component-based interfaces |
| **TypeScript** | Typed JavaScript for better code quality and IDE support |
| **Vite** | Fast build tool and dev server |
| **React Router** | Client-side routing |
| **Zustand or React Context** | State management |
| **React DnD or @dnd-kit** | Drag-and-drop functionality for floor map |
| **TailwindCSS** | Utility-first CSS for clean, responsive design |

> **Note:** React is the UI framework; TypeScript is the programming language. You use them together. TypeScript adds type safety to JavaScript, catching errors at compile time.

### 2.2 Backend

| Technology | Purpose |
|------------|---------|
| **Python 3.11+** | Backend programming language |
| **FastAPI** | Modern, fast web framework with automatic OpenAPI docs |
| **Pydantic** | Data validation and settings management |
| **Supabase Python Client** | Database and auth integration |

### 2.3 Database & Auth

| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database + Authentication + Storage |
| **Supabase Auth** | Google OAuth for Dani's login |
| **Supabase Storage** | Image storage for artwork and furniture drawings |

### 2.4 Hosting

| Service | What It Hosts |
|---------|---------------|
| **GitHub Pages** | Frontend static files (free) |
| **Render** | Backend Python API (free tier available) |
| **Supabase** | Database and file storage (free tier: 500MB DB, 1GB storage) |

### 2.5 Additional Tools

| Tool | Purpose |
|------|---------|
| **Venmo/PayPal** | External payment (redirect flow) |
| **GitHub Actions** | CI/CD for automatic deployments |

---

## 3. User Roles & Personas

### 3.1 Artist (Dani)

- **Authentication:** Google OAuth (Gmail login)
- **Access:** Full dashboard, floor map editor, art management, blog
- **Permissions:** Create, edit, delete all content

### 3.2 Customer (Anonymous)

- **Authentication:** None required
- **Access:** Public floor map view, artist profiles, ordering flow
- **Permissions:** View-only + ability to place orders

### 3.3 Future Consideration: Multiple Artists

- Current scope: Only Dani
- Architecture should support multiple artists for potential expansion

---

## 4. Use Cases & User Flows

### 4.1 Artist (Dani) Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                     DANI'S USER JOURNEY                         │
└─────────────────────────────────────────────────────────────────┘

[Landing Page] → [Login with Google] → [Dashboard]
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
                    ▼                       ▼                       ▼
            [Floor Map Editor]      [Art Management]         [Blog Editor]
                    │                       │                       │
                    ▼                       ▼                       ▼
            - View rooms            - Upload artwork         - Create posts
            - Toggle edit mode      - Bulk upload            - Edit posts
            - Drag furniture        - Link to furniture      - Delete posts
            - Add/remove rooms      - Set prices
            - Link art to furniture - Manage orders
```

#### UC-1.1: Dani Logs In and Views Dashboard

**Precondition:** Dani has a Gmail account

**Flow:**
1. Dani navigates to website
2. Clicks "Artist Login" 
3. Redirected to Google OAuth
4. Authorizes application
5. Redirected to Dashboard

**Dashboard Displays:**
- Sales summary (total revenue, # of artworks sold)
- Current active listings count
- Recent transactions (last 5-10)
- Quick links to Floor Map and Art Management

#### UC-1.2: Dani Views Floor Map (Preview Mode)

**Flow:**
1. From Dashboard, click "View Floor Map"
2. See room visualization with furniture pieces
3. Furniture colors indicate status:
   - **Grayscale/Muted:** Available for purchase
   - **Vibrant/Colored:** Purchased
4. Hover on furniture shows:
   - Furniture name and price
   - Linked artwork thumbnail
   - If purchased: buyer initials + date
5. Click room tabs to switch between rooms

#### UC-1.3: Dani Edits Floor Map

**Flow:**
1. On Floor Map page, toggle "Edit Mode" switch
2. Edit mode enables:
   - Drag furniture to reposition
   - Click furniture to open edit panel:
     - Change linked artwork
     - Replace furniture image
     - Update furniture name
     - Set external link (actual furniture listing URL)
   - Add new furniture (from Dani's uploaded drawings)
   - Delete furniture
   - Add new room
3. Changes auto-save to database (debounced)
4. Toggle off Edit Mode to preview

#### UC-1.4: Dani Manages Art (List View)

**Flow:**
1. Navigate to "Art Management" page
2. View table with columns:
   - Thumbnail | Title | Price | Linked Furniture | Status | Actions
3. Actions available:
   - Edit artwork details
   - Link/unlink furniture
   - Delete artwork
4. Filter/sort by: Status (available, reserved, sold), Price, Date added
5. Bulk upload option:
   - Select multiple images
   - Images uploaded with default "Untitled" + timestamp
   - Edit details individually after upload

#### UC-1.5: Dani Uploads Furniture Drawings

**Flow:**
1. In Floor Map Edit Mode, click "Add Furniture"
2. Upload hand-drawn furniture image (PNG with transparency preferred)
3. Enter furniture details:
   - Name (e.g., "Cozy Couch")
   - Target price (e.g., $400)
   - External link (optional - link to actual furniture listing)
   - Size category (small, medium, large) - affects drag area
4. Furniture appears on canvas, draggable to position

---

### 4.2 Customer Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                   CUSTOMER USER JOURNEY                         │
└─────────────────────────────────────────────────────────────────┘

[Landing Page] → [How It Works] → [Select Artist] → [Artist Profile + Floor Map]
                                                            │
                                        ┌───────────────────┴───────────────────┐
                                        │                                       │
                                        ▼                                       ▼
                                [Click Furniture]                    [View List Mode]
                                        │                                       │
                                        ▼                                       │
                                [Art Detail Modal]◄─────────────────────────────┘
                                        │
                                        ▼
                                [Order Form]
                                        │
                                        ▼
                                [Venmo/PayPal Redirect]
                                        │
                                        ▼
                                [Confirmation Page]
```

#### UC-2.1: Customer Discovers the Site

**Flow:**
1. Customer lands on homepage
2. Sees intro section:
   - "Support your favorite artist like an art registry!"
   - Brief explanation with visuals
3. Scrolls to "Featured Artists" (currently just Dani)
4. Clicks on Dani's profile card

#### UC-2.2: Customer Views Artist Profile

**Flow:**
1. Artist page shows:
   - Profile photo
   - Bio/intro text
   - "View Dani's Wishlist" CTA
2. Below: Floor Map visualization
3. Optional: Toggle to "List View" for table format

#### UC-2.3: Customer Explores Floor Map

**Flow:**
1. See room with furniture
2. Visual indicators:
   - **Muted/Gray:** Available to purchase
   - **Colored + checkmark:** Already purchased
   - **Yellow/Orange border:** Reserved/In Progress
3. Hover on available furniture:
   - Furniture name
   - Price (= artwork price)
   - "Click to view artwork"
4. Hover on purchased furniture:
   - "Purchased by J.S. on Aug 15, 2026"
   - Artwork thumbnail
5. Click room tabs to explore different rooms

#### UC-2.4: Customer Views Artwork Detail

**Flow:**
1. Click on available furniture piece
2. Modal opens showing:
   - Large artwork image
   - Artwork title
   - Price
   - Medium/dimensions (if provided)
   - "What this supports:" → Shows furniture + external link
3. CTA: "Purchase This Artwork"

#### UC-2.5: Customer Places Order

**Flow:**
1. Click "Purchase This Artwork"
2. Order form appears:
   - Full Name
   - Email
   - Phone (optional)
   - Delivery method:
     - **Local Pickup** (Monterey) - Free
     - **Local Delivery** (within 30 min of Monterey) - $X
     - **Shipping** - Flat rate tiers or "Contact for quote"
   - Shipping address (if applicable)
   - Special instructions
3. Review order summary
4. Click "Proceed to Payment"
5. Redirect to Venmo/PayPal with pre-filled amount
6. After payment, redirect back to confirmation page
7. Order status: "Reserved" → Dani confirms → "Ordered" → "Shipped" → "Completed"

#### UC-2.6: Customer Uses List View

**Flow:**
1. Toggle "List View" on artist page
2. See table with:
   - Artwork thumbnail | Title | Price | Status | Furniture it supports
3. Filter by: Available only, Price range
4. Click row to open artwork detail modal

---

### 4.3 Blog Flows

#### UC-3.1: Dani Creates Blog Post

**Flow:**
1. Navigate to Blog section in dashboard
2. Click "New Post"
3. Rich text editor with:
   - Title
   - Content (markdown or WYSIWYG)
   - Featured image (optional)
   - Category tags (Art Fair, Drumming Lessons, etc.)
4. Save as draft or publish
5. Posts appear on public blog page

#### UC-3.2: Customer Reads Blog

**Flow:**
1. Navigate to Blog from main nav
2. See list of posts (newest first)
3. Click to read full post
4. Share buttons (optional)

---

## 5. Feature Specifications

### 5.1 Floor Map / Room Editor

#### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Room Canvas | Scalable canvas representing a room | P0 |
| Furniture Placement | Position furniture items anywhere on canvas | P0 |
| Drag & Drop | Reposition furniture in edit mode | P0 |
| Multiple Rooms | Add/switch between rooms (Living Room, Drum Room) | P1 |
| Zoom/Pan | Navigate large rooms on mobile | P1 |
| Furniture States | Visual differentiation: available, reserved, purchased | P0 |
| Hover Tooltips | Show furniture/art info on hover | P0 |
| Click Interactions | Open art detail modal | P0 |

#### Edit Mode Features (Dani Only)

| Feature | Description | Priority |
|---------|-------------|----------|
| Toggle Edit Mode | Switch between view and edit | P0 |
| Add Furniture | Upload and place new furniture drawing | P0 |
| Link Art to Furniture | Associate artwork with furniture piece | P0 |
| Remove Furniture | Delete from room | P1 |
| External Links | Add URL to actual furniture listing | P2 |
| Undo/Redo | Revert changes | P2 |
| Grid Snapping | Optional alignment grid | P3 |

#### Technical Implementation Notes

```
Canvas Technology Options:
├── Option A: HTML/CSS + absolute positioning (simpler)
│   └── Good for: Basic drag-drop, easier styling
├── Option B: Canvas API / Konva.js (more powerful)
│   └── Good for: Complex interactions, better performance
└── Option C: SVG-based (middle ground)
    └── Good for: Scalability, accessibility

Recommendation: Start with Option A (HTML/CSS) for MVP,
migrate to Option B if performance issues arise.
```

### 5.2 Art Management

| Feature | Description | Priority |
|---------|-------------|----------|
| Upload Single Art | Form with image + details | P0 |
| Bulk Upload | Select multiple images at once | P1 |
| Edit Art Details | Title, price, description, dimensions | P0 |
| Link to Furniture | Connect art to floor map furniture | P0 |
| Delete Art | Remove from system | P0 |
| Status Management | Update order status | P0 |
| Unlinked Art Indicator | Show which art needs furniture | P1 |

### 5.3 Dashboard

| Widget | Description | Priority |
|--------|-------------|----------|
| Sales Summary | Total revenue, # sold | P0 |
| Active Listings | Count of available art | P0 |
| Recent Orders | Last 5-10 transactions | P0 |
| Quick Actions | Links to common tasks | P1 |
| Revenue Chart | Simple line/bar chart | P2 |

### 5.4 Blog

| Feature | Description | Priority |
|---------|-------------|----------|
| Create Post | Rich text editor | P1 |
| Edit/Delete Post | Manage existing posts | P1 |
| Categories/Tags | Organize posts | P2 |
| Image Upload | Embed images in posts | P1 |
| Public Blog Page | List of published posts | P1 |

---

## 6. Data Models

### 6.1 Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   artists   │       │    rooms     │       │  furniture  │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ artist_id    │       │ id (PK)     │
│ email       │       │ id (PK)      │◄──────│ room_id     │
│ name        │       │ name         │       │ name        │
│ bio         │       │ order        │       │ image_url   │
│ profile_pic │       │ background   │       │ price       │
│ created_at  │       │ created_at   │       │ position_x  │
└─────────────┘       └──────────────┘       │ position_y  │
                                             │ width       │
                                             │ height      │
                                             │ external_url│
                                             │ artwork_id  │──────┐
                                             │ status      │      │
                                             └─────────────┘      │
                                                                  │
┌─────────────┐       ┌──────────────┐                           │
│   artwork   │◄──────┼──────────────┼───────────────────────────┘
├─────────────┤       │              │
│ id (PK)     │       │              │
│ artist_id   │───────┘              │
│ title       │                      │
│ description │       ┌──────────────┤
│ price       │       │    orders    │
│ image_url   │       ├──────────────┤
│ medium      │       │ id (PK)      │
│ dimensions  │       │ artwork_id   │──────► artwork.id
│ created_at  │       │ furniture_id │──────► furniture.id
│ status      │       │ customer_name│
└─────────────┘       │ customer_email│
                      │ customer_phone│
                      │ delivery_type │
                      │ shipping_addr │
                      │ status        │
                      │ total_amount  │
                      │ payment_ref   │
                      │ created_at    │
                      │ updated_at    │
                      └──────────────┘

┌─────────────┐
│ blog_posts  │
├─────────────┤
│ id (PK)     │
│ artist_id   │───────► artists.id
│ title       │
│ content     │
│ image_url   │
│ category    │
│ published   │
│ created_at  │
│ updated_at  │
└─────────────┘
```

### 6.2 Detailed Schema

#### artists

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen | Unique identifier |
| email | text | unique, not null | Gmail address |
| name | text | not null | Display name |
| bio | text | | Artist introduction |
| profile_pic_url | text | | Profile image URL |
| created_at | timestamp | default now() | |

#### rooms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | |
| artist_id | uuid | FK → artists.id | |
| name | text | not null | e.g., "Living Room" |
| order | int | default 0 | Display order |
| background_url | text | | Optional room background |
| width | int | default 800 | Canvas width |
| height | int | default 600 | Canvas height |
| created_at | timestamp | | |

#### furniture

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | |
| room_id | uuid | FK → rooms.id | |
| name | text | not null | e.g., "Cozy Couch" |
| image_url | text | not null | Dani's drawing URL |
| price | decimal(10,2) | not null | Target furniture price |
| position_x | int | not null | X coordinate on canvas |
| position_y | int | not null | Y coordinate on canvas |
| width | int | | Display width |
| height | int | | Display height |
| rotation | int | default 0 | Rotation degrees |
| z_index | int | default 0 | Layer order |
| external_url | text | | Link to actual furniture |
| artwork_id | uuid | FK → artwork.id, nullable | Linked artwork |
| status | text | default 'available' | available, reserved, purchased |
| created_at | timestamp | | |
| updated_at | timestamp | | |

#### artwork

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | |
| artist_id | uuid | FK → artists.id | |
| title | text | not null | |
| description | text | | |
| price | decimal(10,2) | not null | Sale price |
| image_url | text | not null | Artwork image URL |
| medium | text | | e.g., "Oil on canvas" |
| dimensions | text | | e.g., "24x36 inches" |
| status | text | default 'available' | available, reserved, sold |
| created_at | timestamp | | |
| updated_at | timestamp | | |

#### orders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | |
| artwork_id | uuid | FK → artwork.id | |
| furniture_id | uuid | FK → furniture.id | |
| customer_name | text | not null | |
| customer_email | text | not null | |
| customer_phone | text | | |
| delivery_type | text | not null | pickup, local_delivery, shipping |
| shipping_address | jsonb | | {street, city, state, zip} |
| special_instructions | text | | |
| total_amount | decimal(10,2) | | Art price + shipping |
| shipping_fee | decimal(10,2) | | |
| status | text | default 'pending' | pending, confirmed, shipped, completed, cancelled |
| payment_method | text | | venmo, paypal |
| payment_reference | text | | Transaction ID if available |
| created_at | timestamp | | |
| updated_at | timestamp | | |

#### blog_posts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK | |
| artist_id | uuid | FK → artists.id | |
| title | text | not null | |
| content | text | not null | Markdown content |
| featured_image_url | text | | |
| category | text | | art_fair, drumming, general |
| is_published | boolean | default false | |
| published_at | timestamp | | |
| created_at | timestamp | | |
| updated_at | timestamp | | |

---

## 7. UI/UX Guidelines

### 7.1 Design Principles

1. **Clean & Minimal:** White/light backgrounds, minimal UI chrome
2. **Mobile-First:** Design for phone, enhance for desktop
3. **Personal & Human:** Dani's hand-drawn elements add warmth
4. **Clear Status:** Obvious visual feedback for all states
5. **Accessible:** Proper contrast, keyboard navigation

### 7.2 Color Palette

```
Primary:        To be defined (consider Dani's preferences)
Background:     White (#FFFFFF) or very light gray (#FAFAFA)
Text:           Dark gray (#1A1A1A)
Muted:          Medium gray (#6B7280) - unavailable items
Accent:         For purchased/success states
Error:          Soft red for alerts
```

### 7.3 Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| < 640px | Mobile phones |
| 640-1024px | Tablets |
| > 1024px | Desktop |

### 7.4 Key Screens Wireframe Descriptions

#### Landing Page (Public)

```
┌─────────────────────────────────────────┐
│  [Logo]                    [Blog] [Login]│
├─────────────────────────────────────────┤
│                                         │
│     "Support Your Favorite Artist       │
│      Like an Art Registry"              │
│                                         │
│     [Visual: Room with furniture]       │
│                                         │
│     Brief explanation of concept        │
│                                         │
│     [Get Started →]                     │
│                                         │
├─────────────────────────────────────────┤
│  Featured Artists                       │
│  ┌─────────┐                           │
│  │  Dani   │                           │
│  │  [pic]  │                           │
│  │  Bio... │                           │
│  │ [View →]│                           │
│  └─────────┘                           │
└─────────────────────────────────────────┘
```

#### Artist Floor Map Page

```
┌─────────────────────────────────────────┐
│  [←Back]  Dani's Art Registry  [List ⊞] │
├─────────────────────────────────────────┤
│  [Living Room] [Drum Studio] [+ Room]   │  ← Room tabs (+ only in edit mode)
├─────────────────────────────────────────┤
│                                         │
│   ┌─────┐         ┌─────────────┐       │
│   │ Bed │         │    Couch    │       │  ← Furniture pieces
│   │$800 │         │    $400     │       │
│   │(muted)        │  (colored!) │       │
│   └─────┘         └─────────────┘       │
│                                         │
│          ┌───────┐                      │
│          │ Lamp  │                      │
│          │ $50   │                      │
│          └───────┘                      │
│                                         │
├─────────────────────────────────────────┤
│  [Edit Mode Toggle] - Only for Dani     │
└─────────────────────────────────────────┘
```

#### Art Detail Modal

```
┌─────────────────────────────────────────┐
│  ╳                                      │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │      [Artwork Image]            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  "Sunset Over Monterey"                 │
│  $400                                   │
│                                         │
│  Oil on canvas, 24x36"                  │
│                                         │
│  ─────────────────────────────────────  │
│  Your purchase helps Dani get:          │
│  ┌─────┐                               │
│  │Couch│  [View on IKEA →]             │
│  └─────┘                               │
│                                         │
│  [Purchase This Artwork]                │
└─────────────────────────────────────────┘
```

#### Dashboard (Dani)

```
┌─────────────────────────────────────────┐
│  [Logo]  Dashboard         [Profile ▼]  │
├─────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ $2,450   │ │    12    │ │    5     ││
│  │ Revenue  │ │ Listings │ │  Sold    ││
│  └──────────┘ └──────────┘ └──────────┘│
├─────────────────────────────────────────┤
│  Recent Orders                          │
│  ┌─────────────────────────────────────┐│
│  │ J.Smith | "Beach Day" | $400 | ✓   ││
│  │ M.Chen  | "Night Jazz"| $250 | 📦  ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Quick Actions                          │
│  [View Floor Map] [Manage Art] [Blog]   │
└─────────────────────────────────────────┘
```

---

## 8. Payment & Shipping Logic

### 8.1 Payment Flow (External Redirect)

Since there's no integrated payment processor:

```
┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌───────────┐
│  Order   │───►│ Pre-fill     │───►│  Venmo/  │───►│ Return to │
│  Submit  │    │ Payment Info │    │  PayPal  │    │ Confirm   │
└──────────┘    └──────────────┘    └──────────┘    └───────────┘
                                          │
                                          ▼
                               [Manual payment made]
                                          │
                                          ▼
                               [Dani confirms in dashboard]
```

#### Venmo Deep Link

```
venmo://paycharge?txn=pay&recipients=DaniUsername&amount=400&note=ArtworkTitle
```

#### PayPal.me Link

```
https://paypal.me/DaniUsername/400?note=ArtworkTitle-OrderID
```

### 8.2 Order Status Flow

```
pending → confirmed → shipped → completed
    │         │
    └─────────┴──────────► cancelled
```

| Status | Description | Triggered By |
|--------|-------------|--------------|
| pending | Order submitted, awaiting payment verification | Customer submits order |
| confirmed | Payment verified by Dani | Dani marks as confirmed |
| shipped | Artwork shipped/ready for pickup | Dani updates status |
| completed | Customer received artwork | Dani marks complete |
| cancelled | Order cancelled | Dani or customer request |

### 8.3 Shipping Options

| Option | Description | Fee |
|--------|-------------|-----|
| **Pickup** | Customer picks up in Monterey | Free |
| **Local Delivery** | Within 30 min of Monterey | Flat rate (e.g., $15) |
| **Shipping** | Outside local area | Tiered by size or "Contact for quote" |

#### Suggested Shipping Fee Structure

```
Small (under 12"x12"):      $15 flat
Medium (under 24"x24"):     $30 flat
Large (over 24"x24"):       Contact for quote
```

Alternative: Dani manually sets shipping cost per artwork when listing.

### 8.4 Post-Payment Verification

Since payments are external and not automatically verified:

1. Customer completes order → status = "pending"
2. Customer pays via Venmo/PayPal
3. Dani sees order in dashboard
4. Dani manually verifies payment received
5. Dani clicks "Confirm Payment" → status = "confirmed"

---

## 9. Development Phases

### Phase 1: Foundation (MVP)

> **Goal:** Basic working app with core floor map functionality

#### 1.1 Project Setup
- [x] Initialize React + TypeScript + Vite project
- [x] Set up TailwindCSS
- [ ] Set up ESLint + Prettier
- [x] Create folder structure
- [x] Set up GitHub repository
- [ ] Configure GitHub Pages deployment

#### 1.2 Backend Setup
- [x] Initialize FastAPI project
- [ ] Set up Supabase project
- [ ] Configure Supabase Auth (Google OAuth)
- [ ] Create database tables (migrations)
- [ ] Set up Supabase Storage buckets
- [ ] Deploy to Render

#### 1.3 Authentication
- [ ] Implement Google OAuth flow
- [ ] Create protected routes (Dani's pages)
- [ ] Public vs authenticated route handling

#### 1.4 Basic Floor Map (View Only)
- [ ] Create room canvas component
- [ ] Render furniture items from database
- [ ] Implement furniture hover states
- [ ] Implement furniture click → art modal
- [ ] Art detail modal display

#### 1.5 Basic Art Management
- [ ] Art upload form (single)
- [ ] Art list table view
- [ ] Edit art details
- [ ] Delete art

### Phase 2: Interactive Features

> **Goal:** Full floor map editing, ordering flow

#### 2.1 Floor Map Edit Mode
- [ ] Toggle edit mode
- [ ] Drag-and-drop furniture positioning
- [ ] Add furniture (upload drawing)
- [ ] Link furniture to artwork
- [ ] Delete furniture
- [ ] Auto-save changes

#### 2.2 Multiple Rooms
- [ ] Room tabs UI
- [ ] Add new room
- [ ] Rename room
- [ ] Delete room
- [ ] Room switching

#### 2.3 Customer Order Flow
- [ ] Order form UI
- [ ] Delivery option selection
- [ ] Shipping address form
- [ ] Venmo/PayPal redirect
- [ ] Confirmation page
- [ ] Order creates in database

#### 2.4 Dashboard
- [ ] Sales summary widgets
- [ ] Recent orders list
- [ ] Quick action links

### Phase 3: Polish & Additional Features

> **Goal:** Complete experience, blog, mobile optimization

#### 3.1 Order Management
- [ ] Order list view for Dani
- [ ] Update order status
- [ ] Order notifications (email?)

#### 3.2 Bulk Art Upload
- [ ] Multi-file select
- [ ] Upload progress indicator
- [ ] Batch edit capabilities

#### 3.3 Blog
- [ ] Blog post editor (Markdown)
- [ ] Blog list page
- [ ] Blog detail page
- [ ] Category filtering

#### 3.4 Mobile Optimization
- [ ] Touch-friendly floor map
- [ ] Pinch-to-zoom
- [ ] Responsive layouts
- [ ] Mobile navigation

#### 3.5 Final Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Animations/transitions
- [ ] Performance optimization
- [ ] SEO basics

---

## 10. Setup & Deployment Guide

### 10.1 Prerequisites

```bash
# Required installations
node >= 18.0.0
npm >= 9.0.0
python >= 3.11
pip (latest)
git
```

### 10.2 Frontend Setup

```bash
# Create React + TypeScript + Vite project
npm create vite@latest dani-art-frontend -- --template react-ts

cd dani-art-frontend

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom          # Routing
npm install @supabase/supabase-js     # Supabase client
npm install @dnd-kit/core @dnd-kit/sortable  # Drag and drop
npm install tailwindcss postcss autoprefixer # Styling
npm install zustand                    # State management (optional)
npm install lucide-react               # Icons

# Initialize Tailwind
npx tailwindcss init -p

# Development
npm run dev

# Build for production
npm run build
```

### 10.3 Backend Setup

```bash
# Create project directory
mkdir dani-art-backend
cd dani-art-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi
pip install uvicorn[standard]
pip install supabase
pip install python-dotenv
pip install pydantic
pip install python-multipart  # For file uploads

# Freeze dependencies
pip freeze > requirements.txt

# Run development server
uvicorn main:app --reload
```

### 10.4 Supabase Setup

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note: Project URL and anon key

2. **Configure Authentication**
   - Enable Google provider in Auth settings
   - Add OAuth credentials from Google Cloud Console
   - Set redirect URLs

3. **Create Storage Buckets**
   - `artwork` - for art images
   - `furniture` - for furniture drawings
   - `profiles` - for profile pictures
   - `blog` - for blog images

4. **Run SQL Migrations**
   - Use Supabase SQL editor
   - Create tables as defined in Data Models section

5. **Set Row Level Security (RLS)**
   - Enable RLS on all tables
   - Create policies for read/write access

### 10.5 Environment Variables

#### Frontend (.env)

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_backend_url
```

#### Backend (.env)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
CORS_ORIGINS=https://yourusername.github.io
```

### 10.6 GitHub Pages Deployment

1. **Configure Vite for GitHub Pages**

```typescript
// vite.config.ts
export default defineConfig({
  base: '/dani-art/',  // repo name
  // ...
})
```

2. **Create GitHub Action** (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### 10.7 Render Backend Deployment

1. **Create render.yaml**

```yaml
services:
  - type: web
    name: dani-art-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
```

2. **Connect GitHub Repository**
   - Link repo in Render dashboard
   - Set environment variables
   - Deploy

### 10.8 Folder Structure

```
dani-art/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Buttons, modals, etc.
│   │   │   ├── floor-map/       # Room canvas, furniture
│   │   │   ├── art/             # Art cards, modals
│   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   └── blog/            # Blog components
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Artist.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ArtManagement.tsx
│   │   │   └── Blog.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Supabase client, utilities
│   │   ├── types/               # TypeScript interfaces
│   │   ├── store/               # State management
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── artists.py
│   │   │   ├── rooms.py
│   │   │   ├── furniture.py
│   │   │   ├── artwork.py
│   │   │   ├── orders.py
│   │   │   └── blog.py
│   │   ├── models/              # Pydantic models
│   │   ├── services/            # Business logic
│   │   └── utils/               # Helpers
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── docs/
│   └── PRODUCT_REQUIREMENTS.md
│
└── README.md
```

---

## Appendix A: Furniture Drawing Guidelines for Dani

To ensure furniture images work well in the app:

1. **Format:** PNG with transparent background
2. **Size:** 500-1000px on longest side
3. **Style:** Consistent art style across pieces
4. **Naming:** Descriptive names (cozy-couch.png, drum-kit.png)
5. **Orientation:** Draw furniture from an angled top-down view for floor map aesthetic

---

## Appendix B: Future Considerations

- **Multiple Artists:** Allow other artists to create accounts
- **Integrated Payments:** Stripe integration for automated payments
- **Email Notifications:** Order confirmations, status updates
- **Analytics:** Track views, conversions
- **Wishlist:** Customers can save items
- **Social Sharing:** Share artwork on social media

---

*Document created for Dani's Art Registry project. Last updated: August 21, 2026*
