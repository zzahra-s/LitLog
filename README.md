# LitLog — Personal Reading Tracker & Habit Visualizer

## Description
LitLog is a desktop web application that helps users manage their entire 
reading journey in one place. Users can add books, organize them across 
four shelves (Currently Reading, Want to Read, Finished, Did Not Finish), 
write personal notes, set reading goals, track progress, and receive 
book recommendations — all stored in a local SQL Server database.

## Team Members
- Khadija Faiz 24L-2554 :Scrum Master
- Zahra Saeed 24L-2512 :Backend Developer
- Romaisa Sajjad 24L-2608 :Frontend Developer

## Tech Stack
- Frontend: HTML / CSS / JavaScript
- Backend: C# / ASP.NET
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
[add your setup steps here]
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
Sprint 1 — Iteration 1 (March 8 – March 22, 2025)
- Module 1: User Authentication & Book Entry
- Module 2: Bookshelf & Search
