# La Santé — PRO Starter (Mobile‑first, UX/UI fino)
**Stack:** HTML + CSS (Nexa) + JS vanilla + SQL schema (SQL Server).  
**Brand:** Pantone 2748C (#001A70) y 1235C (#E5A823).

## Diferenciales UX/UI
- Mobile‑first real, layout grid limpio, componentes reutilizables (cards, badges, CTAs).
- Accesibilidad: skip‑link, landmarks, foco visible, contraste AA.
- SEO/Perf: OG tags, JSON‑LD, manifest, robots + sitemap. web.config con compresión y cache estática.

## Pasos
1) Copiar carpeta al servidor IIS (p.ej. `C:\inetpub\wwwroot\lasante`).  
2) Crear sitio y binding HTTPS con certificado SSL.  
3) Subir **Nexa-Bold.woff2** y **Nexa-Regular.woff2** a `assets/fonts/`.  
4) Actualizar subdominios de Farmacovigilancia, Plan y Login.

## Fase 2
- Conectar formularios a backend + SQL (`sql/schema.sql`).  
- Portafolio real desde BD/API o CMS.  
- ATS o Google Sheets para vacantes.

## Admin (Roles: Administrador / EditorNoticias / EditorVacantes)
Incluye un scaffold **ASP.NET Core (.NET 8)** para un Panel Admin con roles:
- **Administrador**: acceso total
- **EditorNoticias**: publicar en Noticias (imágenes + textos)
- **EditorVacantes**: publicar en Trabaja con Nosotros (imágenes + textos)

Ruta: `server-dotnet/LasanteAdminApi`
- Ejecutar local: `dotnet run`
- Login: `/admin/login`
- Seeds (demo): `sql/seed-users.sql`

> Nota: los permisos por rol ya están configurados; en fase 2 conectamos CRUD real a SQL Server y render público dinámico.

## SQL Server (DB + usuarios demo)
Scripts:
- `sql/schema.sql` (tablas)
- `sql/seed-users.sql` (usuarios demo)
- `sql/seed-content.sql` (contenido demo publicado)

Usuarios demo:
- **Administrador**: admin@lasante.local / **Admin123!**
- **EditorNoticias**: news@lasante.local / **News123!**
- **EditorVacantes**: jobs@lasante.local / **Jobs123!**
