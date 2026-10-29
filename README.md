# Leave Management System - Frontend Client

Modern responsive web application for the **Employee Leave Management System** built with **React 18**, **Vite**, and **Tailwind CSS**.

---

## 🛠 Features
- **JWT Authentication & RBAC**: Automated token storage and injection with Axios interceptors.
- **Interactive Dashboard**: Real-time KPI metric cards (Pending, Approved, Rejected, Headcount).
- **Employee Directory**: Searchable list with department tags and instant employee registration modal.
- **Leave Request Management**: Client-side date comparison ($endDate \ge startDate$), day duration calculation, and status tracking.
- **Admin Review Queue**: Dedicated admin view to authorize requests or reject them with mandatory feedback notes.
- **Evaluator Quick-Fill**: 1-click login buttons for Administrator (`admin@ombits.com`) and Employee (`john@ombits.com`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm

### Installation & Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at:
   👉 **`http://localhost:5173`**

*(Make sure the backend is running on `http://localhost:8080`; Vite is pre-configured to proxy `/api` requests seamlessly).*
