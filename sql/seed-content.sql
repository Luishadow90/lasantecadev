-- seed-content.sql (alineado con schema.sql)
USE LaSanteDb;
GO

BEGIN TRANSACTION;

-- News (artículos / posts)
INSERT INTO News (Title, Slug, Body, CoverImageUrl, PublishedAt, IsPublished, IsActive, CreatedAt, UpdatedAt)
VALUES
('Nueva alianza regional',
 'nueva-alianza-regional',
 'La Santé fortalece su presencia regional con una alianza estratégica orientada a mejorar el acceso a medicamentos esenciales.',
 'assets/img/news/news-1.svg',
 SYSUTCDATETIME(),
 1,
 1,
 SYSUTCDATETIME(),
 SYSUTCDATETIME()
),
('Actualización de portafolio',
 'actualizacion-portafolio',
 'Se incorporan nuevas presentaciones y guías de uso para profesionales de la salud, reforzando la disponibilidad por especialidad.',
 'assets/img/news/news-2.svg',
 DATEADD(day,-7,SYSUTCDATETIME()),
 1,
 1,
 DATEADD(day,-7,SYSUTCDATETIME()),
 SYSUTCDATETIME()
);

-- JobPostings (vacantes)
INSERT INTO JobPostings (Title, Location, Area, Type, Body, CoverImageUrl, PublishedAt, IsPublished, IsActive, CreatedAt, UpdatedAt)
VALUES
('Representante Médico',
 'Guatemala · Ciudad de Guatemala',
 'Comercial',
 'Full time',
 'Buscamos talento comercial con enfoque en servicio, ética e integridad. Experiencia en visita médica deseable.',
 'assets/img/jobs/job-1.svg',
 SYSUTCDATETIME(),
 1,
 1,
 SYSUTCDATETIME(),
 SYSUTCDATETIME()
),
('Analista de Calidad',
 'Costa Rica · San José',
 'Calidad',
 'Full time',
 'Perfil orientado a la mejora continua y cumplimiento regulatorio. Conocimiento en procesos de calidad y documentación.',
 'assets/img/jobs/job-2.svg',
 DATEADD(day,-14,SYSUTCDATETIME()),
 1,
 1,
 DATEADD(day,-14,SYSUTCDATETIME()),
 SYSUTCDATETIME()
);

-- Banners (hero)
INSERT INTO Banners (Title, ImageUrl, LinkUrl, IsActive, [Order], CreatedAt, UpdatedAt)
VALUES
('Campaña Bienestar 2026', 'assets/img/banners/banner-1.jpg', '/campanas/bienestar', 1, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
('Lanzamiento Producto X', 'assets/img/banners/banner-2.jpg', '/productos/x', 1, 2, SYSUTCDATETIME(), SYSUTCDATETIME());

-- Products (ejemplos mínimos)
INSERT INTO Categories (Slug, Name, CreatedAt, UpdatedAt) VALUES ('analgesicos','Analgésicos', SYSUTCDATETIME(), SYSUTCDATETIME());
DECLARE @catId INT = (SELECT TOP 1 CategoryID FROM Categories WHERE Slug = 'analgesicos');

INSERT INTO Products (Name, SKU, CategoryID, Summary, Excerpt, Description, ImageUrl, Price, IsActive, CreatedAt, UpdatedAt)
VALUES
('Acetaminofén 500 mg', 'ACET-500', @catId, 'Analgésico de uso general', 'Alivio del dolor y reducción de fiebre', 'Descripción completa del producto Acetaminofén 500 mg.', 'assets/img/products/acetaminofen.png', 4.99, 1, SYSUTCDATETIME(), SYSUTCDATETIME()),
('Ibuprofeno 400 mg', 'IBUP-400', @catId, 'Antiinflamatorio y analgésico', 'Uso para dolor e inflamación', 'Descripción completa del producto Ibuprofeno 400 mg.', 'assets/img/products/ibuprofeno.png', 6.50, 1, SYSUTCDATETIME(), SYSUTCDATETIME());

COMMIT TRANSACTION;
GO
