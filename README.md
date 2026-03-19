# 🛒 Multi-Vendor E-Commerce Backend (MERN)

This is a backend system for a **Multi-Vendor E-Commerce Application** built using the MERN stack.

## Features Implemented

- User Authentication (JWT)
- Password Hashing (bcrypt)
- Role-Based Users:
  - Admin
  - Vendor
  - Customer
- Protected Routes (Auth Middleware)

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs

## Project Structure
backend/
│
├── config/
│ └── db.js
│
├── controllers/
│ └── authController.js
│
├── middleware/
│ └── authMiddleware.js
│
├── models/
│ └── userModel.js
│
├── routes/
│ └── userRoutes.js
│
├── server.js
└── package.json



## API Endpoints

### Auth

- `POST /api/users/register`
- `POST /api/users/login`

### Protected

- `GET /api/users/profile`

## Status

Backend authentication system completed.  
Next: Product APIs & Multi-Vendor features.

---

## 👨Author

Built as part of a B.Tech project focusing on real-world backend architecture.
