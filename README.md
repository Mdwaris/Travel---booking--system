# Travel Site

A full-stack travel website built with Vite, React, Express, and MongoDB persistence.

## Features

- Browse featured luxury destinations
- View destination detail pages
- Submit contact messages
- Submit booking requests
- Fetch destination data from the backend API
- Serve the built frontend from Express in production

## Project Structure

- `src/`: React frontend
- `backend/`: Express backend, routes, controllers, models, and seed data
- `public/images/`: destination and hero assets

## Local Setup

### 1. Install dependencies

Install frontend packages from the project root:

```bash
npm install
```

Install backend packages inside `backend`:

```bash
cd backend
npm install
```

### 2. Configure environment variables

Frontend:

```bash
cp .env.example .env
```

Backend:

```bash
cp backend/.env.example backend/.env
```

Set `MONGO_URI` to your local or hosted MongoDB instance. Example:

```bash
MONGO_URI=mongodb://localhost:27017/travel-site
```

For admin access and email notifications, also configure:

```bash
NODE_ENV=development
JWT_SECRET=change_this_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me_now
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM=Luxury Travels <noreply@example.com>
```

### 3. Run the app

Start the backend:

```bash
npm run backend
```

In another terminal, start the frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` and backend runs at `http://localhost:5000`.
The backend now requires MongoDB to be available before it starts.

## Production Build

Build the frontend:

```bash
npm run build
```

Then start the backend from the root:

```bash
npm start
```

In production, Express serves the frontend from `dist/` and also exposes the API under `/api`.

Before deploying, set production environment variables on your host:

```bash
NODE_ENV=production
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=use_a_long_random_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=use_a_strong_admin_password
FRONTEND_URL=https://your-domain.example
CORS_ORIGINS=https://your-domain.example
```

The server refuses to start in production if required auth variables are missing or left as example placeholders.

## API Endpoints

- `GET /api/health`
- `GET /api/destinations`
- `GET /api/destinations/:id`
- `GET /api/contact` (admin only)
- `POST /api/contact`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (customer only)
- `POST /api/bookings`
- `GET /api/bookings/my` (customer only)
- `POST /api/admin/login`
- `GET /api/admin/me`
- `GET /api/bookings` (admin only)
- `PATCH /api/bookings/:id` (admin only)
- `POST /api/payments/confirm`

## Notes

- MongoDB is required through `MONGO_URI`
- SMTP credentials are required if you want booking emails to be sent
- Admin login uses `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Contact submissions can be created publicly but listed only by an authenticated admin
- `backend/.env` is ignored in Git so your credentials stay private
