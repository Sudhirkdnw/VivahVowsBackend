# VivahVows Backend

VivahVows is a modern, AI-assisted matrimony and matchmaking platform built on
Django REST Framework. This repository contains the backend services that power
authentication, profile management, intelligent match recommendations, real-time
notifications, photo storage metadata, and premium subscriptions.

## Features

- **Custom user model** with JWT authentication and onboarding flags.
- **Profile and preference management** with nested serializers for ease of
  consumption by the React frontend.
- **Matchmaking domain models** covering interactions, mutual matches, and
  placeholder AI recommendations.
- **Photo metadata service** designed to work with AWS S3, Cloudinary, or other
  CDN-backed storage providers.
- **Notification center** for likes, matches, and system alerts with bulk mark
  as read support.
- **Payments scaffolding** to support premium plans and gateway integrations.
- Hardened settings with environment-driven configuration for PostgreSQL,
  MongoDB, Redis, Celery, and cloud storage providers.

## Project Structure

```
backend/
├── manage.py
├── backend/            # Django settings, URLs, WSGI/ASGI entrypoints
├── apps/
│   ├── users/          # Authentication, JWT registration flow
│   ├── profiles/       # Profile data and partner preferences
│   ├── matches/        # Match models, interactions, recommendations
│   ├── photos/         # Photo metadata management
│   ├── notifications/  # Notification models and APIs
│   └── payments/       # Subscription plans and transactions
└── utils/              # Security helpers, AI stubs, email helpers
```

## Getting Started

1. **Install dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Set environment variables**
   Create a `.env` file in the repository root (same level as this README) and
   populate the following values:
   ```ini
   DJANGO_SECRET_KEY=replace-me
   DJANGO_DEBUG=True
   POSTGRES_DB=vivahvows
   POSTGRES_USER=vivahvows
   POSTGRES_PASSWORD=super-secret
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   REDIS_URL=redis://localhost:6379/0
   ```
   Additional variables are available in `backend/backend/settings.py` for
   MongoDB, storage providers, and external integrations.

3. **Apply migrations and create a superuser**
   ```bash
   python backend/manage.py migrate
   python backend/manage.py createsuperuser
   ```

4. **Run the development server**
   ```bash
   python backend/manage.py runserver 0.0.0.0:8000
   ```

5. **API documentation** is available at `/docs/` once the server is running.

## Testing

Execute Django's test suite:

```bash
python backend/manage.py test
```

## Next Steps

- Replace the mock AI recommender with a production-ready ML microservice.
- Integrate real push notifications via WebSockets and a Node.js service.
- Connect the payments module to Stripe or Razorpay and add webhook handlers.
- Harden security by configuring HTTPS, CSP headers, and production logging.
