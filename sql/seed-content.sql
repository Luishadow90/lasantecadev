-- seed-content.sql
-- Idempotente: inserta o actualiza contenido demo sin duplicados.
-- Ejecutar en la base de datos objetivo: USE LaSanteDb;
USE LaSanteDb;
GO

BEGIN TRANSACTION;
SET XACT_ABORT ON;
GO

-- 1) Categories (asegura existencia)
MERGE dbo.Categories AS target
USING (VALUES
  ('analgesicos','Analgésicos')
) AS src(Slug, Name)
ON target.Slug = src.Slug
WHEN MATCHED THEN
  UPDATE SET Name = src.Name, UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (Slug, Name, CreatedAt, UpdatedAt)
  VALUES (src.Slug, src.Name, SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- 2) News (artículos / posts) - MERGE por Slug
MERGE dbo.News AS target
USING (VALUES
  ('nueva-alianza-regional','Nueva alianza regional',
   'La Santé fortalece su presencia regional con una alianza estratégica orientada a mejorar el acceso a medicamentos esenciales.',
   'assets/img/news/news-1.svg', SYSUTCDATETIME(), 1, 1),
  ('actualizacion-portafolio','Actualización de portafolio',
   'Se incorporan nuevas presentaciones y guías de uso para profesionales de la salud, reforzando la disponibilidad por especialidad.',
   'assets/img/news/news-2.svg', DATEADD(day,-7,SYSUTCDATETIME()), 1, 1)
) AS src(Slug, Title, Body, CoverImageUrl, PublishedAt, IsPublished, IsActive)
ON target.Slug = src.Slug
WHEN MATCHED THEN
  UPDATE SET Title = src.Title, Body = src.Body, CoverImageUrl = src.CoverImageUrl,
             PublishedAt = src.PublishedAt, IsPublished = src.IsPublished, IsActive = src.IsActive,
             UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (Title, Slug, Body, CoverImageUrl, PublishedAt, IsPublished, IsActive, CreatedAt, UpdatedAt)
  VALUES (src.Title, src.Slug, src.Body, src.CoverImageUrl, src.PublishedAt, src.IsPublished, src.IsActive, SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- 3) JobPostings (vacantes) - MERGE por Title + Location (combinación)
MERGE dbo.JobPostings AS target
USING (VALUES
  ('Representante Médico','Guatemala · Ciudad de Guatemala','Comercial','Full time',
   'Buscamos talento comercial con enfoque en servicio, ética e integridad. Experiencia en visita médica deseable.',
   'assets/img/jobs/job-1.svg', SYSUTCDATETIME(), 1, 1),
  ('Analista de Calidad','Costa Rica · San José','Calidad','Full time',
   'Perfil orientado a la mejora continua y cumplimiento regulatorio. Conocimiento en procesos de calidad y documentación.',
   'assets/img/jobs/job-2.svg', DATEADD(day,-14,SYSUTCDATETIME()), 1, 1)
) AS src(Title, Location, Area, Type, Body, CoverImageUrl, PublishedAt, IsPublished, IsActive)
ON target.Title = src.Title AND ISNULL(target.Location,'') = ISNULL(src.Location,'')
WHEN MATCHED THEN
  UPDATE SET Area = src.Area, Type = src.Type, Body = src.Body, CoverImageUrl = src.CoverImageUrl,
             PublishedAt = src.PublishedAt, IsPublished = src.IsPublished, IsActive = src.IsActive,
             UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (Title, Location, Area, Type, ShortDescription, Body, CoverImageUrl, PublishedAt, IsPublished, IsActive, CreatedAt, UpdatedAt)
  VALUES (src.Title, src.Location, src.Area, src.Type, LEFT(src.Body,1000), src.Body, src.CoverImageUrl, src.PublishedAt, src.IsPublished, src.IsActive, SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- 4) Banners (hero) - MERGE por Title
MERGE dbo.Banners AS target
USING (VALUES
  ('Campaña Bienestar 2026','assets/img/banners/banner-1.jpg','/campanas/bienestar',1,1),
  ('Lanzamiento Producto X','assets/img/banners/banner-2.jpg','/productos/x',1,2)
) AS src(Title, ImageUrl, LinkUrl, IsActive, [Order])
ON target.Title = src.Title
WHEN MATCHED THEN
  UPDATE SET ImageUrl = src.ImageUrl, LinkUrl = src.LinkUrl, IsActive = src.IsActive, [Order] = src.[Order], UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (Title, ImageUrl, LinkUrl, IsActive, [Order], CreatedAt, UpdatedAt)
  VALUES (src.Title, src.ImageUrl, src.LinkUrl, src.IsActive, src.[Order], SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- 5) Products (asegura categoría y MERGE por SKU)
-- Obtener CategoryID para 'analgesicos'
DECLARE @AnalgesicosId INT = (SELECT TOP 1 CategoryID FROM dbo.Categories WHERE Slug = 'analgesicos');

-- Si por alguna razón no existe, crearla (defensa)
IF @AnalgesicosId IS NULL
BEGIN
  INSERT INTO dbo.Categories (Slug, Name, CreatedAt, UpdatedAt)
  VALUES ('analgesicos','Analgésicos', SYSUTCDATETIME(), SYSUTCDATETIME());
  SET @AnalgesicosId = SCOPE_IDENTITY();
END

MERGE dbo.Products AS target
USING (VALUES
  ('ACET-500','Acetaminofén 500 mg', @AnalgesicosId, 'Analgésico de uso general', 'Alivio del dolor y reducción de fiebre', 'Descripción completa del producto Acetaminofén 500 mg.', 'assets/img/products/acetaminofen.png', 4.99, 1),
  ('IBUP-400','Ibuprofeno 400 mg', @AnalgesicosId, 'Antiinflamatorio y analgésico', 'Uso para dolor e inflamación', 'Descripción completa del producto Ibuprofeno 400 mg.', 'assets/img/products/ibuprofeno.png', 6.50, 1)
) AS src(SKU, Name, CategoryID, Summary, Excerpt, Description, ImageUrl, Price, IsActive)
ON target.SKU = src.SKU
WHEN MATCHED THEN
  UPDATE SET Name = src.Name, CategoryID = src.CategoryID, Summary = src.Summary, Excerpt = src.Excerpt,
             Description = src.Description, ImageUrl = src.ImageUrl, Price = src.Price, IsActive = src.IsActive,
             UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (Name, SKU, CategoryID, Summary, Excerpt, Description, ImageUrl, Price, IsActive, CreatedAt, UpdatedAt)
  VALUES (src.Name, src.SKU, src.CategoryID, src.Summary, src.Excerpt, src.Description, src.ImageUrl, src.Price, src.IsActive, SYSUTCDATETIME(), SYSUTCDATETIME());
GO

COMMIT TRANSACTION;
GO

-- Verificaciones rápidas (ejecutar después de aplicar el seed)
-- SELECT TOP 10 * FROM dbo.News ORDER BY PublishedAt DESC;
-- SELECT TOP 10 * FROM dbo.JobPostings ORDER BY PublishedAt DESC;
-- SELECT TOP 10 * FROM dbo.Banners ORDER BY [Order];
-- SELECT TOP 10 ProductID, Name, SKU, Price FROM dbo.Products;
