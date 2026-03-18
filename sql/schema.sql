-- schema.sql
-- Idempotente y ordenado: crea tablas solo si no existen.
-- Ejecutar en la base de datos objetivo: USE LaSanteDb;

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'dbo')
    EXEC('CREATE SCHEMA dbo');
GO

-- -------------------------
-- Categories
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Categories' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.Categories (
  CategoryID INT IDENTITY PRIMARY KEY,
  Slug NVARCHAR(80) UNIQUE NOT NULL,
  Name NVARCHAR(120) NOT NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
END
GO

-- -------------------------
-- Molecules
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Molecules' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.Molecules (
  MoleculeID INT IDENTITY PRIMARY KEY,
  Name NVARCHAR(120) NOT NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
END
GO

-- -------------------------
-- Products (debe crearse antes de ProductTags y triggers)
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Products' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.Products (
  ProductID INT IDENTITY PRIMARY KEY,
  Name NVARCHAR(180) NOT NULL,
  SKU NVARCHAR(100) NULL,
  CategoryID INT NOT NULL,
  MoleculeID INT NULL,
  Summary NVARCHAR(600) NULL,
  Excerpt NVARCHAR(600) NULL,
  Description NVARCHAR(MAX) NULL,
  SpecPDFUrl NVARCHAR(300) NULL,
  ImageUrl NVARCHAR(300) NULL,
  TagsJson NVARCHAR(MAX) NULL,
  Price DECIMAL(10,2) NULL CHECK (Price >= 0),
  IsActive BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryID) REFERENCES dbo.Categories(CategoryID) ON DELETE NO ACTION,
  CONSTRAINT FK_Products_Molecules FOREIGN KEY (MoleculeID) REFERENCES dbo.Molecules(MoleculeID) ON DELETE SET NULL
);
CREATE INDEX IX_Products_Name ON dbo.Products(Name);
CREATE INDEX IX_Products_IsActive ON dbo.Products(IsActive);
END
GO

-- -------------------------
-- Banners
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Banners' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.Banners (
  BannerID INT IDENTITY PRIMARY KEY,
  Title NVARCHAR(200) NULL,
  ImageUrl NVARCHAR(500) NULL,
  LinkUrl NVARCHAR(500) NULL,
  IsActive BIT NOT NULL DEFAULT 1,
  [Order] INT NOT NULL DEFAULT 0,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
END
GO

