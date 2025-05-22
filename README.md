# 🍔 Delicious Food Delivered to Your Doorstep

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://delicious-food-delivered-to-your-doorstep.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📖 Project Description

**Delicious Food Delivered to Your Doorstep** is a full-stack **food delivery web application** designed for effortless browsing, ordering, and delivery of diverse cuisines to your home. 

This project features a modern, responsive UI powered by **React.js** and a secure backend built with **Node.js** and **Express.js**, backed by **MongoDB** for data persistence. It supports JWT-based authentication and offers separate dashboards for users and admins, enabling personalized and secure interactions.

---

## 🚀 Features

- 🔐 **User Authentication:** Secure signup/signin with JSON Web Tokens (JWT)
- 👤 **Dual Dashboards:**
  - **User Dashboard:** Browse menus, place orders, track deliveries
  - **Admin Dashboard:** Manage food items, orders, and users
- 🍽️ Browse multiple cuisines with detailed menus
- 🛒 Add, update, and remove items from your cart easily
- 📱 Fully responsive design for all devices
- 📸 Admin file uploads for food images using Multer
- 🌐 Cross-Origin Resource Sharing (CORS) enabled for API
- 🔄 Real-time order status updates

---

## 🛠️ Technologies Used

| Frontend                     | Backend                      | Database     | Others                  |
|------------------------------|------------------------------|--------------|-------------------------|
|                   | Node.js                     | MongoDB      | JWT Authentication      |
| CSS3, HTML5, JavaScript (ES6+) | Express.js                  | Mongoose     | Multer (file uploads)   |
| Vercel (Deployment)          | Render (Backend Hosting)     |              | dotenv (env config)     |

---

## 📁 Project Structure

Delicious-Food-Delivered-to-Your-Doorstep/
│
├── backend/ # Express API server
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API routes for auth, foods, orders, users
│ ├── middleware/ # Auth & other middleware
│ ├── app.js # Main backend setup
│ └── .env # Environment variables (not committed)
│
├── frontend/ # React client app
│ ├── src/
│ ├── public/
│ ├── package.json
│ └── .env # Frontend env configs
│
└── README.md



---

## ⬇️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Nir-Bhay/Delicious-Food-Delivered-to-Your-Doorstep.git
cd Delicious-Food-Delivered-to-Your-Doorstep

## ⬇️ Installation and Setup

### 1. Backend Setup

```bash
cd backend
npm install

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

cd ../frontend
npm install
npm start


How to Use
Visit the app and sign up or log in.
Users can browse menus, add food items to the cart, and place orders.
Track your order status in real-time.
Admins log in to access the admin dashboard for managing inventory, orders, and users.
Admins can upload images for food items via the dashboard.


🤝 Contribution
Contributions are highly welcomed!
Feel free to fork the repository, create a feature branch, and submit pull requests.
For major changes, please open an issue to discuss beforehand.

🔖 Tags
#ReactJS #ExpressJS #NodeJS #MongoDB #Multer #JWT #FullStack #FoodDelivery #WebApp #Vercel #Render


---


