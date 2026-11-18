# Guía Definitiva de Despliegue en HestiaCP — Glow Party & Beauty Party

## ¿Qué problema había con el archivo anterior?
1. Se había generado un archivo `Archivo.zip` (31 MB) directamente desde el Finder que incluía el código fuente sin compilar (`.tsx`) y la pesada carpeta `node_modules`.
2. Como los navegadores web no entienden TypeScript sin compilar, la página se quedaba en blanco.
3. El archivo `Archivo.zip` ha sido eliminado del proyecto.

---

## Solución Definitiva (Doble Motor: Node.js + PHP/Estático)

He generado dos archivos idénticos para tu comodidad:
* 📦 **`public_html.zip`** (393 KB)
* 📦 **`glow-party-hestia-deploy.zip`** (393 KB)

Ambos contienen:
* **`index.html` + `assets/`:** La aplicación completamente compilada y optimizada, lista para producción.
* **`index.php`:** Motor dual inteligente:
  * Si Node.js está activo en el servidor, actúa como proxy hacia Node.
  * Si Node no está activo, sirve automáticamente los archivos estáticos a máxima velocidad.
  * Incluye panel de control en `https://tu_dominio.com/?node=1`.
* **`server.js` y `server.cjs`:** Servidores Node.js independientes con **0 dependencias** (no requieren hacer `npm install` en el servidor).
* **`.htaccess`:** Reglas para Apache y compresión Gzip.

---

## Cómo instalarlo en HestiaCP (Paso a Paso)

### Opción 1: Modo Estático Ultrarrápido (Recomendado, 0 configuración)
1. Entra a tu panel de **HestiaCP** &rarr; **Administrador de Archivos** (File Manager).
2. Ve a la carpeta de tu web:
   `/home/tu_usuario/web/tu_dominio.com/public_html/`
3. **Vacía la carpeta** (borra el `index.html` por defecto de Hestia y cualquier archivo anterior).
4. Sube el archivo **`public_html.zip`** (o `glow-party-hestia-deploy.zip`).
5. Haz clic derecho sobre el ZIP y pulsa **Extraer (Unpack / Extract)**.
6. Abre en tu navegador `https://tu_dominio.com` &rarr; ¡La web cargará al instante!

---

### Opción 2: Si quieres que ejecute Node.js en el servidor

Si tu VPS de HestiaCP cuenta con Node.js instalado:

#### Desde el Navegador (vía PHP):
1. Entra a `https://tu_dominio.com/?node=1`.
2. Verás el panel de control. Pulsa el botón **"▶ Iniciar Servidor Node"**.
3. El script `index.php` levantará el servidor Node en segundo plano y redirigirá el tráfico automáticamente.

#### O desde la Terminal SSH:
```bash
cd /home/tu_usuario/web/tu_dominio.com/public_html
node server.js
# O si usas PM2 para mantenerlo siempre activo:
pm2 start server.js --name "glow-party"
```
