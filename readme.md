# User Service - MLM System

This service is part of the **MLM-System** backend. It handles user authentication, registration, profile management, password reset, referral logic, user placement (how users are connected in the referral/binary tree), and admin operations. It is designed to be accessed via the API Gateway and communicates with a MongoDB database.

---

## 📁 Directory Structure

```
MLM-System/
│
├── backend/
│   ├── api-gateway/           # Main entrypoint for all frontend/backend API calls
│   │   ├── .env
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js
│   │       ├── middlewares/
│   │       ├── routes/
│   │       └── utils/
│   ├── user-service/          # Handles user, auth, and referral logic
│   │   ├── .env
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── index.js           # Main entry point (legacy, use src/index.js)
│   │   ├── package.json
│   │   ├── seed.js
│   │   └── src/
│   │       ├── controllers/
│   │       │   ├── auth.js         # User authentication, registration, profile, password logic
│   │       │   ├── admin.js        # Admin-specific logic
│   │       │   └── referral.js     # Referral tree and validation logic
│   │       ├── middlewares/
│   │       │   ├── jwtAuth.js      # JWT authentication middleware
│   │       │   └── ...             # Other custom middlewares
│   │       ├── models/
│   │       │   └── User.js         # Mongoose User schema
│   │       ├── routes/
│   │       │   ├── auth.js         # Auth/user-related API routes
│   │       │   ├── adminRoutes.js  # Admin API routes
│   │       │   └── referral.js     # Referral API routes
│   │       ├── utils/
│   │       │   ├── referralUtils.js # Referral code generation, tree helpers
│   │       │   ├── sendEmail.js     # Email sending utility (nodemailer)
│   │       │   └── wrapAsync.js     # Async error wrapper for routes
│   │       └── index.js            # Main Express app entry point
│   ├── wallet-service/         # Wallet management (top-up, withdrawal, transactions)
│   ├── income-service/         # Income/commission logic
│   └── admin-service/          # Admin authentication and management
│
├── frontend/                   # Next.js frontend
│   ├── .env.local
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.mjs
│   ├── eslint.config.mjs
│   ├── components/
│   ├── pages/
│   ├── public/
│   └── utils/
│
└── readme.md                   # This file
```

---

## 🚦 Main Functionality

- **User Registration & Login:**  
  Handles new user sign-up, login, and JWT issuance.
- **Profile Management:**  
  Fetch and update user profile, including personal and bank details.
- **Password Management:**  
  Forgot password (email reset link), reset password, and change password.
- **Referral System:**  
  Supports direct and binary tree referral logic, referral code validation.
- **User Placement (Referral/Binary Tree):**  
  When a user registers with a referral code, the system places them in the correct position in the referral/binary tree. Placement logic ensures each user is connected to their sponsor and, if using a binary tree, to the left or right position as per business rules. This structure enables tracking of downlines and network growth.
- **Admin Operations:**  
  Admin login, user management, and admin-specific endpoints.
- **Email Notifications:**  
  Sends password reset and other transactional emails.
- **Security:**  
  Uses JWT for authentication, bcrypt for password hashing, and CORS for frontend access.

---

## 🛡️ Middlewares

- **CORS:**  
  Configured to allow requests from the frontend (`CLIENT_URL` or `http://3.110.157.87:3000`), with credentials and standard headers.
- **cookieParser:**  
  Parses cookies for JWT and session management.
- **express.json:**  
  Parses incoming JSON requests.
- **jwtAuth:**  
  Protects routes that require authentication by verifying JWT tokens.
- **wrapAsync:**  
  Utility to catch async errors in route handlers and pass them to Express error handling.
- **Error Handler:**  
  Catches all errors and returns a JSON response with error details.

---

## 🛣️ Routes Overview

### `/api/auth` (see [`src/routes/auth.js`](backend/user-service/src/routes/auth.js))

| Method | Endpoint                | Description                        | Middleware      |
|--------|-------------------------|------------------------------------|-----------------|
| POST   | `/register`             | Register new user                  |                 |
| POST   | `/login`                | User login (returns JWT)           |                 |
| POST   | `/forgot-password`      | Request password reset email       |                 |
| POST   | `/reset-password`       | Reset password with token          |                 |
| PUT    | `/profile`              | Update user profile                | `jwtAuth`       |
| PUT    | `/change-password`      | Change password                    | `jwtAuth`       |
| GET    | `/me`                   | Get current user profile           | `jwtAuth`       |

