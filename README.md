# User Analytics Dashboard

A full-stack web analytics platform that tracks visitor sessions, page views, and click interactions, then visualizes user activity through an interactive dashboard and click heatmap.

**Live Demo:** [Analytics Dashboard](https://user-analytics-dashboard-bice.vercel.app/) · [Tracked Demo Website](https://user-analytics-demo.onrender.com/) · [Backend API Health](https://user-analytics-dashboard-4xv1.onrender.com/api/health)

---

## Overview

User Analytics Dashboard helps website owners understand how visitors interact with their pages. A lightweight tracking script collects page views and click coordinates from a demo website, the backend stores events in MongoDB, and the dashboard visualizes the collected activity.

The application is deployed with Vercel, Render, and MongoDB Atlas.

## Features

- **Visitor Session Tracking** — Generates and maintains visitor session IDs.
- **Page View Analytics** — Records visits to tracked pages.
- **Click Tracking** — Captures click coordinates and viewport dimensions.
- **Interactive Dashboard** — Displays sessions, events, page views, and clicks.
- **Click Activity by Page** — Groups click events by page URL.
- **Event Distribution** — Visualizes page views versus clicks.
- **Click Heatmap** — Shows recorded click concentrations on tracked pages.
- **Demo Website** — Includes Home, Products, and About pages for generating sample analytics events.
- **Cloud Deployment** — Frontend, backend, and demo website are hosted separately.

## Live Applications

| Component | Technology | Link |
|---|---|---|
| Analytics Dashboard | React, Vite, Recharts | [Open Dashboard](https://user-analytics-dashboard-bice.vercel.app/) |
| Backend API | Node.js, Express, TypeScript | [API Health](https://user-analytics-dashboard-4xv1.onrender.com/api/health) |
| Demo Website | HTML, CSS, JavaScript | [Open Demo](https://user-analytics-demo.onrender.com/) |
| Database | MongoDB Atlas | Cloud-hosted database |

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Recharts
- CSS

**Backend**
- Node.js
- Express.js
- TypeScript
- Mongoose

**Database**
- MongoDB Atlas

**Tracking**
- JavaScript tracking script
- Browser Session Storage
- Fetch API

**Deployment**
- Vercel — dashboard frontend
- Render — backend API and demo website
- GitHub — source control and deployment integration

## Architecture



flowchart TD
    A["Visitor"] --> B["Demo Website"]
    B --> C["JavaScript Tracking Script"]
    C -->|"Page Views and Clicks"| D["Express API"]
    D --> E[("MongoDB Atlas")]
    E --> F["Analytics API"]
    F --> G["React Dashboard"]
    G --> H["Charts and Click Heatmap"]




## How It Works

1. A visitor opens a page on the demo website.
2. The tracking script creates or retrieves a session ID.
3. Page views and click interactions are sent to the backend API.
4. The backend validates and stores analytics events in MongoDB.
5. The dashboard requests analytics data from the API.
6. Charts and the heatmap display the recorded activity.

Click coordinates are recorded relative to the browser viewport. Heatmap visualization represents the recorded click distribution and may not exactly reproduce the original webpage layout.

## Project Structure

```text
user-analytics-dashboard/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── demo-website/
│   ├── index.html
│   ├── product.html
│   ├── about.html
│   ├── style.css
│   └── tracker.js
├── .gitignore
└── README.md
```

## Run Locally

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or a MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Ambreesh1/user-analytics-dashboard.git
cd user-analytics-dashboard
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
```

Replace the placeholder with your own MongoDB connection string. Keep `.env` private and never commit database credentials.

Start the backend:

```bash
npm run dev
```

The backend should be available at `http://localhost:4000`.

### 3. Configure the frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file inside `frontend`:

```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### 4. Run the demo website

Open another terminal at the project root and run:

```bash
npx http-server demo-website -p 5500
```

Open `http://localhost:5500` and interact with the demo pages to generate analytics events.

If the backend or frontend uses different local settings, update the corresponding environment variables before starting the application.

## Production Environment Variables

Configure these values in the respective hosting platforms:

| Variable | Used By | Purpose |
|---|---|---|
| `MONGODB_URI` | Backend | MongoDB connection string |
| `PORT` | Backend | Port supplied by the hosting platform or local environment |
| `VITE_API_URL` | Frontend | Base URL of the backend API |

For the deployed frontend, `VITE_API_URL` should point to:

```text
https://user-analytics-dashboard-4xv1.onrender.com/api
```

Do not expose database credentials or other secrets in frontend environment variables.

## Build and Validation

Build the backend:

```bash
cd backend
npm run build
```

Build the frontend:

```bash
cd frontend
npm run build
```

The production frontend build may display a bundle-size warning. This does not necessarily indicate a failed build.

## Future Improvements

- Date-range filters and historical analytics
- Device and browser breakdowns
- Conversion and funnel tracking
- Exportable analytics reports
- More efficient event aggregation
- Automated testing and monitoring

## Author

**Ambreesh**

- GitHub: [@Ambreesh1](https://github.com/Ambreesh1)

---

If you find this project useful, consider giving the repository a star!
