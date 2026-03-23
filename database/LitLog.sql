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