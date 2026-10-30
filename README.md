# 🌱 BenefitFind

### Discover Government Schemes You're Eligible For

BenefitFind is a full-stack web application that helps users discover relevant government schemes based on their personal profiles and eligibility criteria.

## 🎯 Problem Statement

Many citizens miss government welfare schemes because they are unaware of available benefits or find it difficult to understand eligibility requirements.

## 💡 Our Solution

BenefitFind provides a centralized platform where users can create profiles, explore government schemes and discover benefits matching their eligibility.

## ✨ Key Features

- User registration and authentication
- Admin login and access control
- User profile management
- Government scheme management
- Scheme eligibility matching
- Browse available government schemes
- Admin dashboard

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Angular 21 | Frontend |
| TypeScript | Frontend programming |
| HTML & CSS | UI development |
| Node.js | Backend runtime |
| Express.js 5 | REST API |
| MongoDB | Database |
| Mongoose | Database integration |
| JWT | Authentication support |

## 🏗️ Architecture

The application follows a client-server architecture.

- Angular handles the user interface.
- Express.js provides backend API endpoints.
- MongoDB stores application data.
- Mongoose manages database interactions.

## 📁 Project Structure

```text
BenefitFind/
│
├── frontend/          # Angular application
│   ├── public/
│   └── src/
│
├── middleware/        # Backend middleware
├── models/            # MongoDB models
├── public/            # Public backend assets
├── routes/            # API routes
│
├── createAdmin.js     # Admin creation script
├── seedSampleSchemes.js
├── server.js          # Backend entry point
├── package.json
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/dhanushap1/BenefitFind.git
cd BenefitFind
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Use your own MongoDB connection string. Never commit real credentials.

### 4. Build the Angular frontend

```bash
npm run build
```

### 5. Start the application

```bash
npm start
```

Open:

```text
http://localhost:5000
```

## 🔗 API Routes

| Route | Purpose |
|---|---|
| `/api/users` | User operations |
| `/api/schemes` | Government scheme operations |
| `/api/admin` | Admin operations |
| `/api/test` | API connectivity test |

## 🚀 Future Enhancements

- Advanced scheme recommendation
- Integration of additional government schemes
- Improved eligibility matching
- Enhanced accessibility and user experience

## 👩‍💻 Developer

**Dhanusha P**

[GitHub Profile](https://github.com/dhanushap1)

---

*Built to make government welfare schemes easier to discover and access.*
