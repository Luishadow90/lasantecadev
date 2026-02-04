-- Demo users for admin panel (replace passwords + use strong hashing in production)
-- Passwords:
-- admin@lasante.local => Admin123!
-- news@lasante.local  => News123!
-- jobs@lasante.local  => Jobs123!

INSERT INTO Users (Email, PasswordHash, Role) VALUES
('admin@lasante.local', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'Administrador'),
('news@lasante.local',  '299a094897095909d52d1f2b4feb294e73c13b9192f6ce713ed41890473cb979',  'EditorNoticias'),
('jobs@lasante.local',  'd2ba1ebc53cf3bec5211bc6f96c35d2f63d71aec7424ed239e6e1b9024e9487d',  'EditorVacantes');
