# Breeze — Nature-Inspired Weather Dashboard

Breeze is a visually immersive, organic, and nature-themed weather dashboard application. It provides real-time weather analytics, forecasts, and interactive mapping designed with a premium Blue-Green color palette, micro-animations, and full responsive support for both light and dark modes.

## Features

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

---

## Deployment & hosting

This monorepo project is set up to host the frontend on **Vercel** and the backend server on **Render**.

### 1. Backend Server (Render)

Deploy the backend directly using the Render Blueprint configuration:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/riyajoshi-cloud/Breeze)

1. Click the button above to go to Render.
2. Sign in to your Render account.
3. Keep the default configurations (the Blueprint uses `render.yaml` to configure the server environment automatically).
4. After creation, wait for compilation, and copy your backend service URL (e.g., `https://breeze-backend-xxxx.onrender.com`).

### 2. Frontend client (Vercel)

Ensure your frontend communicates with the newly deployed backend:

1. Log in to your **Vercel Dashboard**.
2. Select your `Breeze` project and go to **Settings > Environment Variables**.
3. Add a new variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<YOUR-RENDER-HOST-URL>/api` (make sure to append `/api` at the end, e.g. `https://breeze-backend.onrender.com/api`).
4. Click **Add**, then go to the **Deployments** tab on Vercel and select **Redeploy** on your latest deployment so Vercel compiles the new environment variable value.

---

## Local Development Getting Started

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
