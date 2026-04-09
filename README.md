# 🍽️ Yelp Prototype  
### Full Stack Restaurant Discovery Platform (FastAPI + React + AI)

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?logo=react">
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?logo=fastapi">
  <img src="https://img.shields.io/badge/Database-MySQL-orange?logo=mysql">
  <img src="https://img.shields.io/badge/Status-Active-success">
</p>

---

##  Overview

This project is a full-stack Yelp-style restaurant discovery and review platform.  
It allows users to search restaurants, write reviews, manage preferences, and interact with an AI assistant for personalized recommendations.

The system supports two main roles:
-  Users (Reviewers)
-  Restaurant Owners

---

##  Features

###  User Features
- Signup and login (JWT authentication)  
- Profile management  
- Set dining preferences  
- Search restaurants (name, cuisine, keywords, location)  
- Add restaurants  
- Write, edit, and delete reviews  
- Favorites and history tracking  
- AI chatbot for recommendations  

---

###  Owner Features
- Owner signup and login  
- Manage restaurant listings  
- View customer reviews  
- Basic dashboard  

---

###  AI Assistant
- Conversational chatbot  
- Uses user preferences  
- Supports natural queries like:
  - “Find dinner near me”
  - “Romantic place”
  - “Vegan options”

---

##  Tech Stack

Frontend:
- React (Vite)
- Axios

Backend:
- FastAPI (Python)
- SQLAlchemy

Database:
- MySQL

AI:
- LangChain (optional)
- OpenAI API (optional)

---

##  Project Setup

### 1. Clone Repository
    git clone <your-repo-url>
    cd <repo-name>

---

##  Backend Setup

### Navigate to backend
    cd backend

### Create virtual environment
    python3 -m venv venv
    source venv/bin/activate

### Install dependencies
    pip install -r requirements.txt
    pip install cryptography

---

### Create .env file inside backend

    DB_HOST=localhost
    DB_PORT=3306
    DB_USER=labuser
    DB_PASSWORD=StrongPass123!
    DB_NAME=labfinal_db

    JWT_SECRET=your-secret-key
    JWT_ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=60

    OPENAI_API_KEY=

---

### Setup MySQL

    CREATE DATABASE labfinal_db;

    CREATE USER 'labuser'@'localhost' IDENTIFIED BY 'StrongPass123!';
    GRANT ALL PRIVILEGES ON labfinal_db.* TO 'labuser'@'localhost';

    FLUSH PRIVILEGES;

---

### Run backend
    python -m uvicorn app.main:app --reload

Backend runs at:
    http://127.0.0.1:8000

---

##  Frontend Setup

### Navigate to frontend
    cd frontend

### Install dependencies
    rm -rf node_modules package-lock.json
    npm install

### Run frontend
    npm run dev

Frontend runs at:
    http://localhost:5173

---

##  API Documentation

Swagger UI:
    http://127.0.0.1:8000/docs

---

##  Application Flow

    User → React Frontend → FastAPI Backend → MySQL
                                   ↓
                             AI Assistant

---

## 📁 Project Structure

    project/
    │── backend/
    │   ├── app/
    │   ├── requirements.txt
    │
    │── frontend/
    │   ├── src/
    │   ├── package.json

---

##  Important Notes

Do NOT commit:

    node_modules/
    venv/
    .env
    dist/

If something breaks:

    rm -rf node_modules package-lock.json
    npm install

    deactivate
    source venv/bin/activate

---

##  Common Issues

| Issue | Solution |
|------|---------|
| Backend not starting | Check MySQL connection |
| Access denied MySQL | Verify DB credentials |
| npm errors | Reinstall dependencies |
| API not working | Ensure backend is running |

---

##  Future Improvements

- Better UI/UX design  
- Advanced filtering  
- Real-time updates  
- Improved AI recommendations  

---

##  Author

Prerana Ramesh and Elsa Rose

