# KO2Pharma — Frontend

Angular SPA for a pharmacy management system built as a final project for a Higher Vocational Degree in Web Application Development (DAW).

**Live demo:** [https://pharma.ko2-oreilly.com](https://pharma.ko2-oreilly.com)

---

## Part of the KO2Pharma project

| Repo | Tech | Description |
|------|------|-------------|
| [farmacia-ko2-frontend](https://github.com/ko2javier/farmacia-ko2-frontend) *(this repo)* | Angular 21 | SPA frontend |
| [pharma_back_py](https://github.com/ko2javier/pharma_back_py) | Python + async FastAPI | REST API backend **(serving production)** |
| [farmacia-ko2-back](https://github.com/ko2javier/farmacia-ko2-back) | Spring Boot + Java 21 | the original backend, retired 17 Oct 2026 |
| [farmacia-ko2-ia](https://github.com/ko2javier/farmacia-ko2-ia) | Python + FastAPI | AI semantic matching microservice |

---

## Tech Stack

| | Technology |
|---|---|
| Framework | Angular 21 |
| Language | TypeScript |
| UI | Bootstrap 5 + custom CSS |
| Charts | ngx-charts 25 |
| i18n | ngx-translate 17 (ES / EN / DE) |
| Alerts | SweetAlert2 |
| Export | jsPDF + jspdf-autotable, xlsx |
| Auth | JWT via localStorage |
| Deployment | Docker multi-stage build (Node → Nginx) |

---

## Features

- **JWT Authentication** — login, token storage, HTTP interceptor that injects `Authorization: Bearer` on every request
- **Inventory management** — full CRUD with barcode support, stock batch updates and optimistic conflict handling (409)
- **AI-assisted drug validation** — before adding a product, searches the official AEMPS drug registry and shows the top 3 AI-matched suggestions via a modal
- **Sales module** — cart-based sale registration with PDF invoice, and cancellation into a separate cancelled-sales history
- **Statistics dashboard** — interactive charts (sales by user, top products, revenue over time)
- **Activity log** — real-time audit trail of all write operations (admin only)
- **User management** — create/delete users, role assignment (SUPERADMIN / ADMIN / SELLER)
- **Export** — PDF and Excel reports from any data table
- **Dark mode** — toggle persisted in localStorage
- **Multilingual** — Spanish, English and German via i18n JSON files (`src/assets/i18n/`; the German file is named `gr.json`)

---

## Architecture

```
Angular SPA (Docker + Nginx)  ·  pharma.ko2-oreilly.com
        │
        │  HTTPS + JWT
        ▼
FastAPI backend  ·  pharma-api-py.ko2-oreilly.com  ──►  MySQL (Aiven)
  (Hetzner VPS, Docker Compose)
        │
        ├──────────────────────►  AEMPS (Spanish drug registry)
        │
        └──────────────────────►  FastAPI AI microservice (internal network)
```

The frontend never calls the AI microservice or AEMPS directly — all external calls go through the backend.

Until October 2026 that backend was the Spring Boot service at `pharma-api.ko2-oreilly.com`. The SPA switched to the
FastAPI port on 12 October and the Spring Boot service was stopped on 17 October; the JSON contract is identical, so
the switch was one URL in `src/environments/`.

The API base URL lives in `src/environments/`. It points at the self-managed Hetzner deployment since the August 2026 cutover; the previous Railway URL is kept commented out in `environment.ts` alongside the `localhost:5000` entry for local work.

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

The `Dockerfile` is a two-stage build: `node:20-alpine` compiles the production bundle, then `nginx:alpine` serves `dist/fp_daw/browser` on port 80. `nginx.conf` falls back to `index.html` so Angular's client-side routing works on refresh.

---

## Author

**Javier** — DAW student, San Viator  
GitHub: [@ko2javier](https://github.com/ko2javier)
