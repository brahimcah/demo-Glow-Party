<?php
/**
 * Runner de Node.js vía PHP para HestiaCP / Apache
 * 
 * Uso:
 * 1. Desde el navegador: https://tu_dominio.com/run-node.php
 * 2. O desde la consola:  php run-node.php
 */

header('Content-Type: text/html; charset=UTF-8');

$baseDir = __DIR__;
$serverScript = file_exists($baseDir . '/server.cjs') ? 'server.cjs' : 'server.js';
$port = 3000;

function findNode() {
    $candidates = [
        trim((string)@shell_exec('which node 2>/dev/null')),
        '/usr/bin/node',
        '/usr/local/bin/node',
        '/bin/node',
        '/snap/bin/node',
    ];
    // Buscar en NVM si existe
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

function checkPort($port) {
    $fp = @fsockopen('127.0.0.1', $port, $errno, $errstr, 0.5);
    if ($fp) {
        fclose($fp);
        return true;
    }
    return false;
}

$nodeBin = findNode();
$isRunning = checkPort($port);
$action = $_GET['action'] ?? '';
$message = '';

if ($action === 'start' && $nodeBin) {
    if (!$isRunning) {
        $cmd = "PORT={$port} " . escapeshellarg($nodeBin) . " " . escapeshellarg($baseDir . '/' . $serverScript) . " > " . escapeshellarg($baseDir . '/node_output.log') . " 2>&1 &";
        @shell_exec($cmd);
        usleep(400000);
        $isRunning = checkPort($port);
        $message = $isRunning ? "¡Servidor Node.js iniciado con éxito en el puerto {$port}!" : "Se intentó iniciar Node.js. Revisa node_output.log para ver los detalles.";
    } else {
        $message = "Node.js ya está activo en el puerto {$port}.";
    }
} elseif ($action === 'stop') {
    @shell_exec("pkill -f " . escapeshellarg($serverScript));
    usleep(300000);
    $isRunning = checkPort($port);
    $message = $isRunning ? "No se pudo detener el proceso." : "Servidor Node.js detenido.";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ejecutor Node.js — Glow Party</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0714; color: #f8fafc; padding: 24px; display: flex; justify-content: center; align-items: center; min-height: 90vh; margin: 0; }
        .card { background: #171026; border: 1px solid #2d1f47; border-radius: 20px; padding: 36px; max-width: 620px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        h1 { color: #f472b6; font-size: 24px; margin-top: 0; }
        p { color: #cbd5e1; line-height: 1.6; font-size: 14px; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 99px; font-weight: bold; font-size: 13px; margin-bottom: 20px; }
        .badge-green { background: #10b981; color: #fff; }
        .badge-yellow { background: #f59e0b; color: #fff; }
        .badge-purple { background: #8b5cf6; color: #fff; }
        .box { background: #0b0714; border: 1px solid #2d1f47; border-radius: 12px; padding: 16px; margin: 18px 0; font-family: monospace; font-size: 13px; color: #38bdf8; line-height: 1.6; }
        .btn { display: inline-flex; align-items: center; justify-content: center; background: #ec4899; color: white; padding: 12px 22px; border-radius: 99px; text-decoration: none; font-weight: bold; margin-right: 10px; margin-top: 8px; transition: transform 0.15s; }
        .btn:hover { transform: scale(1.04); }
        .btn-stop { background: #ef4444; }
        .btn-sec { background: #374151; }
        .msg { background: #1e1b4b; border-left: 4px solid #818cf8; padding: 12px; border-radius: 6px; margin-bottom: 16px; color: #e0e7ff; }
    </style>
</head>
<body>
    <div class="card">
        <h1>⚡ Ejecutor Node.js para HestiaCP</h1>
        
        <?php if ($message): ?>
            <div class="msg"><?= htmlspecialchars($message) ?></div>
        <?php endif; ?>

        <?php if ($isRunning): ?>
            <span class="badge badge-green">🟢 Node.js ACTIVO en puerto <?= $port ?></span>
        <?php elseif ($nodeBin): ?>
            <span class="badge badge-yellow">🟡 Node.js Instalado (Detenido)</span>
        <?php else: ?>
            <span class="badge badge-purple">🟣 Modo Estático Automático (Node no detectado en el hosting)</span>
        <?php endif; ?>

        <div class="box">
            Binario Node: <?= htmlspecialchars($nodeBin ?: 'No detectado en PATH del servidor') ?><br>
            Script servidor: <?= htmlspecialchars($serverScript) ?><br>
            Puerto configurado: <?= $port ?><br>
            Estado del puerto: <?= $isRunning ? 'EN ESCUCHA (ONLINE)' : 'CERRADO (OFFLINE)' ?><br>
            Archivos de producción: <?= (file_exists($baseDir . '/index.html') || file_exists($baseDir . '/dist/index.html')) ? 'OK (Compilados)' : 'FALTAN' ?>
        </div>

        <p><strong>Nota importante sobre HestiaCP:</strong> Esta aplicación React ya está precompilada. Funciona tanto a través de Node.js como de forma 100% estática mediante Nginx/Apache a través de <code>index.html</code> e <code>index.php</code>.</p>

        <div style="margin-top: 24px;">
            <?php if (!$isRunning && $nodeBin): ?>
                <a class="btn" href="?action=start">▶ Iniciar Servidor Node</a>
            <?php elseif ($isRunning): ?>
                <a class="btn btn-stop" href="?action=stop">⏹ Detener Servidor Node</a>
            <?php endif; ?>

            <a class="btn btn-sec" href="./">👉 Abrir la Web</a>
        </div>
    </div>
</body>
</html>
