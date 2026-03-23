CREATE DATABASE LitLog;
GO
USE LitLog;
GO

CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50)  NOT NULL UNIQUE,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(256) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE ReadingStatuses (
    StatusID INT PRIMARY KEY IDENTITY(1,1),
    StatusName NVARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO ReadingStatuses (StatusName) VALUES
('Currently Reading'),
('Want to Read'),
('Finished'),
('Did Not Finish');

CREATE TABLE Genres (
    GenreID INT PRIMARY KEY IDENTITY(1,1),
    GenreName NVARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO Genres (GenreName) VALUES
('Fiction'), ('Non-Fiction'), ('Science Fiction'),
('Fantasy'), ('Mystery'), ('Thriller'),
('Romance'), ('Historical Fiction'), ('Biography'),
('Self-Help'), ('Horror'), ('Poetry'),
('Graphic Novel'), ('Young Adult'), ('Children'),
('Classic'), ('Science'), ('Philosophy'),
('Travel'), ('Humor');

CREATE TABLE Books (
    BookID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Author NVARCHAR(150) NOT NULL,
    GenreID INT NULL,
    PublicationYear INT NULL,
    TotalPages INT  NULL,
    CoverImageURL NVARCHAR(500) NULL,
    ISBN NVARCHAR(20)  NULL,
    OfficialSummary NVARCHAR(MAX) NULL,
    AddedAt DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (GenreID) REFERENCES Genres(GenreID) ON DELETE SET NULL
);

CREATE TABLE UserBooks (
    UserBookID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    BookID INT NOT NULL,
    StatusID INT NOT NULL,
    Rating TINYINT NULL CHECK (Rating BETWEEN 1 AND 5),
    PagesRead INT NOT NULL DEFAULT 0,
    PersonalNote NVARCHAR(MAX) NULL,
    OwnSummary NVARCHAR(MAX) NULL,
    DateStarted DATE NULL,
    DateFinished DATE NULL,
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (BookID) REFERENCES Books(BookID),
    FOREIGN KEY (StatusID) REFERENCES ReadingStatuses(StatusID),
    UNIQUE (UserID, BookID)
);

CREATE TABLE ReadingGoals (
    GoalID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    GoalType NVARCHAR(10) NOT NULL CHECK (GoalType IN ('Monthly', 'Yearly')),
    TargetYear INT NOT NULL,
    TargetMonth TINYINT NULL CHECK (TargetMonth BETWEEN 1 AND 12),
    BooksTarget INT NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    UNIQUE (UserID, GoalType, TargetYear, TargetMonth)
);

CREATE TABLE Recommendations (
    RecommendationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    Title NVARCHAR(255) NOT NULL,
    Author NVARCHAR(150) NOT NULL,
    GenreID INT NULL,
    OfficialSummary NVARCHAR(MAX) NULL,
    CoverImageURL NVARCHAR(500) NULL,
    ReasonTag NVARCHAR(100) NULL,
    IsAddedToLibrary BIT NOT NULL DEFAULT 0,
    GeneratedAt DATETIME NOT NULL DEFAULT GETDATE(),

    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (GenreID) REFERENCES Genres(GenreID) ON DELETE SET NULL
);

CREATE INDEX IX_Books_UserID ON Books(UserID);
CREATE INDEX IX_Books_Author ON Books(Author);
CREATE INDEX IX_UserBooks_UserID ON UserBooks(UserID);
CREATE INDEX IX_UserBooks_StatusID ON UserBooks(StatusID);