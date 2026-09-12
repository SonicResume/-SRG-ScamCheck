# -SRG-ScamCheck

A scam-detection and investigation platform designed to help users identify suspicious websites, messages, UPI/payment information, and other potentially fraudulent activity.

## Features

* 🔎 Scam investigation and detection
* 🌐 Website and URL checking
* 💬 Message and text investigation
* 💳 UPI/payment-related scam checks
* 🤖 Python-powered backend services
* 🔐 Firebase integration
* ⚡ React + Vite frontend
* 📊 Machine-learning based detection models

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Python
* Machine-learning models
* API services

### Infrastructure

* Firebase
* Render for backend deployment

## Project Structure

```text
-SRG-ScamCheck/
├── backend/
├── components/
├── lib/
├── pages/
├── public/
├── services/
├── App.tsx
├── index.tsx
├── package.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## Environment Variables

Create a local `.env` file based on:

```text
.env.example
```

Do not commit private API keys, credentials, or other secrets.

## Backend

The Python backend is located in:

```text
backend/
```

Python dependencies are defined in:

```text
backend/requirements.txt
```

Stripe

The large voice-model `.pt` files are intentionally excluded from Git because GitHub's normal repository limit blocks files larger than 100 MB.

## Deployment

The frontend and backend can be deployed separately.

* Frontend: Vite production build
* Backend: Render
* Firebase: application services and configuration
  Stripe

## Development

This repository contains the current development version of **-SRG-ScamCheck**.


## License

License information will be added separately.