-- -------------------------
-- News
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'News' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.News (
  NewsID INT IDENTITY PRIMARY KEY,
  Title NVARCHAR(200) NOT NULL,
  Slug NVARCHAR(160) UNIQUE NOT NULL,
  Excerpt NVARCHAR(1000) NULL,
  Body NVARCHAR(MAX) NOT NULL,
  CoverImageUrl NVARCHAR(300) NULL,
  Author NVARCHAR(200) NULL,
  Category NVARCHAR(120) NULL,
  TagsJson NVARCHAR(MAX) NULL,
  PublishedAt DATETIME2 NULL,
  IsPublished BIT NOT NULL DEFAULT 0,
  IsActive BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_News_Slug ON dbo.News(Slug);
CREATE INDEX IX_News_IsPublished ON dbo.News(IsPublished);
END
GO

-- -------------------------
-- JobPostings
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'JobPostings' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.JobPostings (
  JobID INT IDENTITY PRIMARY KEY,
  Title NVARCHAR(180) NOT NULL,
  Location NVARCHAR(120) NULL,
  Area NVARCHAR(120) NULL,
  Type NVARCHAR(80) NULL,
  Level NVARCHAR(80) NULL,
  ShortDescription NVARCHAR(1000) NULL,
  Body NVARCHAR(MAX) NOT NULL,
  CoverImageUrl NVARCHAR(300) NULL,
  PublishedAt DATETIME2 NULL,
  IsPublished BIT NOT NULL DEFAULT 0,
  IsActive BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Jobs_IsPublished ON dbo.JobPostings(IsPublished);
END
GO

-- -------------------------
-- Applications (depende de JobPostings)
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Applications' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.Applications (
  ApplicationID INT IDENTITY PRIMARY KEY,
  JobID INT NULL,
  JobTitle NVARCHAR(160) NOT NULL,
  Location NVARCHAR(120) NULL,
  ApplicantName NVARCHAR(180) NOT NULL,
  ApplicantEmail NVARCHAR(180) NOT NULL,
  CvUrl NVARCHAR(500) NULL,
  Message NVARCHAR(MAX) NULL,
  SentAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_Applications_Job FOREIGN KEY (JobID) REFERENCES dbo.JobPostings(JobID) ON DELETE SET NULL
);
END
GO

-- -------------------------
-- ContactMessages
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'ContactMessages' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.ContactMessages (
  MessageID INT IDENTITY PRIMARY KEY,
  Name NVARCHAR(180) NOT NULL,
  Email NVARCHAR(180) NOT NULL,
  Body NVARCHAR(1200) NOT NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
END
GO

-- -------------------------
-- Users
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'Users' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.Users (
  UserID INT IDENTITY PRIMARY KEY,
  Email NVARCHAR(180) UNIQUE NOT NULL,
  PasswordHash NVARCHAR(512) NOT NULL,
  Role NVARCHAR(40) NOT NULL DEFAULT 'viewer',
  IsActive BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
END
GO

-- -------------------------
-- ProductTags (normalized tags) - after Products
-- -------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.tables t JOIN sys.schemas s ON t.schema_id = s.schema_id
    WHERE t.name = 'ProductTags' AND s.name = 'dbo')
BEGIN
CREATE TABLE dbo.ProductTags (
  ProductTagID INT IDENTITY PRIMARY KEY,
  ProductID INT NOT NULL,
  Tag NVARCHAR(120) NOT NULL,
  CONSTRAINT FK_ProductTags_Product FOREIGN KEY (ProductID) REFERENCES dbo.Products(ProductID) ON DELETE CASCADE
);
CREATE INDEX IX_ProductTags_Tag ON dbo.ProductTags(Tag);
END
GO

-- -------------------------
-- Triggers to maintain UpdatedAt (creados después de las tablas)
-- -------------------------
-- Categories trigger
IF OBJECT_ID('dbo.trg_Categories_UpdateUpdatedAt', 'TR') IS NULL
BEGIN
EXEC('
CREATE TRIGGER dbo.trg_Categories_UpdateUpdatedAt
ON dbo.Categories
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Categories
  SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Categories c
  JOIN inserted i ON c.CategoryID = i.CategoryID;
END
');
END
GO

-- Molecules trigger
IF OBJECT_ID('dbo.trg_Molecules_UpdateUpdatedAt', 'TR') IS NULL
BEGIN
EXEC('
CREATE TRIGGER dbo.trg_Molecules_UpdateUpdatedAt
ON dbo.Molecules
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Molecules
  SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Molecules m
  JOIN inserted i ON m.MoleculeID = i.MoleculeID;
END
');
END
GO

-- Products trigger
IF OBJECT_ID('dbo.trg_Products_UpdateUpdatedAt', 'TR') IS NULL
BEGIN
EXEC('
CREATE TRIGGER dbo.trg_Products_UpdateUpdatedAt
ON dbo.Products
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Products
  SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Products p
  JOIN inserted i ON p.ProductID = i.ProductID;
END
');
END
GO

-- Banners trigger
IF OBJECT_ID('dbo.trg_Banners_UpdateUpdatedAt', 'TR') IS NULL
BEGIN
EXEC('
CREATE TRIGGER dbo.trg_Banners_UpdateUpdatedAt
ON dbo.Banners
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Banners
  SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Banners b
  JOIN inserted i ON b.BannerID = i.BannerID;
END
');
END
GO

-- News trigger
IF OBJECT_ID('dbo.trg_News_UpdateUpdatedAt', 'TR') IS NULL
BEGIN
EXEC('
CREATE TRIGGER dbo.trg_News_UpdateUpdatedAt
ON dbo.News
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.News
  SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.News n
  JOIN inserted i ON n.NewsID = i.NewsID;
END
');
END
GO

-- JobPostings trigger
IF OBJECT_ID('dbo.trg_JobPostings_UpdateUpdatedAt', 'TR') IS NULL
BEGIN
EXEC('
CREATE TRIGGER dbo.trg_JobPostings_UpdateUpdatedAt
ON dbo.JobPostings
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.JobPostings
  SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.JobPostings j
  JOIN inserted i ON j.JobID = i.JobID;
END
');
END
GO

-- Users trigger
IF OBJECT_ID('dbo.trg_Users_UpdateUpdatedAt', 'TR') IS NULL
BEGIN
EXEC('
CREATE TRIGGER dbo.trg_Users_UpdateUpdatedAt
ON dbo.Users
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.Users
  SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Users u
  JOIN inserted i ON u.UserID = i.UserID;
END
');
END
GO

-- -------------------------
-- Ensure indexes exist (idempotente)
-- -------------------------
IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name='Products' AND i.name='IX_Products_Name')
BEGIN
    CREATE INDEX IX_Products_Name ON dbo.Products(Name);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name='Products' AND i.name='IX_Products_IsActive')
BEGIN
    CREATE INDEX IX_Products_IsActive ON dbo.Products(IsActive);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name='News' AND i.name='IX_News_Slug')
BEGIN
    CREATE INDEX IX_News_Slug ON dbo.News(Slug);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name='News' AND i.name='IX_News_IsPublished')
BEGIN
    CREATE INDEX IX_News_IsPublished ON dbo.News(IsPublished);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes i JOIN sys.tables t ON i.object_id = t.object_id WHERE t.name='JobPostings' AND i.name='IX_Jobs_IsPublished')
BEGIN
    CREATE INDEX IX_Jobs_IsPublished ON dbo.JobPostings(IsPublished);
END
GO

-- End of schema
