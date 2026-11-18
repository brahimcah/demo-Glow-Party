# Instrucciones de Despliegue en HestiaCP — Beauty Party & Glow Party

## 1. ¿Por qué no se ejecutaba antes?
En HestiaCP, la configuración por defecto usa **Nginx como proxy inverso por delante de Apache**.
Nginx se encarga de servir directamente los archivos estáticos (`.html`, `.js`, `.css`) buscando en la carpeta `public_html/`:
1. **Archivo `index.html` por defecto de Hestia:** Cuando creas un dominio, Hestia genera automáticamente un `index.html` básico de bienvenida. Si el ZIP anterior tenía los archivos dentro de la subcarpeta `dist/`, Hestia seguía mostrando su página por defecto o una pantalla en blanco.
2. **Ruta de los Assets:** Al estar los archivos JS y CSS dentro de `dist/assets/`, Nginx buscaba en `public_html/assets/` y devolvía un error **404 Not Found** en los scripts de React, por lo que la aplicación no arrancaba.
3. **Node.js en Hestia:** En HestiaCP los sitios estándar funcionan con Nginx + Apache + PHP. Esta aplicación es una SPA (Single Page Application en React), por lo que **no necesita Node.js en el servidor para producción**. Se ejecuta como HTML/JS/CSS de altísima velocidad servido directamente por el servidor web.

---

## 2. Nueva solución generada en el ZIP

El nuevo archivo `glow-party-hestia-deploy.zip` viene estructurado para la raíz de `public_html/`:
* **`index.html`:** Compilado de producción listo en la raíz (sobrescribe la página de bienvenida de Hestia).
* **`assets/`:** Contiene los bundles optimizados de JavaScript y CSS con el nuevo efecto de globos voladores.
* **`dist/`:** Copia de respaldo por compatibilidad.
* **`index.php`:** Motor PHP de respaldo y herramienta de diagnóstico del servidor.
* **`.htaccess`:** Configuración para Apache con compresión Gzip y tipos MIME.

---

## 3. Pasos para instalarlo en HestiaCP

1. Entra a tu panel de **HestiaCP** y abre el **Administrador de Archivos** (File Manager).
2. Ve a la ruta de tu dominio:
   `/home/tu_usuario/web/tu_dominio.com/public_html/`
3. **Importante:** Elimina el archivo `index.html` antiguo de Hestia y cualquier contenido anterior de la carpeta `public_html/`.
4. Sube el nuevo archivo:
   **`glow-party-hestia-deploy.zip`**
5. Haz clic derecho sobre el archivo en el Administrador de Archivos y pulsa **Extraer (Unpack / Extract)**.
6. Abre tu web en el navegador:
   `https://tu_dominio.com`
   ¡Verás la web cargando de inmediato y los globos volando por la pantalla!

---

## 4. Diagnóstico del Servidor

Puedes verificar el estado técnico de tu instalación accediendo a:
`https://tu_dominio.com/?node_info`
