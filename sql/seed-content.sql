-- Demo content (published)
INSERT INTO News (Title, Slug, Body, CoverImageUrl, PublishedAt, IsPublished) VALUES
('Nueva alianza regional', 'nueva-alianza-regional',
 'La Santé fortalece su presencia regional con una alianza estratégica orientada a mejorar el acceso a medicamentos esenciales.',
 'assets/img/news/news-1.svg', SYSUTCDATETIME(), 1),
('Actualización de portafolio', 'actualizacion-portafolio',
 'Se incorporan nuevas presentaciones y guías de uso para profesionales de la salud, reforzando la disponibilidad por especialidad.',
 'assets/img/news/news-2.svg', DATEADD(day,-7,SYSUTCDATETIME()), 1);

INSERT INTO JobPostings (Title, Location, Body, CoverImageUrl, PublishedAt, IsPublished) VALUES
('Representante Médico', 'Guatemala · Ciudad de Guatemala',
 'Buscamos talento comercial con enfoque en servicio, ética e integridad. Experiencia en visita médica deseable.',
 'assets/img/jobs/job-1.svg', SYSUTCDATETIME(), 1),
('Analista de Calidad', 'Costa Rica · San José',
 'Perfil orientado a la mejora continua y cumplimiento regulatorio. Conocimiento en procesos de calidad y documentación.',
 'assets/img/jobs/job-1.svg', DATEADD(day,-14,SYSUTCDATETIME()), 1);
