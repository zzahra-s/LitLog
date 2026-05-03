CREATE DATABASE LitLog;
GO
USE LitLog;
GO

CREATE TABLE Users (
    UserID    INT IDENTITY(1,1) PRIMARY KEY,
    Username  NVARCHAR(50)  NOT NULL UNIQUE,
    Email     NVARCHAR(100) NOT NULL UNIQUE,
    Password  NVARCHAR(255) NOT NULL,  
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Books (
    BookID      INT IDENTITY(1,1) PRIMARY KEY,
    UserID      INT NOT NULL,
    Title       NVARCHAR(200) NOT NULL,
    Author      NVARCHAR(100),
    Genre       NVARCHAR(50),
    TotalPages  INT,
    YearPublished INT,
    Status      NVARCHAR(30) CHECK (Status IN (
                    'Currently Reading',
                    'Want to Read',
                    'Finished',
                    'Did Not Finish'
                )) DEFAULT 'Want to Read',
    AddedAt     DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Ratings (
    RatingID   INT IDENTITY(1,1) PRIMARY KEY,
    BookID     INT NOT NULL,
    UserID     INT NOT NULL,
    Stars      TINYINT CHECK (Stars BETWEEN 1 AND 5),
    RatedAt    DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Notes (
    NoteID      INT IDENTITY(1,1) PRIMARY KEY,
    BookID      INT NOT NULL,
    UserID      INT NOT NULL,
    NoteText    NVARCHAR(MAX),
    UpdatedAt   DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Summaries (
    SummaryID    INT IDENTITY(1,1) PRIMARY KEY,
    BookID       INT NOT NULL,
    UserID       INT NOT NULL,
    SummaryText  NVARCHAR(MAX),
    UpdatedAt    DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE ReadingProgress (
    ProgressID   INT IDENTITY(1,1) PRIMARY KEY,
    BookID       INT NOT NULL,
    UserID       INT NOT NULL,
    PagesRead    INT NOT NULL CHECK (PagesRead >= 0),
    LoggedAt     DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE ReadingGoals (
    GoalID       INT IDENTITY(1,1) PRIMARY KEY,
    UserID       INT NOT NULL,
    TargetBooks  INT NOT NULL CHECK (TargetBooks >= 1),
    StartDate    DATE NOT NULL,
    Deadline     DATE NOT NULL,
    CreatedAt    DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
