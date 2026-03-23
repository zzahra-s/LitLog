USE LitLog;

INSERT INTO Users (Username, Email, PasswordHash)
VALUES ('ali_reads', 'ali@example.com', 'testpassword123');

INSERT INTO Books (UserID, Title, Author, GenreID, PublicationYear, TotalPages)
VALUES (1, 'Dune', 'Frank Herbert', 3, 1965, 412);

INSERT INTO Books (UserID, Title, Author, GenreID, PublicationYear, TotalPages)
VALUES (1, 'Atomic Habits', 'James Clear', 10, 2018, 320);

INSERT INTO UserBooks (UserID, BookID, StatusID, Rating, PagesRead, DateFinished)
VALUES (1, 1, 3, 5, 412, '2025-03-15');

INSERT INTO UserBooks (UserID, BookID, StatusID, PagesRead)
VALUES (1, 2, 1, 150);

INSERT INTO ReadingGoals (UserID, GoalType, TargetYear, BooksTarget)
VALUES (1, 'Yearly', 2025, 20);