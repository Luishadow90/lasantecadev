-- seed-users.sql
-- Idempotente: inserta o actualiza los usuarios demo sin duplicarlos.
-- Ejecutar en la base de datos objetivo: USE LaSanteDb;
USE LaSanteDb;
GO

-- Nota: las contraseñas deben almacenarse como hashes seguros (bcrypt/argon2).
-- Los PasswordHash que aquí aparecen son los que compartiste; reemplázalos por hashes
-- generados en tu entorno si quieres cambiar las contraseñas de demo.

-- Admin
MERGE dbo.Users AS target
USING (VALUES
  ('admin@lasante.local', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'Administrador', 1)
) AS src(Email, PasswordHash, Role, IsActive)
ON target.Email = src.Email
WHEN MATCHED THEN
  UPDATE SET PasswordHash = src.PasswordHash, Role = src.Role, IsActive = src.IsActive, UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (Email, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt)
  VALUES (src.Email, src.PasswordHash, src.Role, src.IsActive, SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- News editor
MERGE dbo.Users AS target
USING (VALUES
  ('news@lasante.local', '299a094897095909d52d1f2b4feb294e73c13b9192f6ce713ed41890473cb979', 'EditorNoticias', 1)
) AS src(Email, PasswordHash, Role, IsActive)
ON target.Email = src.Email
WHEN MATCHED THEN
  UPDATE SET PasswordHash = src.PasswordHash, Role = src.Role, IsActive = src.IsActive, UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (Email, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt)
  VALUES (src.Email, src.PasswordHash, src.Role, src.IsActive, SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- Jobs editor
MERGE dbo.Users AS target
USING (VALUES
  ('jobs@lasante.local', 'd2ba1ebc53cf3bec5211bc6f96c35d2f63d71aec7424ed239e6e1b9024e9487d', 'EditorVacantes', 1)
) AS src(Email, PasswordHash, Role, IsActive)
ON target.Email = src.Email
WHEN MATCHED THEN
  UPDATE SET PasswordHash = src.PasswordHash, Role = src.Role, IsActive = src.IsActive, UpdatedAt = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (Email, PasswordHash, Role, IsActive, CreatedAt, UpdatedAt)
  VALUES (src.Email, src.PasswordHash, src.Role, src.IsActive, SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- Seguridad adicional: asegurar que el rol 'Administrador' tiene permisos esperados
-- (esto solo documenta; la asignación real de permisos depende del admin panel)
-- Por ejemplo, si tu app usa roles en la lógica, asegúrate que 'Administrador' coincide con lo que espera el frontend.


-- Demo users for admin panel (replace passwords + use strong hashing in production)
-- Passwords:
-- admin@lasante.local => Admin123!
-- news@lasante.local  => News123!
-- jobs@lasante.local  => Jobs123!

/* INSERT INTO Users (Email, PasswordHash, Role) VALUES
('admin@lasante.local', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'Administrador'),
('news@lasante.local',  '299a094897095909d52d1f2b4feb294e73c13b9192f6ce713ed41890473cb979',  'EditorNoticias'),
('jobs@lasante.local',  'd2ba1ebc53cf3bec5211bc6f96c35d2f63d71aec7424ed239e6e1b9024e9487d',  'EditorVacantes');
 */