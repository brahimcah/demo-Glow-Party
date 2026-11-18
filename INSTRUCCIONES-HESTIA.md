# Instrucciones de Despliegue en HestiaCP — Beauty Party & Glow Party

## 1. ¿Por qué no se ejecutaba antes?
Este proyecto está desarrollado con **React + Vite + TypeScript**.
Cuando se sube el código fuente sin compilar (`src/main.tsx`, `package.json`, etc.) al `public_html` de HestiaCP:
* El navegador recibe el archivo `index.html` sin procesar que hace referencia a `/src/main.tsx`.
* Los navegadores no pueden ejecutar archivos `.tsx` (TypeScript/JSX) directamente, por lo que la página se queda en blanco o da un error 404 / sintaxis.
* HestiaCP por defecto es un servidor web (Nginx + Apache + PHP) y no compila TypeScript al vuelo.

---

## 2. Solución creada para HestiaCP

Se ha generado un paquete de despliegue completo que no requiere configurar Node.js en HestiaCP:
1. **`dist/`:** Contiene toda la aplicación ya compilada en JavaScript estándar, HTML y CSS optimizados.
2. **`index.php`:** Script de entrada PHP que sirve la aplicación y los assets con las cabeceras MIME correctas y soporte directo en HestiaCP.
3. **`.htaccess`:** Reglas para Apache que dirigen el tráfico y activan la compresión.
4. **`glow-party-hestia-deploy.zip`:** Archivo ZIP listo para subir y descomprimir directamente en HestiaCP.

---

## 3. Pasos para subirlo a HestiaCP

1. Accede a tu panel de **HestiaCP** y abre el **Administrador de Archivos** (File Manager).
2. Dirígete a la carpeta raíz de tu dominio:
   `/home/tu_usuario/web/tu_dominio.com/public_html/`
3. Si tienes los archivos de la subida anterior que no funcionaban, elimínalos o vacía el directorio.
4. Sube el archivo:
   **`glow-party-hestia-deploy.zip`**
5. Haz clic derecho sobre el archivo en el Administrador de Archivos y pulsa **Extraer** (Unpack / Extract).
6. ¡Listo! Abre tu dominio en el navegador (`https://tu_dominio.com`) y la web cargará inmediatamente.

---

## 4. Diagnóstico del Servidor

Puedes comprobar el estado del servidor accediendo a:
`https://tu_dominio.com/?node_info`

Devolverá un JSON con la versión de PHP, el estado de los archivos y la confirmación de que la compilación está en línea.
