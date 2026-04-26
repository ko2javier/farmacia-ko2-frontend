# KO2Pharma — Frontend

Angular SPA for a pharmacy management system built as a final project for a Higher Vocational Degree in Web Application Development (DAW).

**Live demo:** [https://pharma.ko2-oreilly.com](https://pharma.ko2-oreilly.com)

---

## Part of the KO2Pharma project

| Repo | Tech | Description |
|------|------|-------------|
| **This repo** | Angular 19 | SPA frontend |
| [farmacia-ko2-back](https://github.com/ko2javier/farmacia-ko2-back) | Spring Boot + Java 21 | REST API backend |
| [farmacia-ko2-ia](https://github.com/ko2javier/farmacia-ko2-ia) | Python + FastAPI | AI semantic matching microservice |

---

## Tech Stack

| | Technology |
|---|---|
| Framework | Angular 19 |
| Language | TypeScript 5.6 |
| UI | Bootstrap 5 + custom CSS |
| Charts | ngx-charts |
| i18n | ngx-translate (ES / EN / DE) |
| Alerts | SweetAlert2 |
| Export | jsPDF + jspdf-autotable, xlsx |
| Auth | JWT via localStorage |
| Deployment | Railway (Docker + Nginx) |

---

## Features

- **JWT Authentication** — login, token storage, HTTP interceptor that injects `Authorization: Bearer` on every request
- **Inventory management** — full CRUD with barcode support, stock batch updates and optimistic conflict handling (409)
- **AI-assisted drug validation** — before adding a product, searches the official AEMPS drug registry and shows the top 3 AI-matched suggestions via a modal
- **Sales module** — register sales with cart, cancel with automatic stock restore
- **Statistics dashboard** — interactive charts (sales by user, top products, revenue over time)
- **Activity log** — real-time audit trail of all write operations (admin only)
- **User management** — create/delete users, role assignment (ADMIN / SELLER)
- **Export** — PDF and Excel reports from any data table
- **Dark mode** — toggle persisted in localStorage
- **Multilingual** — Spanish, English, German via i18n JSON files

---

## Architecture

```
Angular SPA (Railway / Nginx)
        │
        │  HTTP + JWT
        ▼
Spring Boot API  ──────────────►  MySQL (Aiven)
        │
        ├──────────────────────►  AEMPS (Spanish drug registry)
        │
        └──────────────────────►  FastAPI IA microservice
```

The frontend never calls the AI microservice or AEMPS directly — all external calls go through the Spring Boot backend.

---

## Project Structure

```
src/app/
├── componentes/
│   ├── login/                  # Login page
│   ├── home/                   # Shell with sidebar and router-outlet
│   ├── panel/                  # Sales panel + cart
│   ├── almacen/                # Inventory CRUD
│   ├── catalogo-externo/       # AEMPS catalogue browser
│   ├── estadisticas/           # Charts dashboard
│   ├── activity-log/           # Audit log (admin)
│   ├── users/                  # User management (admin)
│   ├── ventas-usuario/         # Sales history per user
│   ├── ventas-canceladas/      # Cancelled sales
│   ├── sugerencias-ia-modal/   # AI drug match modal
│   ├── articulo-detalle-modal/ # Product detail modal
│   └── help-modal/             # Help cards modal
├── services/                   # One service per domain
├── interceptors/
│   └── auth.interceptor.ts     # Injects JWT on every request
├── models/                     # TypeScript interfaces/DTOs
└── environments/               # API base URLs per environment
```

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run dev server (proxies API calls to localhost:5000)
ng serve
```

The `proxy.conf.json` is configured to forward `/api` calls to `http://localhost:5000` in development.

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## Build & Deploy

```bash
# Production build
ng build --configuration=production
```

The project includes a `Dockerfile` (Angular + Nginx) ready for Railway deployment.

---

## Author

**Javier** — DAW student, San Viator  
GitHub: [@ko2javier](https://github.com/ko2javier)
