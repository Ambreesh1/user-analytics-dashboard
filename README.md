# User Analytics Dashboard

A full-stack web analytics application that tracks user page views and clicks on a demo website and visualizes the collected activity through an analytics dashboard.

## Features

- **Page View Tracking:** Track page visits across the demo website.
- **Click Tracking:** Capture click events, including coordinates and page information.
- **Session Tracking:** Associate user activity with session identifiers.
- **Analytics Dashboard:** View collected activity and click statistics.
- **User Journey:** Explore recorded events and page navigation activity.
- **Click Heatmap:** Visualize click locations on supported demo pages.
- **Demo Website:** Includes Home, Products, and About pages for testing analytics.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite
- Recharts

**Backend**
- Node.js
- Express
- TypeScript
- Mongoose

**Database**
- MongoDB Atlas

## Project Structure

```text
user-analytics-dashboard/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── index.html
├── demo-website/
│   ├── index.html
│   ├── product.html
│   ├── about.html
│   ├── style.css
│   └── tracker.js
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- A MongoDB Atlas cluster, or another compatible MongoDB deployment
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd user-analytics-dashboard
```

Replace the repository URL with your actual GitHub repository URL.

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and configure the MongoDB connection string using the environment variable expected by `src/server.ts`.

Keep database credentials and other secrets private. Do not commit `.env` to GitHub.

### 3. Start the backend

For development:

```bash
npm run dev
```

To compile the backend:

```bash
npm run build
```

To start the compiled backend:

```bash
npm start
```

### 4. Start the frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal, usually `http://localhost:5173`.

### 5. Start the demo website

Open another terminal from the project root:

```bash
npx http-server demo-website -p 5500
```

Open `http://localhost:5500` in your browser.

Keep the backend, frontend, and demo website servers running in separate terminals.

## Testing the Application

1. Open the demo website.
2. Visit the Home, Products, and About pages.
3. Click different buttons and page elements.
4. Open the analytics dashboard.
5. Verify page views, click counts, session activity, and heatmap data.

## Build Checks

Frontend production build:

```bash
cd frontend
npm run build
```

Backend TypeScript build:

```bash
cd backend
npm run build
```

## Security Notes

- Store MongoDB credentials in environment variables.
- Never commit `.env` files or database secrets.
- Configure MongoDB Atlas network access appropriately for your deployment.
- Review CORS settings before exposing the application publicly.

## Future Improvements

- Optimize frontend bundle size through code splitting.
- Add automated end-to-end tests.
- Improve heatmap aggregation and coordinate accuracy.
- Deploy the frontend and backend to production hosting.

## License

No license has been specified yet.
