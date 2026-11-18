<?php
/**
 * Beauty Party & Glow Party — HestiaCP / Apache / PHP Entrypoint & Node.js Runner
 * 
 * Funciones:
 * 1. Auto-descompresor: Si se sube el archivo ZIP junto a este index.php, lo extrae automáticamente.
 * 2. Si Node.js está activo en el puerto 3000, actúa como Proxy Inverso hacia Node.
 * 3. Si Node.js no está activo, sirve la versión compilada estática a máxima velocidad.
 * 4. Ejecutor de Node.js integrado y panel de control en ?node=1 o en run-node.php.
 */

ini_set('display_errors', '0');
error_reporting(E_ALL);

$baseDir = __DIR__;
$distDir = $baseDir . '/dist';
$nodePort = 3000;
$nodeHost = '127.0.0.1';

// Auto-extracción de seguridad si existe un zip en la carpeta y no están los assets
if (!is_dir($baseDir . '/assets') && !file_exists($distDir . '/index.html')) {
    if (class_exists('ZipArchive')) {
        $zipCandidates = array_merge(
            glob($baseDir . '/public_html.zip') ?: [],
            glob($baseDir . '/glow-party-hestia-deploy.zip') ?: [],
            glob($baseDir . '/*.zip') ?: []
        );
        foreach ($zipCandidates as $zipFile) {
            $zip = new ZipArchive();
            if ($zip->open($zipFile) === TRUE) {
                $zip->extractTo($baseDir);
                $zip->close();
                break;
            }
        }
    }
}

// Función para verificar si el servidor Node está respondiendo
function isNodeRunning($host, $port) {
    $fp = @fsockopen($host, $port, $errno, $errstr, 0.4);
    if ($fp) {
        fclose($fp);
        return true;
    }
    return false;
}

// Función para encontrar el binario de Node en el servidor
function findNodeBinary() {
    $candidates = [
        trim((string)@shell_exec('which node 2>/dev/null')),
        '/usr/bin/node',
        '/usr/local/bin/node',
        '/bin/node',
        '/snap/bin/node',
    ];
    $user = get_current_user();
    $nvmDir = "/home/{$user}/.nvm/versions/node";
    if (is_dir($nvmDir)) {
        $versions = @scandir($nvmDir, SCANDIR_SORT_DESCENDING);
        if ($versions) {
            foreach ($versions as $v) {
                if ($v !== '.' && $v !== '..' && is_file("{$nvmDir}/{$v}/bin/node")) {
                    $candidates[] = "{$nvmDir}/{$v}/bin/node";
                    break;
                }
            }
        }
    }
    foreach ($candidates as $cand) {
        if (!empty($cand) && @is_executable($cand)) {
            return $cand;
        }
    }
    return null;
}

// Función para arrancar Node.js en segundo plano
function startNodeServer($baseDir, $port) {
    $nodeBin = findNodeBinary() ?: 'node';
    $serverScript = file_exists($baseDir . '/server.cjs') ? 'server.cjs' : 'server.js';
    $cmd = "PORT=" . intval($port) . " " . escapeshellarg($nodeBin) . " " . escapeshellarg($baseDir . '/' . $serverScript) . " > " . escapeshellarg($baseDir . '/node_output.log') . " 2>&1 &";
    @shell_exec($cmd);
    usleep(400000);
    return isNodeRunning('127.0.0.1', $port);
}

