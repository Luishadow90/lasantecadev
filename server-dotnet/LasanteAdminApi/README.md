# LasanteAdminApi (.NET 8 + SQL Server)
- Sirve el sitio público desde `wwwroot/` (HTML/CSS/JS).
- Panel Admin en `/admin/*` con roles:
  - Administrador
  - EditorNoticias
  - EditorVacantes

## Ejecutar local
```bash
cd server-dotnet/LasanteAdminApi
dotnet restore
dotnet run
```

Abrir:
- Sitio público: `http://localhost:5000/`
- Admin: `http://localhost:5000/admin/login`

## Publicación automática
- Al guardar y marcar **Publicar**, se regeneran:
  - `wwwroot/noticias.html`
  - `wwwroot/trabaja.html`

## Scripts SQL
Ver carpeta `/sql` en la raíz del proyecto.