### `/api/admin` (see [`src/routes/adminRoutes.js`](backend/user-service/src/routes/adminRoutes.js))

| Method | Endpoint                | Description                        | Middleware      |
|--------|-------------------------|------------------------------------|-----------------|
| POST   | `/login`                | Admin login                        |                 |
| GET    | `/users`                | List all users                     | `jwtAuth` (admin only) |
| ...    | ...                     | Other admin operations             |                 |

### `/api/referral` (see [`src/routes/referral.js`](backend/user-service/src/routes/referral.js))

| Method | Endpoint                | Description                        | Middleware      |
|--------|-------------------------|------------------------------------|-----------------|
| GET    | `/validate/:code`       | Validate referral code             |                 |
| GET    | `/tree/:userId`         | Get referral tree for user         | `jwtAuth`       |
| POST   | `/placement`            | Place a new user under a sponsor (binary/left/right logic) | `jwtAuth` or as required |
| ...    | ...                     | Other referral endpoints           |                 |

---

## 🌳 User Placement & Connection Logic

### How User Placement Works

- **Referral Code:**  
  When a new user registers, they provide a referral code. The system validates this code and determines the sponsor.
- **Binary Tree Placement:**  
  The system checks the sponsor's left and right positions. If a position is available, the new user is placed there. If both are filled, placement may follow a spillover or other business logic.
- **User Document Fields:**
  - `sponsorId`: The direct sponsor (referrer).
  - `parentId`: The parent in the binary tree (may be same as sponsor or determined by placement logic).
  - `leftUser` / `rightUser`: References to the user's left and right downlines.
  - `referralCodeLeft` / `referralCodeRight`: Codes for left/right placement.
- **Placement Endpoint:**  
  The `/api/referral/placement` endpoint (or handled during registration) manages this logic, ensuring users are connected correctly in the tree.

### Example Placement Flow

1. **User registers with referral code.**
2. **System validates the code and finds the sponsor.**
3. **System checks sponsor's left/right positions:**
   - If left is empty, user is placed left.
   - If right is empty, user is placed right.
   - If both are filled, system finds next available position (spillover).
4. **User document is updated with sponsor/parent/left/right references.**
5. **Sponsor's user document is updated to reference the new user.**

---

## 🧩 Key Files

- [`src/controllers/auth.js`](backend/user-service/src/controllers/auth.js):  
  All user authentication, registration, profile, and password logic.
- [`src/controllers/referral.js`](backend/user-service/src/controllers/referral.js):  
  Referral validation and tree logic.
- [`src/models/User.js`](backend/user-service/src/models/User.js):  
  Mongoose schema for users, including referral fields.
- [`src/middlewares/jwtAuth.js`](backend/user-service/src/middlewares/jwtAuth.js):  
  JWT authentication middleware.
- [`src/utils/sendEmail.js`](backend/user-service/src/utils/sendEmail.js):  
  Utility for sending emails (e.g., password reset).
- [`src/utils/referralUtils.js`](backend/user-service/src/utils/referralUtils.js):  
  Referral code generation and helpers.

---

## ⚙️ Environment Variables

See `.env.example` for all required variables:

```
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://3.110.157.87:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email
```

---

## 🏁 Running the Service

```bash
# Install dependencies
npm install

# Start the service (development)
npm run dev

# Or with Docker
docker build -t user-service .
docker run --env-file .env -p 5001:5001 user-service
```

---

## 📝 Notes

- All passwords are hashed with bcrypt.
- JWT tokens are set as HTTP-only cookies on login.
- Profile update does not allow changing referral or admin fields.
- All errors are returned as JSON.
- Referral and placement logic supports both direct and binary tree relationships.
- Admin users can be seeded via `seed.js`.
- **User placement logic ensures every new user is connected in the referral/binary tree as per business rules.**

---

## 📚 See Also

- [API Gateway README](backend/api-gateway/README.md)
- [Frontend README](frontend/README.md)

---

## 🛠️ Service Overview & Integration