// Panel de control / Diagnóstico (?node=1 o ?admin=1 o ?node_info)
if (isset($_GET['node']) || isset($_GET['admin']) || isset($_GET['node_info'])) {
    if (isset($_GET['action'])) {
        if ($_GET['action'] === 'start') {
            startNodeServer($baseDir, $nodePort);
            header('Location: ?node=1&started=1');
            exit;
        }
        if ($_GET['action'] === 'stop') {
            $serverScript = file_exists($baseDir . '/server.cjs') ? 'server.cjs' : 'server.js';
            @shell_exec("pkill -f " . escapeshellarg($serverScript));
            header('Location: ?node=1&stopped=1');
            exit;
        }
        if ($_GET['action'] === 'build') {
            header('Content-Type: text/plain; charset=UTF-8');
            echo "=== Ejecutando npm run build ===\n\n";
            $output = [];
            $ret = -1;
            exec('cd ' . escapeshellarg($baseDir) . ' && npm run build 2>&1', $output, $ret);
            echo implode("\n", $output) . "\n\nCódigo de salida: $ret\n";
            exit;
        }
    }

    $nodeRunning = isNodeRunning($nodeHost, $nodePort);
    $nodeVer = trim((string)@shell_exec('node -v 2>&1'));
    $nodeBin = findNodeBinary();

    if (isset($_GET['node_info'])) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'status' => 'online',
            'app' => 'Beauty Party & Glow Party Demo',
            'php_version' => PHP_VERSION,
            'node_running_on_port_' . $nodePort => $nodeRunning,
            'node_binary' => $nodeBin ?: 'No detectado',
            'node_version' => $nodeVer ?: 'No disponible o shell_exec desactivado',
            'has_static_index' => file_exists($baseDir . '/index.html') || file_exists($distDir . '/index.html'),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        exit;
    }

    header('Content-Type: text/html; charset=UTF-8');
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Panel de Control — Glow Party Hestia Engine</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0714; color: #f8fafc; padding: 24px; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; }
            .card { background: #171026; border: 1px solid #2d1f47; border-radius: 20px; padding: 36px; max-width: 620px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
            h1 { color: #f472b6; font-size: 24px; margin-top: 0; }
            p { color: #cbd5e1; line-height: 1.6; font-size: 14px; }
            .status-badge { display: inline-block; padding: 6px 14px; border-radius: 99px; font-weight: bold; font-size: 13px; margin-bottom: 20px; }
            .status-ok { background: #10b981; color: #fff; }
            .status-idle { background: #8b5cf6; color: #fff; }
            .info-box { background: #0b0714; border: 1px solid #2d1f47; border-radius: 12px; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 13px; color: #38bdf8; line-height: 1.6; }
            .btn { display: inline-flex; align-items: center; justify-content: center; background: #ec4899; color: white; padding: 12px 22px; border-radius: 99px; text-decoration: none; font-weight: bold; margin-right: 10px; margin-top: 8px; transition: transform 0.15s; }
            .btn:hover { transform: scale(1.04); }
            .btn-secondary { background: #374151; color: #f3f4f6; }
            .btn-danger { background: #ef4444; color: #fff; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>🚀 Glow Party & Beauty Party — Servidor</h1>
            <?php if ($nodeRunning): ?>
                <span class="status-badge status-ok">🟢 Node.js Activo en puerto <?= $nodePort ?></span>
            <?php else: ?>
                <span class="status-badge status-idle">🟣 Modo Estático Ultrarrápido (PHP / Nginx)</span>
            <?php endif; ?>

            <div class="info-box">
                PHP: <?= PHP_VERSION ?><br>
                Node Binario: <?= htmlspecialchars($nodeBin ?: 'No detectado') ?><br>
                Node Versión: <?= htmlspecialchars($nodeVer ?: 'No disponible') ?><br>
                Servidor Node (puerto <?= $nodePort ?>): <?= $nodeRunning ? 'ACTIVO' : 'DETENIDO' ?><br>
                Compilación estática: <?= (file_exists($distDir . '/index.html') || file_exists($baseDir . '/index.html')) ? 'LISTA' : 'PENDIENTE' ?>
            </div>

            <p>Este sistema cuenta con <strong>doble motor</strong>: si Node.js está activo, procesa las peticiones directamente. Si no, sirve la aplicación compilada con cero dependencias.</p>

            <a class="btn" href="./">👉 Ver la Web</a>
            <?php if (!$nodeRunning && $nodeBin): ?>
                <a class="btn btn-secondary" href="?node=1&action=start">▶ Iniciar Servidor Node</a>
            <?php elseif ($nodeRunning): ?>
                <a class="btn btn-danger" href="?node=1&action=stop">⏹ Detener Node</a>
            <?php endif; ?>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// 1. Si Node.js está corriendo en el puerto 3000, hacer Proxy Inverso a Node
if (isNodeRunning($nodeHost, $nodePort)) {
    $proxyUrl = 'http://' . $nodeHost . ':' . $nodePort . $_SERVER['REQUEST_URI'];
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $proxyUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HEADER, true);

    $reqHeaders = [];
    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $key => $val) {
            if (!in_array(strtolower($key), ['host', 'connection'])) {
                $reqHeaders[] = "$key: $val";
            }
        }
    }
    if (!empty($reqHeaders)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $reqHeaders);
    }

    $response = curl_exec($ch);
    if (!curl_errno($ch)) {
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $resHeaders = substr($response, 0, $headerSize);
        $resBody = substr($response, $headerSize);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        http_response_code($httpCode);
        foreach (explode("\r\n", $resHeaders) as $h) {
            if (!empty($h) && !preg_match('/^(Transfer-Encoding|Connection):/i', $h)) {
                header($h);
            }
        }
        echo $resBody;
        if (PHP_VERSION_ID < 80500) {
            @curl_close($ch);
        }
        exit;
    }
    if (PHP_VERSION_ID < 80500) {
        @curl_close($ch);
    }
}

// 2. Si Node no está activo, servir los archivos estáticos de producción directamente
$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);

$uri = $requestUri;
if ($scriptDir !== '' && strpos($uri, $scriptDir) === 0) {
    $uri = substr($uri, strlen($scriptDir));
}
if ($uri === '' || $uri === false) {
    $uri = '/';
}

$searchFiles = [
    $baseDir . $uri,
    $distDir . $uri,
    $baseDir . '/assets/' . basename($uri),
    $distDir . '/assets/' . basename($uri),
];

$assetPath = null;
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

        $mime = $mimes[$ext] ?? 'application/octet-stream';
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($realAsset));
        header('Cache-Control: public, max-age=31536000, immutable');
        readfile($realAsset);
        exit;
    }
}

// 3. Servir el index.html compilado
$htmlCandidates = [
    $distDir . '/index.html',
    $baseDir . '/dist/index.html',
    $baseDir . '/index.html',
];

$htmlPath = null;
foreach ($htmlCandidates as $cand) {
    if (file_exists($cand) && is_file($cand)) {
        $content = file_get_contents($cand);
        // Descartar si es el dev source con /src/main.tsx
        if (strpos($content, '/src/main.tsx') === false) {
            $htmlPath = $cand;
            break;
        }
    }
}

if ($htmlPath) {
    header('Content-Type: text/html; charset=UTF-8');
    header('X-Powered-By: Glow-Party-Hestia-Engine');
    readfile($htmlPath);
    exit;
}

// 4. Si falta compilar o extraer
http_response_code(500);
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Glow Party — Servidor HestiaCP</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0b0714; color: #fff; padding: 30px; text-align: center; }
        .card { max-width: 520px; margin: 60px auto; background: #171026; padding: 40px; border-radius: 20px; border: 1px solid #3b225c; }
        h1 { color: #f472b6; }
        p { color: #cbd5e1; }
        a { color: #38bdf8; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Faltan archivos compilados</h1>
        <p>Por favor extrae el archivo <code>public_html.zip</code> en tu carpeta <code>public_html/</code>.</p>
        <p><a href="?node=1">Ir al panel de control &rarr;</a></p>
    </div>
</body>
</html>
