# ColComex Web

Frontend de ColComex con Next.js App Router, React, TypeScript y Tailwind CSS. La aplicación consume el backend REST de [proyecto-comex-backend](https://github.com/cindy1204/proyecto-comex-backend).

## Requisitos

- Node.js 20.9 o superior y npm.
- El backend [proyecto-comex-backend](https://github.com/cindy1204/proyecto-comex-backend) configurado y ejecutándose en `http://localhost:3001`.

## Desarrollo local

1. Instala las dependencias desde este directorio:

   ```powershell
   npm install
   ```

2. Copia `.env.example` a `.env.local` y ajusta `NEXT_PUBLIC_API_HOST` si la API usa otra dirección.
3. Inicia el servidor de desarrollo:

   ```powershell
   npm run dev
   ```

   Abre `http://localhost:3000`.

## Organización

- `src/app`: páginas y rutas del App Router.
- `src/features/auth`: inicio de sesión, registro, contexto de usuario y protección visual de rutas.
- `src/features/catalog`: búsqueda, filtros y paginación del catálogo.
- `src/features/contact`: formulario público de contacto.
- `src/features/interactions`: formularios autenticados de importación/exportación y consulta de solicitudes.
- `src/lib/api.ts`: cliente HTTP compartido, manejo de respuestas y errores.

## Sesión y seguridad

El token se guarda en `localStorage` para conservar la sesión entre visitas y se elimina al cerrar sesión o al recibir una respuesta `401`. El frontend protege las vistas según el rol para la experiencia de usuario; la autorización real se valida nuevamente en el backend para cada endpoint.

`localStorage` es accesible desde JavaScript y, por tanto, un riesgo ante vulnerabilidades XSS. No se debe almacenar información secreta en el cliente; para una aplicación pública se recomienda migrar la sesión a cookies `HttpOnly`, `Secure` y `SameSite` administradas por el servidor.

Al iniciar sesión, el frontend guarda el JWT emitido por `/api/auth/login` y lo envía en el encabezado `Authorization: Bearer`. Una respuesta `401` elimina la sesión y redirige al acceso; una respuesta `403` se muestra como falta de permisos. El backend sigue siendo la autoridad y valida ambos casos en cada endpoint privado.

## Rutas principales

| Ruta | Acceso | Función |
|---|---|---|
| `/` | Público | Inicio y servicios |
| `/catalogo` | Público | Búsqueda y paginación del catálogo |
| `/contacto` | Público | Formulario de contacto; si hay sesión iniciada, la solicitud queda asociada a la cuenta |
| `/login` y `/registro` | Público | Autenticación |
| `/admin` | Público (ingreso); administrador autenticado (panel) | Consultar contactos y registrar administradores |
| `/importaciones` y `/exportaciones` | Cuenta autenticada | Guardar una interacción ligada al usuario y numeral |
| `/mis-interacciones` | Cuenta autenticada | Consultar interacciones propias y solicitudes de contacto enviadas con sesión iniciada |
| `/admin/interacciones` | Administrador | Consultar todas las interacciones |

El primer administrador se configura desde el backend mediante las variables `SEED_ADMIN_*` y `npm run db:seed`. Por seguridad, el registro de administradores desde `/admin` solo está disponible para una sesión administrativa autenticada.

## Validación

```powershell
npm run lint
npm run build
```

## Despliegue

En Vercel, configura la raíz del proyecto como directorio y define `NEXT_PUBLIC_API_HOST` con la URL pública del backend. Configura esa URL del frontend en `CORS_ORIGINS` del backend. Nunca incluyas credenciales de base de datos o `JWT_SECRET` en las variables públicas del frontend.

## Uso de herramientas de IA

Se usó asistencia de IA para estructurar las capas del backend, preparar componentes por feature, integrar los formularios con la API y redactar documentación inicial. El código generado se ajustó tras los chequeos de TypeScript, ESLint, compilación y solicitudes HTTP locales: entre otras correcciones, se alinearon los claims del JWT, se vinculó cada interacción con su numeral y se corrigieron errores de prerenderizado y dependencias de efectos de React. La revisión manual y las verificaciones descritas en este README siguen siendo necesarias antes de un despliegue.
