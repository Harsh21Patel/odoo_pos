<div align="center">

<img src="https://img.shields.io/badge/Odoo%20POS-Cafe-1a1a1a?style=for-the-badge&logo=coffeescript&logoColor=white" alt="Odoo POS Cafe" />

# ☕ Odoo POS Cafe

### Smart POS System for Cafes & Restaurants

> **Odoo x Indus University Hackathon '26** — Reimagining cafe operations with real-time POS & self-ordering.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square\&logo=react\&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square\&logo=mongodb\&logoColor=white)](https://mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=flat-square\&logo=socket.io\&logoColor=white)](https://socket.io/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-02042B?style=flat-square\&logo=razorpay\&logoColor=white)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 📌 The Problem

Cafes and restaurants often rely on fragmented systems — manual billing, delayed kitchen communication, and inefficient table handling. This leads to slow service, order errors, and poor customer experience.

**Odoo POS Cafe** solves this with a unified, real-time POS system featuring kitchen displays, QR self-ordering, and smart table management.

---

## 🖼️ Preview

![POS Preview](https://ik.imagekit.io/ijus5prtnb/_3595__4711_Screenshot%202026-04-05%20at%202.48.24AM__3464_Screenshot%202026-04-05%20at%202.48.54AM__8936__2339_Screenshot%202026-04-05%20at%202.48.48AM__6558_Screenshot%202026-04-05%20at%202.48.36AM.jpeg)

---

## ✨ Features

### 🧾 POS Terminal

* Intuitive order management interface
* Category-based product browsing
* Real-time updates via **Socket.IO**
* Session-based cashier tracking

### 🗺️ Table & Floor Management

* Drag-and-drop visual floor plan
* Multi-floor support
* Live table status tracking
* QR code generation per table

### 👨‍🍳 Kitchen Display System (KDS)

* Live order feed
* Real-time order status updates
* Alerts for new orders

### 📱 Self-Ordering (QR Code)

* Scan → Browse → Order
* Direct order routing to kitchen
* No waiter dependency

### 🖥️ Customer Display

* Live order summary per table
* Running bill updates in real-time

### 💳 Payments

* Razorpay integration (online payments)
* Cash payment support
* PDF receipt generation

### 🛠️ Admin Panel

| Page       | Description                   |
| ---------- | ----------------------------- |
| Dashboard  | Revenue insights & KPIs       |
| Products   | Manage menu items with images |
| Categories | Organize products             |
| Tables     | Manage tables & QR codes      |
| Floors     | Multi-floor layouts           |
| Reports    | Sales analytics (PDF/Excel)   |
| Sessions   | Cashier sessions tracking     |
| Users      | Role-based access             |

---

## 🛠️ Tech Stack

| Layer        | Technology                                |
| ------------ | ----------------------------------------- |
| **Frontend** | React 18, Zustand, Tailwind CSS, Recharts |
| **Backend**  | Node.js, Express.js                       |
| **Database** | MongoDB, Mongoose                         |
| **Realtime** | Socket.IO                                 |
| **Auth**     | JWT, bcryptjs                             |
| **Payments** | Razorpay                                  |
| **Media**    | ImageKit                                  |
| **PDF/QR**   | jsPDF, QRCode                             |

---

## 🗂️ Project Structure

```
odoo-pos-cafe/
├── client/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── store/
│   └── utils/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

* Node.js v18+
* MongoDB (local or Atlas)
* Razorpay account
* ImageKit account

---

### 1. Clone the Repository

```bash
git clone https://github.com/Harsh21Patel/odoo_pos.git
cd odoo-pos-cafe
```

---

### 2. Install Dependencies on Frontend and Backend

```bash
npm run install:all
```

---

### 3. Configure Environment Variables

#### Server (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/odoo-pos-cafe
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:3000

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

#### Client (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your_key
```

---

### ▶️ Run the App

```bash
 Backend : npm run dev
 Frontend : npm start
```

* Frontend → http://localhost:3000
* Backend → http://localhost:5000

---

## 🔐 Authentication & Roles

| Role    | Access                |
| ------- | --------------------- |
| Admin   | Full system access    |
| Cashier | POS + session control |

---

## 📡 Real-Time Flow

```
Customer (QR)
      │
      ▼
Order Created ──► Kitchen Display (Live)
      │
      ▼
Preparation ──► Order Ready ──► Served
      │
      ▼
Payment (Cash / Razorpay)
```

---

## 🔌 API Endpoints

```
POST   /api/auth/login
GET    /api/products
GET    /api/categories
POST   /api/orders
GET    /api/tables
GET    /api/floors
POST   /api/payments
GET    /api/reports
GET    /api/sessions
POST   /api/upload
GET    /api/self-order/:tableId
GET    /api/health
```

---

## 👥 Team

Built with ❤️ for **Odoo x Indus University Hackathon '26** by:

* Harsh Patel
* Mohit Keswani
* Diya Solanki
* Rency Tarapara

---

## 📄 License

MIT License

---

<div align="center">

**Odoo POS Cafe ☕** — Smart dining, simplified.

*From order to payment — all in one system.*

</div>
