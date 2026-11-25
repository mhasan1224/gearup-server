# GearUp Rentals — Backend

The REST API server for GearUp Rentals, an equipment rental platform. Built with Node.js, Express, MongoDB, and Better Auth.

## Features

- **Authentication:** Secure authentication using Better Auth.
- **Role-Based Authorization:** Customer, Owner, and Admin access control.
- **Equipment Management:** Create, read, update, delete, and moderate equipment listings.
- **Booking Management:** Handle rental bookings and rental status updates.
- **Payment Integration:** Stripe Checkout and webhook-based payment confirmation.
- **Favorites:** Add, retrieve, and remove favorite equipment.
- **Review Management:** Submit reviews and moderate them through Admin controls.
- **User Management:** Retrieve profiles and manage user roles.
- **Image Upload:** Upload equipment images using Multer and ImgBB.
- **Analytics:** Owner and Admin dashboard statistics.
- **Security:** CORS, Helmet, authentication middleware, and role-based middleware.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| Better Auth | Authentication |
| Stripe | Payment processing |
| Multer | File upload handling |
| ImgBB | Image hosting |
| Helmet | HTTP security headers |
| CORS | Cross-origin resource sharing |
| Morgan | HTTP request logging |
| dotenv | Environment configuration |

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB database
- Stripe account
- ImgBB API key

### 1. Clone the Repository

```bash
git clone https://github.com/mhasan1224/gearup-server.git
cd gearup-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:3000

DB_NAME=gearup
MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_URL=http://localhost:5000
BETTER_AUTH_SECRET=your_better_auth_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

IMGBB_API_KEY=your_imgbb_api_key

ADMIN_EMAIL=your_admin_email
```

Replace the placeholder values with your own credentials. Never commit your `.env` file or expose secret keys publicly.

### 4. Start the Development Server

```bash
npm run dev
```

The backend will run at:

`http://localhost:5000`

### 5. Production Start

```bash
npm start
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with Nodemon |
| `npm start` | Start the production server |

## API Documentation

All application API endpoints use the `/api` prefix.

### Health Check

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/health` | Public |

### Equipment

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/equipment` | Public |
| GET | `/api/equipment/featured` | Public |
| GET | `/api/equipment/:id` | Public |
| GET | `/api/equipment/my-equipment` | Owner |
| POST | `/api/equipment` | Owner |
| PATCH | `/api/equipment/:id` | Owner |
| DELETE | `/api/equipment/:id` | Owner |
| GET | `/api/equipment/admin` | Admin |
| PATCH | `/api/equipment/admin/:id/status` | Admin |
| PATCH | `/api/equipment/admin/:id` | Admin |
| DELETE | `/api/equipment/admin/:id` | Admin |

### Bookings

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/bookings` | Customer |
| GET | `/api/bookings/payment-status` | Customer |
| GET | `/api/bookings/my-rentals` | Customer |
| GET | `/api/bookings/owner-rentals` | Owner |
| PATCH | `/api/bookings/:id/complete` | Owner |

### Favorites

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/favorites` | Customer |
| POST | `/api/favorites` | Customer |
| DELETE | `/api/favorites/:equipmentId` | Customer |

### Reviews

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/reviews/featured` | Public |
| GET | `/api/reviews/my` | Customer |
| POST | `/api/reviews` | Customer |
| GET | `/api/reviews` | Admin |
| PATCH | `/api/reviews/:id/status` | Admin |

### Users

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users/me` | Authenticated |
| PATCH | `/api/users/me` | Authenticated |
| GET | `/api/users` | Admin |
| PATCH | `/api/users/:id/role` | Admin |

### Analytics

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/owner/analytics` | Owner |
| GET | `/api/admin/analytics` | Admin |

### Image Upload

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/uploads/equipment-image` | Owner, Admin |

The equipment image upload endpoint expects a multipart form-data field named `image`.

### Stripe Webhook

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/webhooks/stripe` | Stripe webhook signature verification |

The webhook processes successful Checkout Session completion events and updates the associated booking payment status.

## Authentication & Authorization

GearUp uses Better Auth for authentication and role-based middleware for protected API routes.

Supported roles:

- **Customer:** Browse equipment, create bookings, manage favorites, and submit reviews.
- **Owner:** Manage equipment, handle rental requests, and view owner analytics.
- **Admin:** Manage users, moderate equipment and reviews, and access platform analytics.

Protected endpoints require a valid authenticated session and the appropriate role.

## Deployment

The backend is deployed on Vercel.

**Production API Base URL:**

https://gearup-server-three.vercel.app

**Health Check:**

https://gearup-server-three.vercel.app/api/health

Configure production environment variables in the Vercel project settings.

## Related Repository

**Frontend Repository:**

https://github.com/mhasan1224/gearup-client

**Live Website:**

https://gearup-client-iota.vercel.app

---

Developed as part of Programming Hero Assignment 09 — Category 003.