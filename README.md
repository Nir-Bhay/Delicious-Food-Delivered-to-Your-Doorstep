# 🍔 Cloud Kitchen - Food Delivery Web Application

![Cloud Kitchen Banner](https://img.shields.io/badge/Cloud%20Kitchen-Food%20Delivery-ff6347?style=for-the-badge&logo=foodpanda&logoColor=white)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=for-the-badge)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🍕 About

Cloud Kitchen is a modern full-stack web application that streamlines the food ordering process. Users can explore a wide variety of dishes, place orders, and enjoy food delivered right to their homes. The system includes secure authentication, personalized dashboards, and real-time order updates — all wrapped in a seamless user experience.

### 🎯 Key Highlights

- **Fast Delivery**: 30-minute delivery guarantee
- **Fresh Ingredients**: Farm-to-table quality
- **24/7 Service**: Order anytime, anywhere
- **Eco-Friendly**: Biodegradable packaging
- **Multiple Plans**: Flexible subscription options

## ✨ Features

### For Customers
- 🔐 **Secure Authentication**: Login/Signup with JWT tokens
- 🍱 **Interactive Menu**: Browse breakfast, lunch, and dinner options
- 🛒 **Smart Cart**: Add to cart with animations
- 💳 **Multiple Payment Options**: Secure payment processing
- 📱 **Responsive Design**: Works on all devices
- 🔔 **Real-time Updates**: Order tracking and notifications
- 💰 **Subscription Plans**: Premium, Executive, and Basic options

### For Admins
- 📊 **Dashboard Analytics**: Track orders and revenue
- 🍽️ **Menu Management**: Add/Edit/Delete menu items
- 👥 **User Management**: View and manage customers
- 📦 **Order Management**: Process and track orders

## 🚀 Demo

**Live Demo**: [Cloud Kitchen Demo](https://your-demo-link.com)

**Test Credentials**:

User Account:
Email: demo@example.com
Password: demo123

Admin Account:
Email: admin@example.com
Password: admin123


## 🛠️ Tech Stack

### Frontend
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

### Libraries & Frameworks
- **AOS** - Animate On Scroll library
- **Swiper.js** - Modern carousel slider
- **Font Awesome** - Icon library
- **Google Fonts** - Typography

### Backend
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat-square)

### Deployment
- **Frontend**: Netlify/Vercel
- **Backend**: Render.com

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/cloud-kitchen.git
cd cloud-kitchen
# Navigate to frontend directory
cd frontend

# Install dependencies (if any)
npm install

# Start local server
# You can use Live Server extension in VS Code or:
python -m http.server 8000
# or
npx serve
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your environment variables
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000

# Start the server
npm start
```

```
cloud-kitchen/
│
├── frontend/
│   ├── index.html          # Homepage
│   ├── login.html          # Login page
│   ├── signup.html         # Signup page
│   ├── style.css           # Main styles
│   ├── script.js           # Main JavaScript
│   │
│   ├── img/                # Images directory
│   │   ├── logo.png
│   │   ├── hero.png
│   │   └── ...
│   │
│   ├── admin/              # Admin pages
│   │   └── admin-dashboard.html
│   │
│   └── user/               # User pages
│       └── user-dashboard.html
│
├── backend/
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   │
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── menu.js
│   │   └── orders.js
│   
│   
│   
│       
│
└── README.md
```

