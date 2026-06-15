# 📚 Smart Article Organizer

A full-stack web application designed for students, researchers, and professionals to efficiently organize, manage, search, and analyze academic articles and research papers.

The platform provides secure authentication, article management, PDF storage, categorization, favorites tracking, advanced search capabilities, and analytical insights through an intuitive web interface.

---

# 🛠️ Tech Stack

| Layer             | Technology                    |
| ----------------- | ----------------------------- |
| Frontend          | HTML5, CSS3, JavaScript       |
| Backend           | Node.js, Express.js           |
| Database          | MySQL                         |
| Authentication    | JWT, bcrypt                   |
| Security          | HTTP-only Cookies             |
| File Upload       | Multer                        |
| Development Tools | Git, GitHub, VS Code, Postman |

---

# ✨ Features

## 🔐 Authentication

* User Registration
* User Login
* User Logout
* JWT-Based Authentication
* Password Hashing with bcrypt
* Protected Routes
* User Profile Management
* Secure HTTP-only Cookies

---

## 📄 Article Management

* Add New Articles
* Edit Existing Articles
* Delete Articles
* View Article Details
* Upload Research Paper PDFs
* Download Uploaded PDFs
* Store Article Abstracts
* Maintain Personal Notes
* Store Keywords and Tags
* Store Publication Year
* Store Author Information
* Store Journal or Conference Details

---

## 🗂️ Category Management

* Create Categories
* Edit Categories
* Delete Categories
* Assign Categories to Articles
* Organize Research Papers Efficiently

---

## ⭐ Favorites System

* Add Articles to Favorites
* Remove Articles from Favorites
* Dedicated Favorites Page
* Quick Access to Important Papers

---

## 🔍 Search & Filtering

Users can search articles using:

* Article Title
* Author Name
* Keywords
* Category
* Publication Year

Additional filtering and sorting options improve article discovery and management.

---

## 📊 Dashboard

The dashboard provides:

* Total Articles
* Total Categories
* Total Favorites
* Recent Uploads
* Quick Project Overview

---

## 📈 Analytics

Generate insights using SQL queries and aggregations:

* Articles Per Category
* Publication Year Distribution
* Most Used Keywords
* Upload Activity Trends

---

# 🗄️ Database Design

## Tables

### users

Stores user account information and authentication details.

### articles

Stores article metadata and uploaded research papers.

### categories

Stores user-created categories.

### article_categories

Many-to-many relationship between articles and categories.

### favorites

Stores user favorite articles.

---

## Database Concepts Demonstrated

* Primary Keys
* Foreign Keys
* One-to-Many Relationships
* Many-to-Many Relationships
* JOIN Operations
* GROUP BY Queries
* Aggregate Functions
* Data Normalization
* Constraints and Validation

---

# 📁 Project Structure

```text
smart-article-organizer/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── articles.js
│   │   ├── categories.js
│   │   ├── favorites.js
│   │   ├── dashboard.js
│   │   └── analytics.js
│   │
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── dashboard.html
│   ├── articles.html
│   ├── article-view.html
│   └── article-form.html
│
├── database/
│   └── schema.sql
│
├── .env.example
├── README.md
└── .gitignore
```

---

# ⚙️ Setup Instructions

## Prerequisites

* Node.js (v18 or above)
* MySQL 8.0+
* VS Code
* Git

---

## 1. Clone Repository

```bash
git clone https://github.com/RishikaSadhukhan/smart-article-organizer.git
cd smart-article-organizer
```

---

## 2. Configure Database

Open MySQL Workbench and execute:

```sql
SOURCE database/schema.sql;
```

This will create the database and required tables.

---

## 3. Configure Environment Variables

Create:

```text
backend/.env
```

Copy values from:

```text
backend/.env.example
```

Update your database credentials.

---

## 4. Install Dependencies

```bash
cd backend
npm install
```

---

## 5. Run Application

Development Mode:

```bash
npm run dev
```

Production Mode:

```bash
npm start
```

Application URL:

```text
http://localhost:5000
```

---

# 🌐 Main Pages

| Page             | URL           |
| ---------------- | ------------- |
| Login / Register | /             |
| Dashboard        | /dashboard    |
| Articles         | /articles     |
| Add Article      | /article-form |
| View Article     | /article-view |
| Categories       | /categories   |
| Favorites        | /favorites    |
| Analytics        | /analytics    |
| Profile          | /profile      |

---

# 🔌 REST API Endpoints

## Authentication

* POST /api/auth/register
* POST /api/auth/login
* POST /api/auth/logout
* GET /api/auth/me

---

## Articles

* GET /api/articles
* GET /api/articles/:id
* POST /api/articles
* PUT /api/articles/:id
* DELETE /api/articles/:id

---

## Categories

* GET /api/categories
* POST /api/categories
* PUT /api/categories/:id
* DELETE /api/categories/:id

---

## Favorites

* GET /api/favorites
* POST /api/favorites/:articleId
* DELETE /api/favorites/:articleId

---

## Dashboard & Analytics

* GET /api/dashboard
* GET /api/analytics

---

# 🎓 Academic Concepts Demonstrated

This project demonstrates:

* Full-Stack Web Development
* REST API Development
* MySQL Database Design
* Authentication & Authorization
* Secure Password Hashing
* File Upload Handling
* CRUD Operations
* Middleware Implementation
* Responsive Frontend Development
* SQL Query Optimization
* Git & GitHub Workflow

---

# 📦 Dependencies

```json
{
  "bcrypt": "^5.1.1",
  "cookie-parser": "^1.4.6",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "express-validator": "^7.1.0",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5-lts.1",
  "mysql2": "^3.9.7"
}
```

---

# 👩‍💻 Author

**Rishika Sadhukhan**

Computer Science Engineering Student

Interested in Full-Stack Development, Software Engineering, Databases, and Practical Web Applications.

---

Built with ❤️ as an academic full-stack project for research article management.
