<?php
/**
 * Beauty Party & Glow Party — HestiaCP / Apache / PHP Entrypoint & Node Runner
 *
 * Características:
 * 1. Sirve la web de forma 100% autónoma sin requerir Node en producción.
 * 2. Compatible con raíz (public_html/) o cualquier subcarpeta (/glow/, /demo/, etc.).
 * 3. Ejecutor integrado de Node/Build (?action=build) si el servidor tiene Node.js.
 * 4. Diagnóstico completo del entorno (?node_info).
 */

ini_set('display_errors', '0');
error_reporting(E_ALL);

$baseDir = __DIR__;
$distDir = $baseDir . '/dist';

// Obtener la ruta relativa respecto al script actual (soporte de subcarpetas)
$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

$uri = $requestUri;
if ($scriptDir !== '' && strpos($uri, $scriptDir) === 0) {
    $uri = substr($uri, strlen($scriptDir));
}
if ($uri === '' || $uri === false) {
    $uri = '/';
}

// Acción: Diagnóstico del sistema (?node_info)
if (isset($_GET['node_info'])) {
    header('Content-Type: application/json; charset=UTF-8');
    $node = trim((string)@shell_exec('node -v 2>&1'));
    $npm  = trim((string)@shell_exec('npm -v 2>&1'));
    $pm2  = trim((string)@shell_exec('pm2 -v 2>&1'));

    echo json_encode([
        'status' => 'online',
        'app' => 'Beauty Party & Glow Party Demo',
        'php_version' => PHP_VERSION,
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'node_installed' => !empty($node) && strpos($node, 'v') === 0,
        'node_version' => $node ?: 'No disponible o shell_exec desactivado',
        'npm_version' => $npm ?: 'No disponible',
        'pm2_version' => $pm2 ?: 'No disponible',
        'has_root_index_html' => file_exists($baseDir . '/index.html'),
        'has_root_assets' => is_dir($baseDir . '/assets'),
        'has_dist_folder' => is_dir($distDir),
        'has_dist_index_html' => file_exists($distDir . '/index.html'),
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? '',
        'current_dir' => $baseDir,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Acción: Ejecutar compilación de Node desde PHP (?action=build)
if (isset($_GET['action']) && $_GET['action'] === 'build') {
    header('Content-Type: text/plain; charset=UTF-8');
    echo "=== Iniciando compilación Node en el servidor ===\n\n";
    $output = [];
    $ret = -1;
    exec('cd ' . escapeshellarg($baseDir) . ' && npm run build 2>&1', $output, $ret);
    echo implode("\n", $output) . "\n";
    echo "\nCódigo de salida: $ret\n";
    if ($ret === 0) {
        echo "\n¡Compilación exitosa! Ya puedes volver a la página principal.\n";
    } else {
        echo "\nSi Node no está disponible en este hosting, recuerda que el archivo glow-party-hestia-deploy.zip ya contiene todo pre-compilado listo para usar.\n";
    }
    exit;
}

// 1. Manejo de archivos estáticos (JS, CSS, imágenes, fuentes)
$assetPath = null;

// Normalizar búsqueda del asset
$searchFiles = [
    $baseDir . $uri,
    $distDir . $uri,
    $baseDir . '/assets/' . basename($uri),
    $distDir . '/assets/' . basename($uri),
];

if (preg_match('/\.(js|mjs|css|jpg|jpeg|png|svg|webp|woff|woff2|ttf|json|ico|map)$/i', $uri)) {
    foreach ($searchFiles as $candidate) {
        if (file_exists($candidate) && is_file($candidate)) {
            $assetPath = $candidate;
            break;
        }
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
            'map'   => 'application/json; charset=UTF-8',
        ];

        $mime = $mimes[$ext] ?? (function_exists('mime_content_type') ? mime_content_type($realAsset) : 'application/octet-stream');
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($realAsset));
        header('Cache-Control: public, max-age=31536000, immutable');
        readfile($realAsset);
        exit;
    }
}

// 2. Servir el index.html compilado de producción
$htmlPath = null;
if (file_exists($distDir . '/index.html')) {
    $htmlPath = $distDir . '/index.html';
} elseif (file_exists($baseDir . '/index.html')) {
    $content = file_get_contents($baseDir . '/index.html');
    // Verificar que sea el compilado y no el fuente con /src/main.tsx
    if (strpos($content, '/src/main.tsx') === false) {
        $htmlPath = $baseDir . '/index.html';
    }
}

if ($htmlPath && is_file($htmlPath)) {
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Powered-By: Glow-Party-Hestia-Engine');
    readfile($htmlPath);
    exit;
}

// 3. Pantalla de ayuda y ejecución si no están los archivos compilados
http_response_code(500);
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glow Party — Servidor HestiaCP</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0714; color: #f8fafc; padding: 24px; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; }
        .card { background: #171026; border: 1px solid #2d1f47; border-radius: 20px; padding: 36px; max-width: 600px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { color: #f472b6; font-size: 22px; margin-top: 0; }
        p { color: #cbd5e1; line-height: 1.6; font-size: 14px; }
        code { background: #0b0714; padding: 4px 8px; border-radius: 6px; color: #38bdf8; font-family: monospace; font-size: 13px; }
        .badge { display: inline-block; background: #9333ea; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 16px; }
        .btn { display: inline-block; background: #ec4899; color: white; padding: 10px 18px; border-radius: 99px; text-decoration: none; font-weight: bold; margin-top: 14px; transition: transform 0.2s; }
        .btn:hover { transform: scale(1.05); }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">HestiaCP Glow Party Engine</span>
        <h1>Faltan los archivos compilados de producción</h1>
        <p>Asegúrate de haber subido y extraído el archivo <code>glow-party-hestia-deploy.zip</code> en la carpeta <code>public_html/</code>.</p>
        <p>Si tu servidor Hestia dispone de Node.js instalado en el sistema, puedes intentar ejecutar la compilación ahora mismo pulsando el siguiente botón:</p>
        <a class="btn" href="?action=build">⚡ Ejecutar compilación Node ahora</a>
    </div>
</body>
</html>
