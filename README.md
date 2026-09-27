# PennyWise — Full-Stack Expense Management & Financial Insights Platform

A complete full-stack personal finance and expense management web application featuring deterministic **Budget Tracking and Spending Insights**, built with a **Node.js + Express REST API**, **MongoDB + Mongoose** persistence, and a responsive **Vanilla JavaScript, Chart.js, and Lucide icons** dashboard.

**Live Frontend Demo**: [https://penny-wise-expense-tracker.netlify.app/](https://penny-wise-expense-tracker.netlify.app/)

---

## Key Features

### 1. Core Financial Dashboard
* **Dynamic Net Balance, Income, and Expense Metrics**: Real-time aggregation of income streams vs. spending directly from MongoDB.
* **Full CRUD Transaction Lifecycle**:
  * Add transactions with title, amount, type (`expense` or `income`), category, date, and optional notes.
  * In-place transaction editing with full state synchronization.
  * Instant deletion with responsive UI recalculation.
* **Category Filtering**: Filter transactions seamlessly by type (`All`, `Expenses Only`, `Income Only`).
* **Visual Expense Analytics**: Interactive Doughnut chart powered by Chart.js showcasing category distribution with hover tooltips and dynamic color mapping.
* **Light / Dark Theme Engine**: System-aware and persistent theme toggle (saved in `localStorage`) with smooth transitions and Lucide icons.
* **Responsive Layout**: Mobile-friendly sidebar and grid layout designed with modern CSS custom properties and Flexbox/Grid.

### 2. Deterministic Budget & Spending Insights Engine
* **Zero External AI Dependency**: Built with 100% deterministic algorithms, MongoDB aggregation pipelines, and date-range calculations (ideal for summer training project defense).
* **Monthly Spending Budget**: Set or update a monthly spending cap (`YYYY-MM`) with instant limit tracking.
* **Real-Time Budget Pace & Status**:
  * **Safe** (< 75% utilized): Spending is comfortably within target limits.
  * **Warning** (75%–100% utilized): Pacing alert to curb discretionary expenses.
  * **Exceeded** (> 100% utilized): Overspending alert indicating the exact overflow amount.
* **Algorithmic Spending Insights**:
  * **Top Expense Category**: Identifies highest spending category and its exact percentage of total expenses.
  * **Daily Burn Rate**: Computes `Total Spent / Days Elapsed` for the active calendar month.
  * **Largest Single Expense**: Surfaces the single highest expense recorded.
  * **Month-over-Month Comparison**: Calculates percentage increase or decrease relative to the previous month.
  * **Human-Readable Insight Feed**: Deterministically synthesizes natural language financial observations based on calculated metrics.

---

## Tech Stack

* **Frontend**: HTML5, CSS3 (Custom Properties & Responsive Grid), Vanilla JavaScript (ES6+), Chart.js (v4), Lucide Icons.
* **Backend**: Node.js (v22), Express.js (v5), RESTful architecture with ES6 modules (`import`/`export`).
* **Database**: MongoDB (Mongoose v9 ODM).
* **Dev & Deployment**: Dotenv, CORS, Netlify (`netlify.toml`), Render (`render.yaml`).

---

## Project Folder Structure

```
C:\Expense-tracker\
├── package.json                   # Project dependencies and npm scripts (ES Module)
├── .env                           # Environment configuration (PORT=5000, MONGO_URI)
├── .env.example                   # Environment configuration template
├── .gitignore                     # Ignores node_modules, .env, and logs
├── server.js                      # Express server entry point (ES6 Module)
├── netlify.toml                   # Netlify configuration & API proxy redirects
├── render.yaml                    # Render blueprint deployment configuration
├── config/
│   └── db.js                      # Mongoose connection logic & lifecycle handlers
├── models/
│   ├── Transaction.js             # Mongoose schema for expenses and incomes
│   └── Budget.js                  # Mongoose schema for monthly budgets
├── controllers/
│   ├── transactionController.js   # CRUD operations and financial summary controller
│   └── budgetController.js        # Budget management and insights controller
├── services/
│   └── insightService.js          # Deterministic financial intelligence algorithms
├── routes/
│   ├── transactionRoutes.js       # Routes for /api/transactions
│   └── budgetRoutes.js            # Routes for /api/budget
├── middleware/
│   ├── errorHandler.js            # Centralized API error handling middleware
│   └── validateRequest.js         # Payload validation middleware
├── scripts/
│   └── verify_e2e.js              # Automated end-to-end verification test suite
└── public/                        # Static frontend assets served by Express / Netlify
    ├── index.html                 # Dashboard markup with Budget & Insights UI
    ├── style.css                  # Custom styling (light/dark variables, badges, layout)
    ├── script.js                  # Frontend UI controller and event coordinator
    ├── _redirects                 # Netlify API proxying rule
    ├── js/
    │   └── api.js                 # API service layer (async fetch wrapper)
    └── assets/                    # Preserved brand images and icon assets
```

---

## Database Schemas

### 1. Transaction Schema (`models/Transaction.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `title` | `String` | Required, Trim, Max: 100 | Expense/Income description |
| `amount` | `Number` | Required, Min: 0.01 | Transaction value in INR (₹) |
| `type` | `String` | Required, Enum: `['expense', 'income']` | Transaction direction |
| `category` | `String` | Required, Enum: `['Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Education', 'Salary', 'Investment', 'Other']` | Categorical classification |
| `date` | `Date` | Required, Default: `Date.now` | Date of occurrence |
| `notes` | `String` | Optional, Trim, Max: 250 | Additional remarks |
| `timestamps` | `Boolean` | `createdAt`, `updatedAt` | Auto-generated audit dates |

### 2. Budget Schema (`models/Budget.js`)
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `month` | `String` | Required, Unique, Format: `YYYY-MM` | Target calendar month (e.g., `2026-09`) |
| `amount` | `Number` | Required, Min: 1 | Spending cap limit in INR (₹) |
| `timestamps` | `Boolean` | `createdAt`, `updatedAt` | Auto-generated audit dates |

---

## REST API Reference

All responses adhere to standardized JSON formats: `{ success: true, data: ... }` or `{ success: false, error: ... }`.

### Transaction Endpoints
* `GET /api/transactions` — Retrieve all transactions (supports `?type=expense|income` & `?category=...`).
* `GET /api/transactions/:id` — Retrieve a single transaction by ID.
* `POST /api/transactions` — Create a new transaction.
* `PUT /api/transactions/:id` — Update an existing transaction.
* `DELETE /api/transactions/:id` — Delete a transaction by ID.
* `GET /api/transactions/summary` — Aggregated net balance, total income, total expense, and category totals.

### Budget & Insights Endpoints
* `GET /api/budget?month=YYYY-MM` — Retrieve configured budget for a given month.
* `POST /api/budget` — Upsert (set or update) budget `{ month: "YYYY-MM", amount: Number }`.
* `GET /api/budget/insights?month=YYYY-MM` — Retrieve calculated budget utilization, status (`Safe`, `Warning`, `Exceeded`), top categories, daily average, and deterministic insight sentences.

---

## Deployment Guide (Netlify & Render)

### 1. Backend on Render
1. Go to [dashboard.render.com](https://dashboard.render.com) and click **New + > Web Service**.
2. Connect your GitHub repository: `jatinrwt01/expense-tracker`.
3. Configure settings:
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. Add Environment Variables:
   * `NODE_ENV` = `production`
   * `MONGO_URI` = your **MongoDB Atlas connection string** (`mongodb+srv://...`)
5. Deploy service. Once live, copy your backend URL (e.g. `https://penny-wise-expense-tracker.onrender.com`).

### 2. Frontend on Netlify
1. Go to [app.netlify.com](https://app.netlify.com) and connect your repository: `jatinrwt01/expense-tracker`.
2. Configure settings:
   * **Publish directory**: `public`
   * **Build command**: *(leave blank or empty)*
3. In `netlify.toml` / `public/_redirects`, ensure the Render backend URL matches your active Render service.
4. Netlify will automatically build and publish your frontend to `https://penny-wise-expense-tracker.netlify.app`.

---

## Local Development

```bash
# 1. Start MongoDB locally (port 27017)
# 2. Start server
npm start

# Access local app
http://localhost:5000
```
