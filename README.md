# Breeze — Nature-Inspired Weather Dashboard

Breeze is a visually immersive, organic, and nature-themed weather dashboard application. It provides real-time weather analytics, forecasts, and interactive mapping designed with a premium Blue-Green color palette, micro-animations, and full responsive support for both light and dark modes.

## features

- **Real-Time Weather Metrics**: Comprehensive displays for temperature, feels-like temperatures, humidity, wind conditions, atmospheric pressure, visibility, UV index, and Air Quality Index (AQI).
- **Hourly & Daily Forecasts**: Seamless rendering of 24-hour hourly temperatures and detailed 7-day weather predictions.
- **Interactive Weather Map**: A responsive embedded map pointing directly to searched regions with location-specific coordinates.
- **Custom Location Search**: Fast, auto-suggestive location lookups across cities and countries.
- **Saved Locations (Favorites Drawer)**: Add cities to a persistent dashboard sidebar for quick environment-switching.
- **Premium Nature Theme**: Modern fonts, soft organic gradients, decorative tree pine sways, and fully-unified Light / Dark theme toggles.

## Tech Stack

### Frontend (Client)
- **Framework**: React / TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS / CSS custom design tokens
- **Icons**: Lucide React

### Backend (Server)
- **Runtime**: Node.js / Express / TypeScript
- **Database**: Local JSON storage (with Mongoose/MongoDB adapter support)
- **Testing**: Vitest

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Install root, client, and server dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. Seed your environment configs (e.g. Server `.env` file):
   ```bash
   cd ../server
   cp .env.example .env
   ```

3. Spin up the developmental servers:
   ```bash
   cd ..
   npm run dev
   ```
   Both servers will start concurrently. Open `http://localhost:5173/` in your browser.
