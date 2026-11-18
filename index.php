<?php
/**
 * Beauty Party & Glow Party — HestiaCP / Apache / PHP Entrypoint & Static Runner
 * 
 * Funcionalidades:
 * 1. Sirve la versión compilada de producción (dist/index.html) sin necesidad de Node.js en el servidor.
 * 2. Soporta enrutamiento y entrega correcta de archivos con tipos MIME oficiales.
 * 3. Diagnóstico del entorno mediante el parámetro ?node_info
 */

$baseDir = __DIR__;
$distDir = $baseDir . '/dist';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

// Diagnóstico si se solicita ?node_info
if (isset($_GET['node_info'])) {
    header('Content-Type: application/json; charset=UTF-8');
    $nodeVersion = @shell_exec('node -v 2>&1');
    $npmVersion = @shell_exec('npm -v 2>&1');
    echo json_encode([
        'status' => 'online',
        'app' => 'Beauty Party & Glow Party Demo',
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'node_installed' => !empty($nodeVersion) && strpos(trim((string)$nodeVersion), 'v') === 0,
        'node_version' => trim((string)$nodeVersion),
        'npm_version' => trim((string)$npmVersion),
        'dist_exists' => is_dir($distDir),
        'dist_index_html' => file_exists($distDir . '/index.html'),
        'root_index_html' => file_exists($baseDir . '/index.html'),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// 1. Manejo de archivos estáticos (JS, CSS, imágenes, fuentes)
$assetPath = null;
if (strpos($uri, '/assets/') === 0) {
    if (file_exists($distDir . $uri)) {
        $assetPath = $distDir . $uri;
    } elseif (file_exists($baseDir . $uri)) {
        $assetPath = $baseDir . $uri;
    }
} elseif (preg_match('/\.(js|mjs|css|jpg|jpeg|png|svg|webp|woff|woff2|ttf|json|ico)$/i', $uri)) {
    if (file_exists($distDir . $uri)) {
        $assetPath = $distDir . $uri;
    } elseif (file_exists($baseDir . $uri)) {
        $assetPath = $baseDir . $uri;
    }
}

if ($assetPath && is_file($assetPath)) {
    $realAsset = realpath($assetPath);
    $realBase = realpath($baseDir);
    if ($realAsset && $realBase && strpos($realAsset, $realBase) === 0) {
        $ext = strtolower(pathinfo($realAsset, PATHINFO_EXTENSION));
        $mimes = [
            'js'    => 'application/javascript; charset=UTF-8',
            'mjs'   => 'application/javascript; charset=UTF-8',
            'css'   => 'text/css; charset=UTF-8',
            'jpg'   => 'image/jpeg',
            'jpeg'  => 'image/jpeg',
            'png'   => 'image/png',
            'webp'  => 'image/webp',
            'svg'   => 'image/svg+xml',
            'ico'   => 'image/x-icon',
            'woff'  => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf'   => 'font/ttf',
            'json'  => 'application/json; charset=UTF-8',
        ];

        $mime = $mimes[$ext] ?? (function_exists('mime_content_type') ? mime_content_type($realAsset) : 'application/octet-stream');
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($realAsset));
        header('Cache-Control: public, max-age=31536000, immutable');
        readfile($realAsset);
        exit;
    }
}

// 2. Servir el index.html de producción (prioridad a dist/index.html)
$htmlPath = null;
if (file_exists($distDir . '/index.html')) {
    $htmlPath = $distDir . '/index.html';
} elseif (file_exists($baseDir . '/dist/index.html')) {
    $htmlPath = $baseDir . '/dist/index.html';
}

if ($htmlPath && is_file($htmlPath)) {
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Powered-By: Glow-Party-Hestia-Engine');
    readfile($htmlPath);
    exit;
}

// 3. Mensaje amigable si dist/ aún no ha sido subido
http_response_code(500);
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glow Party — Configuración en HestiaCP</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0714; color: #f8fafc; padding: 24px; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; }
        .card { background: #171026; border: 1px solid #2d1f47; border-radius: 20px; padding: 36px; max-width: 580px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { color: #f472b6; font-size: 22px; margin-top: 0; }
        p { color: #cbd5e1; line-height: 1.6; font-size: 14px; }
        code { background: #0b0714; padding: 4px 8px; border-radius: 6px; color: #38bdf8; font-family: monospace; font-size: 13px; }
        .badge { display: inline-block; background: #9333ea; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">HestiaCP Glow Party Engine</span>
        <h1>Falta la carpeta compilada <code>dist/</code></h1>
        <p>Para que la aplicación funcione en HestiaCP sin necesidad de configurar un daemon Node.js, sube la carpeta <code>dist/</code> junto a este <code>index.php</code>.</p>
        <p>O simplemente extrae el archivo <code>glow-party-hestia-deploy.zip</code> en tu <code>public_html/</code>.</p>
    </div>
</body>
</html>
