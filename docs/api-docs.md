# API Endpoints

## Authentication

| Method | Endpoint         | Description              |
|--------|-----------------|--------------------------|
| POST   | /auth/register  | Register a new user      |
| POST   | /auth/login     | Login                    |

## Books

| Method | Endpoint                                 | Description                     |
|--------|------------------------------------------|---------------------------------|
| POST   | /books                                   | Add a book                      |
| GET    | /books/:userID                           | Get all books for a user        |
| PUT    | /books/:id                               | Update a book                   |
| DELETE | /books/:id                               | Delete a book                   |
| GET    | /books/search?q=...&userID=...           | Search books                    |
| GET    | /books/filter?genre=...&userID=...       | Filter books by genre           |
| GET    | /books/filter?status=...&userID=...      | Filter books by status          |
