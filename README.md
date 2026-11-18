# Beauty Party & Glow Party

Demo bilingüe para Terres de l’Ebre. El formulario prepara un resumen que se puede copiar y compartir por Instagram. La reserva se confirma personalmente.

## Vista previa local

```bash
npm ci
npm run dev
```

Ejecuta `npm run build` para verificar TypeScript y generar la versión estática en `dist/`. Ejecuta `npm run preview` para probar esa versión.

## Configuración

En `src/config.ts` puedes actualizar la marca, las actividades verificadas, el material autorizado y los canales de contacto. Las ilustraciones de la demo son originales. Para usar fotografías, registra el archivo, el tipo de fiesta y el texto alternativo en catalán y castellano en `authorizedMedia`.

Los tres packs se muestran como una propuesta comercial pendiente de validar. Completa `price`, `duration`, `participants`, `included` y `extras` en `config.packages` cuando el negocio confirme esa información. Las opiniones solo aparecen si se añaden a `config.testimonials` con `verified: true`.

Si el negocio confirma su número, añade `whatsappNumber` en formato internacional, solo dígitos. El enlace de WhatsApp abrirá el borrador para que la familia decida si lo envía. Para recibir consultas desde la propia web hace falta conectar un servicio de formularios o una API y gestionar las respuestas del servicio antes de activar confirmaciones de envío.
