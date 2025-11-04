Velvet Vogue - E-commerce Website
A complete, responsive e-commerce website for a luxury clothing brand built with modern web technologies featuring a beautiful glassmorphism design.

https://img.shields.io/badge/Velvet-Vogue-purple
https://img.shields.io/badge/Node.js-18+-green
https://img.shields.io/badge/Database-SQLite-blue

🌟 Features
Frontend Features
Responsive Design - Works perfectly on desktop, tablet, and mobile

Glassmorphism UI - Modern translucent glass effect design

Product Catalog - Browse, search, and filter products

Shopping Cart - Add, remove, and update items with persistent storage

User Authentication - Secure login/register system

Admin Panel - Complete admin interface for managing products and orders

Smooth Animations - CSS transitions and interactive elements

Backend Features
RESTful API - Clean API design with proper HTTP methods

JWT Authentication - Secure token-based authentication

SQLite Database - Lightweight and efficient database

Admin Privileges - Role-based access control

Order Management - Complete order processing system

Product Management - CRUD operations for products

🚀 Quick Start
Prerequisites
Node.js (v18 or higher)

npm (comes with Node.js)

Installation
Clone or download the project

bash
# If using git
git clone <repository-url>
cd velvet_vogue
Install backend dependencies

bash
cd backend
npm install
Start the server

bash
node server.js
Access the application

Open your browser and go to: http://localhost:3000

Default Login Credentials
Admin Account:

Email: admin@velvetvogue.com

Password: admin123

Access: Full admin privileges including product and order management

Demo User Account:

Email: user@example.com

Password: user123

Access: Standard user features (browsing, cart, orders)

📁 Project Structure
text
velvet_vogue/
├── frontend/                 # Frontend files
│   ├── index.html           # Home page
│   ├── products.html        # Product listing
│   ├── product-detail.html  # Product details
│   ├── cart.html           # Shopping cart
│   ├── checkout.html       # Checkout process
│   ├── login.html          # User login
│   ├── register.html       # User registration
│   ├── contact.html        # Contact page
│   ├── admin.html          # Admin panel
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   └── js/
│       ├── main.js         # Core functionality
│       ├── auth.js         # Authentication logic
│       ├── cart.js         # Cart management
│       ├── products.js     # Product operations
│       └── admin.js        # Admin features
├── backend/                 # Backend files
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   └── database.db         # SQLite database (auto-created)
└── README.md              # This file
🛠️ Technology Stack
Frontend
HTML5 - Semantic markup

CSS3 - Modern styling with CSS Grid, Flexbox, and Glassmorphism effects

JavaScript (ES6+) - Client-side interactivity

Fonts - Google Fonts (Montserrat, Poppins)

Backend
Node.js - Runtime environment

Express.js - Web application framework

SQLite3 - Database engine

JWT - JSON Web Tokens for authentication

bcryptjs - Password hashing

CORS - Cross-origin resource sharing

📊 API Endpoints
Authentication
POST /api/auth/register - User registration

POST /api/auth/login - User login

GET /api/auth/me - Get current user

Products
GET /api/products - Get all products

GET /api/products/featured - Get featured products

GET /api/products/:id - Get product by ID

GET /api/products/category/:category - Get products by category

Orders
POST /api/orders - Create new order (authenticated)

GET /api/orders/my-orders - Get user orders (authenticated)

Admin (Requires Admin Role)
GET /api/admin/orders - Get all orders

PUT /api/admin/orders/:id - Update order status

GET /api/admin/products - Get all products

POST /api/admin/products - Add new product

PUT /api/admin/products/:id - Update product

DELETE /api/admin/products/:id - Delete product

GET /api/admin/stats - Get dashboard statistics

🎨 Design Features
Color Palette
Primary: Light Purple #C8A2C8

Accent: Gold Shades #FFD700, #E6BE8A

Background: White #FFFFFF

Supporting: Soft Gray #F8F8F8, Light Beige #FAF3E0

Typography
Headings: Montserrat (600 weight)

Body: Poppins (300-500 weights)

Glassmorphism Effects
Backdrop blur filters

Translucent backgrounds

Soft shadows and borders

Smooth transitions

🔧 Configuration
Environment Variables
The application uses the following default configuration:

Port: 3000

JWT Secret: velvet_vogue_jwt_secret_2023

Database: SQLite (database.db)

Customization
To modify the configuration, edit the constants in backend/server.js:

javascript
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_custom_secret_here';
🛒 User Flow
Browse Products - View featured products or browse all items

Search & Filter - Find products by name, category, or price

Product Details - View detailed product information with options

Add to Cart - Select size, color, and quantity

Checkout - Secure checkout process with order confirmation

Order Tracking - View order history and status

👨‍💼 Admin Features
Dashboard - Overview of orders, products, and revenue

Order Management - View, update status, and manage all orders

Product Management - Add, edit, and delete products

Inventory Control - Track stock levels and featured products

🐛 Troubleshooting
Common Issues
"Cannot find module" error

Run npm install in the backend directory

Ensure you're in the correct directory when running commands

Port already in use

Change the port in server.js or kill the existing process

Use npx kill-port 3000 to free the port

Database errors

Delete database.db and restart the server to recreate it

Check file permissions in the backend directory

Login issues

Use the exact credentials: admin@velvetvogue.com / admin123

Ensure the server is running before trying to login

Development Tips
Check browser console for JavaScript errors

Monitor server terminal for backend errors

Use browser dev tools to inspect network requests

Clear browser cache if styles don't update

📱 Browser Support
Chrome 90+

Firefox 88+

Safari 14+

Edge 90+

🔒 Security Features
Password hashing with bcrypt

JWT token authentication

SQL injection prevention

XSS protection through input sanitization

CORS configuration

📈 Future Enhancements
Product reviews and ratings

Wishlist functionality

Email notifications

Payment gateway integration

Image upload for products

Advanced search filters

Order tracking with shipping

Multi-language support

PWA capabilities

🤝 Contributing
Fork the project

Create a feature branch

Commit your changes

Push to the branch

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.