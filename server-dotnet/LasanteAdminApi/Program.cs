using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// Auth
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
  .AddCookie(options =>
  {
    options.LoginPath = "/admin/login";
    options.Cookie.Name = "lasante.auth";
    options.Cookie.HttpOnly = true;
    options.SlidingExpiration = true;
  });

builder.Services.AddAuthorization(options =>
{
  options.AddPolicy("AdminOnly", p => p.RequireRole("Administrador"));
  options.AddPolicy("NewsEditor", p => p.RequireRole("Administrador", "EditorNoticias"));
  options.AddPolicy("JobsEditor", p => p.RequireRole("Administrador", "EditorVacantes"));
});

builder.Services.AddRazorPages();

var app = builder.Build();

app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

var cs = app.Configuration.GetConnectionString("Default")
  ?? "Server=localhost;Database=LaSante;Trusted_Connection=True;TrustServerCertificate=True;";

// --- Helpers ---
string Sha256Hex(string s) =>
  Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(s)))
    .ToLowerInvariant();

async Task<string?> GetRoleAsync(string email, string passHash)
{
  using var con = new SqlConnection(cs);
  await con.OpenAsync();
  var cmd = new SqlCommand("SELECT Role FROM Users WHERE Email=@e AND PasswordHash=@h", con);
  cmd.Parameters.AddWithValue("@e", email);
  cmd.Parameters.AddWithValue("@h", passHash);
  var role = await cmd.ExecuteScalarAsync();
  return role as string;
}

async Task SignInAsync(HttpContext http, string email, string role)
{
  var claims = new List<Claim> { new(ClaimTypes.Name, email), new(ClaimTypes.Role, role) };
  var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
  await http.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity));
}

string WwwRootFile(string relativePath) =>
  Path.Combine(app.Environment.WebRootPath, relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));

async Task RegenerateNewsHtmlAsync()
{
  var templatePath = WwwRootFile("noticias.html");
  if (!File.Exists(templatePath)) return;

  var template = await File.ReadAllTextAsync(templatePath);

  using var con = new SqlConnection(cs);
  await con.OpenAsync();
  var cmd = new SqlCommand(@"
    SELECT TOP 50 Title, Slug, Body, CoverImageUrl, PublishedAt
    FROM News
    WHERE IsPublished = 1
    ORDER BY PublishedAt DESC, NewsID DESC;", con);

  using var r = await cmd.ExecuteReaderAsync();
  var items = new System.Text.StringBuilder();

  while (await r.ReadAsync())
  {
    var title = r.GetString(0);
    var slug = r.IsDBNull(1) ? "" : r.GetString(1);
    var body = r.GetString(2);
    var img = r.IsDBNull(3) ? "assets/img/news/news-1.svg" : r.GetString(3);
    var date = r.IsDBNull(4) ? "" : r.GetDateTime(4).ToString("yyyy-MM-dd");

    // short excerpt
    var excerpt = body.Length > 180 ? body.Substring(0, 180) + "…" : body;

    items.AppendLine($@"
<article class=""card"">
  <img src=""{img}"" alt=""{System.Net.WebUtility.HtmlEncode(title)}"" class=""round"" style=""width:100%;height:180px;object-fit:cover"">
  <div class=""p"">
    <div class=""kicker"">{date}</div>
    <h3 style=""margin:.35rem 0"">{System.Net.WebUtility.HtmlEncode(title)}</h3>
    <p style=""color:var(--muted-2)"">{System.Net.WebUtility.HtmlEncode(excerpt)}</p>
  </div>
</article>");
  }

  if (items.Length == 0)
  {
    items.AppendLine(@"<div class=""card""><div class=""p""><h3 style=""margin:0"">Aún no hay noticias publicadas</h3><p style=""color:var(--muted-2);margin:.5rem 0 0"">Publica la primera noticia desde el panel Admin.</p></div></div>");
  }

  var output = template.Replace("<!--NEWS_ITEMS-->", items.ToString());
  await File.WriteAllTextAsync(templatePath, output);
}

async Task RegenerateJobsHtmlAsync()
{
  var templatePath = WwwRootFile("trabaja.html");
  if (!File.Exists(templatePath)) return;

  var template = await File.ReadAllTextAsync(templatePath);

  using var con = new SqlConnection(cs);
  await con.OpenAsync();
  var cmd = new SqlCommand(@"
    SELECT TOP 50 Title, Location, Body, CoverImageUrl, PublishedAt
    FROM JobPostings
    WHERE IsPublished = 1
    ORDER BY PublishedAt DESC, JobID DESC;", con);

  using var r = await cmd.ExecuteReaderAsync();
  var items = new System.Text.StringBuilder();

  while (await r.ReadAsync())
  {
    var title = r.GetString(0);
    var location = r.IsDBNull(1) ? "" : r.GetString(1);
    var body = r.GetString(2);
    var img = r.IsDBNull(3) ? "assets/img/jobs/job-1.svg" : r.GetString(3);
    var date = r.IsDBNull(4) ? "" : r.GetDateTime(4).ToString("yyyy-MM-dd");

    var excerpt = body.Length > 180 ? body.Substring(0, 180) + "…" : body;

    items.AppendLine($@"
<article class=""card"">
  <img src=""{img}"" alt=""{System.Net.WebUtility.HtmlEncode(title)}"" class=""round"" style=""width:100%;height:180px;object-fit:cover"">
  <div class=""p"">
    <div class=""kicker"">{System.Net.WebUtility.HtmlEncode(location)} · {date}</div>
    <h3 style=""margin:.35rem 0"">{System.Net.WebUtility.HtmlEncode(title)}</h3>
    <p style=""color:var(--muted-2)"">{System.Net.WebUtility.HtmlEncode(excerpt)}</p>
  </div>
</article>");
  }

  if (items.Length == 0)
  {
    items.AppendLine(@"<div class=""card""><div class=""p""><h3 style=""margin:0"">Aún no hay vacantes publicadas</h3><p style=""color:var(--muted-2);margin:.5rem 0 0"">Publica la primera vacante desde el panel Admin.</p></div></div>");
  }

  var output = template.Replace("<!--JOB_ITEMS-->", items.ToString());
  await File.WriteAllTextAsync(templatePath, output);
}

// --- Routes ---
app.MapGet("/admin", [Authorize] () => Results.Redirect("/admin/dashboard"));

app.MapPost("/admin/auth/login", async (HttpContext http) =>
{
  var form = await http.Request.ReadFormAsync();
  var email = form["email"].ToString().Trim();
  var password = form["password"].ToString();

  var role = await GetRoleAsync(email, Sha256Hex(password));
  if (string.IsNullOrWhiteSpace(role)) return Results.Redirect("/admin/login?error=1");

  await SignInAsync(http, email, role);
  return Results.Redirect("/admin/dashboard");
});

app.MapPost("/admin/auth/logout", async (HttpContext http) =>
{
  await http.SignOutAsync();
  return Results.Redirect("/admin/login");
});

// Save News
app.MapPost("/admin/news/save", [Authorize(Policy="NewsEditor")] async (HttpContext http) =>
{
  var form = await http.Request.ReadFormAsync();
  var title = form["title"].ToString().Trim();
  var slug = form["slug"].ToString().Trim();
  var body = form["body"].ToString().Trim();
  var img = form["image"].ToString().Trim();
  var publish = form["publish"].ToString() == "on";

  if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(body))
    return Results.Redirect("/admin/noticias?error=1");

  using var con = new SqlConnection(cs);
  await con.OpenAsync();

  var cmd = new SqlCommand(@"
    INSERT INTO News (Title, Slug, Body, CoverImageUrl, PublishedAt, IsPublished)
    VALUES (@t, @s, @b, @i, @pAt, @pub);", con);

  cmd.Parameters.AddWithValue("@t", title);
  cmd.Parameters.AddWithValue("@s", string.IsNullOrWhiteSpace(slug) ? (object)DBNull.Value : slug);
  cmd.Parameters.AddWithValue("@b", body);
  cmd.Parameters.AddWithValue("@i", string.IsNullOrWhiteSpace(img) ? (object)DBNull.Value : img);
  cmd.Parameters.AddWithValue("@pAt", publish ? DateTime.UtcNow : (object)DBNull.Value);
  cmd.Parameters.AddWithValue("@pub", publish ? 1 : 0);

  await cmd.ExecuteNonQueryAsync();

  if (publish) await RegenerateNewsHtmlAsync();

  return Results.Redirect("/admin/noticias?ok=1");
});

// Save Job
app.MapPost("/admin/jobs/save", [Authorize(Policy="JobsEditor")] async (HttpContext http) =>
{
  var form = await http.Request.ReadFormAsync();
  var title = form["title"].ToString().Trim();
  var location = form["location"].ToString().Trim();
  var body = form["body"].ToString().Trim();
  var img = form["image"].ToString().Trim();
  var publish = form["publish"].ToString() == "on";

  if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(body))
    return Results.Redirect("/admin/vacantes?error=1");

  using var con = new SqlConnection(cs);
  await con.OpenAsync();

  var cmd = new SqlCommand(@"
    INSERT INTO JobPostings (Title, Location, Body, CoverImageUrl, PublishedAt, IsPublished)
    VALUES (@t, @l, @b, @i, @pAt, @pub);", con);

  cmd.Parameters.AddWithValue("@t", title);
  cmd.Parameters.AddWithValue("@l", string.IsNullOrWhiteSpace(location) ? (object)DBNull.Value : location);
  cmd.Parameters.AddWithValue("@b", body);
  cmd.Parameters.AddWithValue("@i", string.IsNullOrWhiteSpace(img) ? (object)DBNull.Value : img);
  cmd.Parameters.AddWithValue("@pAt", publish ? DateTime.UtcNow : (object)DBNull.Value);
  cmd.Parameters.AddWithValue("@pub", publish ? 1 : 0);

  await cmd.ExecuteNonQueryAsync();

  if (publish) await RegenerateJobsHtmlAsync();

  return Results.Redirect("/admin/vacantes?ok=1");
});

// Manual publish (useful after bulk inserts)
app.MapPost("/admin/publish/all", [Authorize(Policy="AdminOnly")] async () =>
{
  await RegenerateNewsHtmlAsync();
  await RegenerateJobsHtmlAsync();
  return Results.Redirect("/admin/dashboard?published=1");
});

app.MapRazorPages();

// Default document
app.MapFallbackToFile("index.html");

app.Run();