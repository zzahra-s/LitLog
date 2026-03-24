# LitLog — Personal Reading Tracker & Habit Visualizer

## Description
LitLog is a desktop web application that helps users manage their entire 
reading journey in one place. Users can add books, organize them across 
four shelves (Currently Reading, Want to Read, Finished, Did Not Finish), 
write personal notes, set reading goals, track progress, and receive 
book recommendations all stored in a local SQL Server database.

## Team Members
- Khadija Faiz 24L-2554 :Scrum Master
- Zahra Saeed 24L-2512 :Backend Developer
- Romaisa Sajjad 24L-2608 :Frontend Developer

## Tech Stack
- Frontend: React
- Backend: Node.js, Express.js
- Database: SQL Server

## Project Structure
```
litlog/
├── backend/
├── frontend/
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── erd.png
├── docs/
│   └── Iteration_1.docx
├── README.md
└── .gitignore
```

## How to Run

### Database Setup
1. Open SQL Server Management Studio (SSMS)
2. Run `database/schema.sql` to create all tables
3. Run `database/seed.sql` to insert sample data

### Backend
```
cd backend
## How to Run

### Prerequisites
Make sure you have these installed before starting:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
---
### 1. Database (Docker)

Start Docker Desktop, then run:

docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
  -p 1433:1433 --name litlog-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest

Wait 30 seconds for SQL Server to start, then create the database and run the schema
---

### 2. Backend

cd backend
npm install

Create a .env file inside the backend/ folder (use .env.example as a template):
DB_USER=sa
DB_PASSWORD=YourPassword123!
DB_SERVER=localhost
DB_NAME=LitLog
PORT=5001
```

Start the server:

node server.js

You should see:

Server running on http://localhost:5001
Connected to SQL Server

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register a new user |
| POST | /auth/login | Login |
| POST | /books | Add a book |
| GET | /books/:userID | Get all books for a user |
| PUT | /books/:id | Update a book |
| DELETE | /books/:id | Delete a book |
| GET | /books/search?q=...&userID=... | Search books |
| GET | /books/filter?genre=...&userID=... | Filter by genre |
| GET | /books/filter?status=...&userID=... | Filter by status |
```

### Frontend
```
cd frontend
[add your setup steps here]
```

## Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```
DB_SERVER=localhost
DB_NAME=LitLog
DB_USER=your_username
DB_PASSWORD=your_password
```

## Current Sprint
Sprint 1 — Iteration 1 (March 8 – March 22, 2026)
- Module 1: User Authentication & Book Entry
- Module 2: Bookshelf & Search
