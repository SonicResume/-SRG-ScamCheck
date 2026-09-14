## Production Status

**Production-ready application**

The platform is designed for production deployment with:

* React + TypeScript frontend
* Vite production builds
* Python backend services
* Firebase integration
* AI-assisted scam analysis
* Backend-powered AI inference
* Render backend deployment
* Separate billing service
* Environment-based configuration
* Proprietary commercial licensing

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Python
* Machine-learning models
* API services
* Render deployment

### AI

* Backend-powered AI inference
* AI-assisted scam investigation

### Infrastructure

* Firebase
* Render
* External billing service

## Production Architecture

```text
User
  ↓
-SRG-ScamCheck Frontend
  ↓
Python Backend API
  ↓
AI / Investigation Services
  ↓
Firebase / External Services

Separate Billing Service
  ↓
Stripe Payment Infrastructure
```

Billing is handled through a **separate backend billing service** using Stripe payment infrastructure. The billing service is separate from the -SRG-ScamCheck application backend.

## Environment Configuration

Production credentials and secrets must be stored using environment variables.

Never commit:

* API keys
* Stripe secret keys
* Stripe webhook secrets
* Private Firebase credentials
* Other private credentials

Use `.env.example` as the configuration reference.

## Deployment

The frontend and backend are deployed as separate services.

The Python backend is located in:

```text
backend/
```

Backend dependencies are defined in:

```text
backend/requirements.txt
```

The application does not use voice or voice-upload functionality.
