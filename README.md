# 📚 Smart Article Organizer

A full-stack web application for students and researchers to organize, manage, search, and analyze research papers and articles.

---

## 🛠️ Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript           |
| Backend    | Node.js, Express.js                       |
| Database   | MySQL                                     |
| Auth       | JWT (JSON Web Tokens), bcrypt             |
| Session    | HTTP-only Cookies                         |
| File Upload| Multer (PDF files)                        |

---

## ✨ Features

### 🔐 Authentication
- User registration & login
- JWT-based authentication stored in HTTP-only cookies
- Password hashing with bcrypt
- Protected API routes via middleware
- User profile management with avatar color picker
- Password change functionality

### 📄 Article Management
- Add, view, edit, and delete research articles
- Upload and download PDF files (up to 10 MB)
- Store abstract, personal notes, keywords, author info, publication year, journal/conference name, DOI, and URL
- Grid and list view toggle with pagination

### 🗂️ Categories
- Create, edit, and delete categories
- Assign custom colors and icons
- Assign articles to multiple categories (many-to-many relationship)
- View articles by category

### ⭐ Favorites
- Add/remove articles from favorites
- Dedicated favorites page for quick access

### 🔍 Search & Filtering
- Search by title, abstract, author, keyword
- Filter by category, publication year, and sort order
- Highlighted search terms in results

### 📊 Dashboard
- Total article, category, favorite, and PDF counts
- Recent articles list
- Recent activity feed

### 📈 Analytics
- Articles per category bar chart
- Publication year distribution
- Upload trend (last 12 months)
- PDF coverage donut chart
- Most used keywords cloud

---

## 🗄️ Database Design

### Tables
- **users** – User accounts with hashed passwords
- **categories** – User-defined categories (one-to-many with users)
- **articles** – Research papers with metadata (one-to-many with users)
- **article_categories** – Many-to-many join table (articles ↔ categories)
- **favorites** – Many-to-many (users ↔ articles)
- **activity_log** – Tracks user actions (create, update, delete)

### SQL Concepts Demonstrated
- `JOIN`, `LEFT JOIN` across multiple tables
- `GROUP BY` with `COUNT` and `GROUP_CONCAT`
- Aggregate functions: `COUNT`, `SUM`, `MAX`
- One-to-many relationships (user → articles, user → categories)
- Many-to-many relationships (articles ↔ categories, users ↔ articles/favorites)
- `FULLTEXT` index for fast text search
- Foreign keys with `ON DELETE CASCADE`
- Unique constraints to prevent duplicates

---

## 📁 Project Structure

```
smart-article-organizer/
├── backend/
│   ├── config/
│   │   └── db.js              # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── upload.js          # Multer PDF upload middleware
│   ├── routes/
│   │   ├── auth.js            # Register, login, logout, profile
│   │   ├── articles.js        # Full CRUD + PDF download
│   │   ├── categories.js      # Full CRUD for categories
│   │   ├── favorites.js       # Add/remove/list favorites
│   │   ├── dashboard.js       # Stats + recent activity
│   │   └── analytics.js       # Charts data
│   ├── uploads/               # Uploaded PDFs (auto-created)
│   ├── server.js              # Express app entry point
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css          # Complete design system
│   ├── js/
│   │   ├── app.js             # Shared utilities (API, toast, modal)
│   │   └── sidebar.js         # Sidebar HTML injection
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── articles.html
│   │   ├── article-form.html  # Add & Edit
│   │   ├── article-view.html
│   │   ├── categories.html
│   │   ├── favorites.html
│   │   ├── search.html
│   │   ├── analytics.html
│   │   └── profile.html
│   ├── index.html             # Login / Register
│   └── 404.html
├── database/
│   └── schema.sql             # Full MySQL schema + sample data
├── .env.example               # Environment variable template
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- **Node.js** v18 or higher → https://nodejs.org
- **MySQL** 8.0 or higher → https://dev.mysql.com/downloads/
- **VS Code** (recommended)

---

### Step 1 — Clone / Extract the Project

Extract the ZIP into a folder, e.g. `smart-article-organizer`.

---

### Step 2 — Set Up the Database

Open MySQL Workbench or your MySQL client and run:

```sql
SOURCE /path/to/smart-article-organizer/database/schema.sql;
```

Or via terminal:
```bash
mysql -u root -p < database/schema.sql
```

This creates the `smart_article_organizer` database with all tables and a demo user.

> **Demo credentials:**  
> Email: `demo@example.com`  
> Password: `Demo@1234`

---

### Step 3 — Configure Environment Variables

```bash
cd backend
cp ../.env.example .env
```

Edit `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=smart_article_organizer

JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRES_IN=7d

COOKIE_SECRET=another_random_secret_key

MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads

FRONTEND_URL=http://localhost:5000
```

---

### Step 4 — Install Dependencies

```bash
cd backend
npm install
```

---

### Step 5 — Run the Application

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

The server starts at: **http://localhost:5000**

---

## 🌐 Application URLs

| Page         | URL                                    |
|--------------|----------------------------------------|
| Login        | http://localhost:5000                  |
| Dashboard    | http://localhost:5000/pages/dashboard.html |
| Articles     | http://localhost:5000/pages/articles.html  |
| Add Article  | http://localhost:5000/pages/article-form.html |
| Categories   | http://localhost:5000/pages/categories.html |
| Favorites    | http://localhost:5000/pages/favorites.html  |
| Search       | http://localhost:5000/pages/search.html     |
| Analytics    | http://localhost:5000/pages/analytics.html  |
| Profile      | http://localhost:5000/pages/profile.html    |

---

## 🔌 REST API Endpoints

### Auth
| Method | Endpoint                  | Description         |
|--------|---------------------------|---------------------|
| POST   | `/api/auth/register`      | Register new user   |
| POST   | `/api/auth/login`         | Login               |
| POST   | `/api/auth/logout`        | Logout              |
| GET    | `/api/auth/me`            | Get current user    |
| PUT    | `/api/auth/profile`       | Update profile      |
| PUT    | `/api/auth/change-password` | Change password   |

### Articles
| Method | Endpoint                       | Description               |
|--------|--------------------------------|---------------------------|
| GET    | `/api/articles`                | List (with filters/search)|
| GET    | `/api/articles/:id`            | Get one article           |
| POST   | `/api/articles`                | Create (with PDF upload)  |
| PUT    | `/api/articles/:id`            | Update (with PDF upload)  |
| DELETE | `/api/articles/:id`            | Delete                    |
| GET    | `/api/articles/:id/download`   | Download PDF              |

### Categories
| Method | Endpoint                | Description     |
|--------|-------------------------|-----------------|
| GET    | `/api/categories`       | List all        |
| POST   | `/api/categories`       | Create          |
| PUT    | `/api/categories/:id`   | Update          |
| DELETE | `/api/categories/:id`   | Delete          |

### Favorites
| Method | Endpoint                     | Description     |
|--------|------------------------------|-----------------|
| GET    | `/api/favorites`             | List favorites  |
| POST   | `/api/favorites/:articleId`  | Add to favorites|
| DELETE | `/api/favorites/:articleId`  | Remove favorite |

### Dashboard & Analytics
| Method | Endpoint           | Description             |
|--------|--------------------|-------------------------|
| GET    | `/api/dashboard`   | Stats + recent activity |
| GET    | `/api/analytics`   | Chart data              |

---

## 📷 Screenshots

The application features:
- **Dark navy theme** with indigo accent colors and glass-morphism inspired cards
- **Responsive layout** with collapsible sidebar on mobile
- **Smooth animations** on page load and interactions
- **Toast notifications** for all actions
- **Drag-and-drop** PDF upload
- **Keyword chip inputs** for easy tag management

---

## 🎓 Academic Notes

This project demonstrates:
1. **MVC Architecture** – Routes (Controller), MySQL queries (Model), HTML pages (View)
2. **RESTful API Design** – Proper HTTP methods and status codes
3. **Database Normalization** – 3NF schema with proper relationships
4. **Security Best Practices** – Password hashing, JWT, HTTP-only cookies, input validation
5. **File Handling** – Secure PDF upload with type and size validation
6. **Pagination** – Server-side pagination for large datasets
7. **Full-text Search** – MySQL FULLTEXT index for fast article search

---

## 📦 Dependencies

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

*Built with ❤️ for academic research management*