### 1. **API Gateway**
- **Role:** Single entry point for all frontend/backend API calls.
- **Routes:** Proxies requests to user, wallet, income, and admin services.
- **Example:** `/api/auth/register` → user-service, `/api/wallet/user/topup-request` → wallet-service.

### 2. **User Service**
- **Role:** Handles user registration, authentication, profile, referral tree, and placement logic.
- **Routes:** `/api/auth/*`, `/api/referral/*`
- **Referral Placement:** On registration, users are placed in a binary tree structure under a sponsor.

### 3. **Wallet Service**
- **Role:** Manages user wallets, top-up requests, withdrawal requests, and wallet transactions.
- **Routes:** `/user/topup-request`, `/user/withdraw-request`, `/user/:id/wallet`, `/admin/topup-request/:id/approve`, `/admin/withdraw-request/:id/approve`
- **Integration:** 
  - When a top-up is approved, the wallet is credited and a trigger is sent to the income-service for commission distribution.
  - Withdrawal requests are validated against wallet balance.

### 4. **Income Service**
- **Role:** Handles income distribution, commission logic, and business volume calculations.
- **Routes:** `/api/income/topup-trigger`, `/api/income/...`
- **Integration:** Receives triggers from wallet-service after top-up approval and distributes income up the referral tree.

### 5. **Admin Service**
- **Role:** Admin authentication, user management, dashboard stats.
- **Routes:** `/api/admin/*`

---

## 🔗 How Services Work Together

### Example: **Top-up Approval Flow**

1. **User submits a top-up request** via `/api/wallet/user/topup-request` (API Gateway → wallet-service).
2. **Admin approves the top-up** via `/api/wallet/admin/topup-request/:id/approve` (API Gateway → wallet-service).
3. **Wallet-service actions:**
   - Marks the top-up as approved.
   - Credits the user's topupWallet.
   - **Triggers income-service** (`/api/income/topup-trigger`) to distribute commissions.
   - **Optionally notifies user-service** to activate the user if this is their first top-up.
4. **Income-service actions:**
   - Calculates and distributes commissions up the referral tree.
   - Updates business volume and income records.
5. **Frontend** is updated via API Gateway responses.

### Example: **Withdrawal Request Flow**

1. **User submits a withdrawal request** via `/api/wallet/user/withdraw-request`.
2. **Admin approves the withdrawal** via `/api/wallet/admin/withdraw-request/:id/approve`.
3. **Wallet-service** deducts the amount from the user's incomeWallet and marks the request as approved.

---

## 🛣️ Main Routes Overview

### **API Gateway**

- `/api/auth/*` → user-service
- `/api/referral/*` → user-service
- `/api/wallet/*` → wallet-service
- `/api/income/*` → income-service
- `/api/admin/*` → admin-service

### **User Service**

- `/api/auth/register` — Register user (with referral code and placement)
- `/api/auth/login` — Login
- `/api/auth/forgot-password` — Send reset email
- `/api/auth/reset-password` — Reset password
- `/api/auth/profile` — Update profile (JWT required)
- `/api/auth/change-password` — Change password (JWT required)
- `/api/auth/me` — Get current user (JWT required)
- `/api/referral/validate/:code` — Validate referral code
- `/api/referral/binary-tree/:userId` — Get user's binary tree

### **Wallet Service**

- `/user/topup-request` — User requests top-up
- `/user/withdraw-request` — User requests withdrawal
- `/user/:id/wallet` — Get wallet info
- `/admin/topup-request/:id/approve` — Admin approves top-up
- `/admin/withdraw-request/:id/approve` — Admin approves withdrawal

### **Income Service**

- `/api/income/topup-trigger` — Triggered by wallet-service after top-up approval
- `/api/income/...` — Other income/commission endpoints

---

## 🗄️ Database Schema Highlights

- **User:** Includes referral codes, parent/child links for binary tree, wallet status, and profile info.
- **Wallet:** Tracks topupWallet, incomeWallet, shoppingWallet, and transaction logs.
- **TopupRequest/WithdrawRequest:** Track status and history of user wallet actions.
- **Income:** Tracks commission and business volume per user.

---

## ⚙️ Environment Variables

See `.env.example` for all required variables for each service, e.g.: