<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Amarnath Portfolio - Laravel API Engine</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #090d16; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 24px; position: relative; overflow-x: hidden; }
        .glow { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.25; z-index: 0; }
        .glow-1 { width: 450px; height: 450px; background: #6366f1; top: -100px; left: -100px; }
        .glow-2 { width: 400px; height: 400px; background: #a855f7; bottom: -100px; right: -100px; }
        .container { position: relative; z-index: 10; max-width: 800px; width: 100%; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .header { text-align: center; margin-bottom: 36px; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80; padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; margin-bottom: 16px; }
        .dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80; }
        h1 { font-size: 2.25rem; font-weight: 800; background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
        p.subtitle { color: #94a3b8; font-size: 1rem; }
        .endpoints-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .card { background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 20px; transition: all 0.3s ease; }
        .card:hover { transform: translateY(-3px); border-color: rgba(99, 102, 241, 0.4); box-shadow: 0 12px 24px rgba(99, 102, 241, 0.1); }
        .method { display: inline-block; background: rgba(99, 102, 241, 0.2); color: #818cf8; font-weight: 700; font-size: 0.75rem; padding: 4px 8px; border-radius: 6px; margin-bottom: 8px; }
        .url { color: #f8fafc; font-family: monospace; font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; word-break: break-all; }
        .desc { color: #94a3b8; font-size: 0.825rem; }
        .actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn { text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; font-size: 0.95rem; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 8px; }
        .btn-primary { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #fff; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6); }
        .btn-secondary { background: rgba(30, 41, 59, 0.8); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.1); }
        .btn-secondary:hover { background: rgba(51, 65, 85, 0.8); color: #fff; }
        .footer { margin-top: 24px; text-align: center; color: #64748b; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>

    <div class="container">
        <div class="header">
            <div class="badge"><span class="dot"></span> LARAVEL 11 REST API ENGINE ONLINE</div>
            <h1>Amarnath Chauhan API Server</h1>
            <p class="subtitle">High-Performance Enterprise Backend for <a href="https://amarnath.info" style="color:#818cf8;text-decoration:none;">amarnath.info</a></p>
        </div>

        <div class="endpoints-grid">
            <a href="/api/portfolio" target="_blank" style="text-decoration:none;">
                <div class="card">
                    <span class="method">GET</span>
                    <div class="url">/api/portfolio</div>
                    <div class="desc">Fetches full dynamic JSON payload (Personal, Projects, Skills, Exp)</div>
                </div>
            </a>
            <a href="/admin/login" style="text-decoration:none;">
                <div class="card">
                    <span class="method">POST / GET</span>
                    <div class="url">/admin/login</div>
                    <div class="desc">Admin Authentication Portal & Management Control Panel</div>
                </div>
            </a>
        </div>

        <div class="actions">
            <a href="https://amarnath.info" class="btn btn-primary"><i class="fa-solid fa-globe"></i> Visit React Portfolio (amarnath.info)</a>
            <a href="/admin/login" class="btn btn-secondary"><i class="fa-solid fa-lock"></i> Open Admin Portal</a>
        </div>
    </div>

    <div class="footer">
        &copy; 2026 Amarnath Chauhan. Built with Laravel 11 CLI, SQLite & Docker.
    </div>
</body>
</html>
HTML;
    return response($html)->header('Content-Type', 'text/html');
});

Route::get('/admin/login', function () {
    $html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - Amarnath Portfolio</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #090d16; color: #f8fafc; min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 24px; position: relative; }
        .glow { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.25; }
        .glow-1 { width: 400px; height: 400px; background: #6366f1; top: -50px; left: -50px; }
        .card { position: relative; z-index: 10; max-width: 440px; width: 100%; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .logo { text-align: center; font-size: 1.8rem; font-weight: 800; color: #6366f1; margin-bottom: 8px; }
        .title { text-align: center; color: #fff; font-size: 1.35rem; font-weight: 700; margin-bottom: 6px; }
        .sub { text-align: center; color: #94a3b8; font-size: 0.875rem; margin-bottom: 24px; }
        .form-group { margin-bottom: 20px; }
        label { display: block; color: #cbd5e1; font-size: 0.875rem; font-weight: 500; margin-bottom: 8px; }
        input { width: 100%; padding: 12px 16px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; color: #fff; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
        input:focus { border-color: #6366f1; }
        .btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border: none; border-radius: 10px; color: #fff; font-size: 1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); }
        .btn:hover { background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); }
        .hint { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 10px; padding: 12px; font-size: 0.825rem; color: #a5b4fc; margin-top: 20px; text-align: center; }
        .back { display: block; text-align: center; margin-top: 20px; color: #818cf8; text-decoration: none; font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="glow glow-1"></div>
    <div class="card">
        <div class="logo">&lt;Amarnath/&gt;</div>
        <div class="title">Backend Admin Portal</div>
        <div class="sub">Server: admin.amarnath.info</div>

        <form action="/api/admin/login" method="POST">
            <div class="form-group">
                <label>Admin Email</label>
                <input type="email" name="email" value="admin@amarnath.info" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" value="admin123" required>
            </div>
            <button type="submit" class="btn"><i class="fa-solid fa-lock"></i> Login to Backend</button>
        </form>

        <div class="hint">
            <strong>Default Credentials:</strong><br>
            Email: <code>admin@amarnath.info</code><br>
            Password: <code>admin123</code>
        </div>

        <a href="https://amarnath.info" class="back">&larr; Back to Main Website (amarnath.info)</a>
    </div>
</body>
</html>
HTML;
    return response($html)->header('Content-Type', 'text/html');
});
