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
- `src/features/services`: fichas de servicio, numerales relacionados y formularios generales.
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
| `/servicios/:servicio` | Público | Detalle del servicio, numerales cambiarios y accesos a formulario y asesoría |
| `/servicios/:servicio/formulario` | Cuenta autenticada | Formularios de servicios, inversiones y endeudamiento; los envíos quedan vinculados a la cuenta |
| `/catalogo` | Público | Búsqueda y paginación del catálogo |
| `/contacto` | Público | Formulario de contacto; si hay sesión iniciada, la solicitud queda asociada a la cuenta |
| `/login` y `/registro` | Público | Autenticación |
| `/admin` | Público (ingreso); administrador autenticado (panel) | Consultar solicitudes paginadas/filtrables, registrar cuentas y subir imágenes de catálogo a Supabase Storage |
| `/importaciones` y `/exportaciones` | Cuenta autenticada | Formularios especializados; guardan la interacción ligada al usuario y numeral |
| `/mis-interacciones` | Cuenta autenticada | Elegir entre iniciar un formulario y consultar formularios y solicitudes guardadas en la cuenta |
| `/admin/interacciones` | Administrador | Consultar todas las interacciones |

El primer administrador se configura desde el backend mediante las variables `SEED_ADMIN_*` y `npm run db:seed`. Por seguridad, el registro de administradores desde `/admin` solo está disponible para una sesión administrativa autenticada.

La carga de imágenes del catálogo se realiza desde el panel de administración seleccionando un numeral y subiendo un archivo JPG, PNG o WebP (máximo 5 MB). El backend lo guarda en un bucket público de Supabase Storage y almacena en PostgreSQL la URL generada; no acepta una URL escrita en el formulario. Configura las credenciales de almacenamiento exclusivamente en el backend.

Las fichas de servicio muestran los numerales de importaciones, exportaciones, inversiones, endeudamiento y servicios/transferencias que expone la API, separados en pestañas de ingresos y egresos. Los numerales de servicios/transferencias provienen del Anexo 3 del DCIP-83 aportado (actualizado al 1 de septiembre de 2021); confirma la vigencia normativa antes de usarlos para una operación real. Para diligenciar cualquier formulario, el cliente debe iniciar sesión o crear una cuenta. Los formularios de servicios se guardan como solicitudes vinculadas al usuario, y los de importaciones/exportaciones como interacciones vinculadas al usuario y al numeral; ambos tipos se consultan en Mis solicitudes. El botón de asesoría conserva su flujo de contacto público.

## Validación

```powershell
npm run lint
npm run build
```

## Despliegue

En Vercel, configura la raíz del proyecto como directorio y define `NEXT_PUBLIC_API_HOST` con la URL pública del backend. Configura esa URL del frontend en `CORS_ORIGINS` del backend. Nunca incluyas credenciales de base de datos o `JWT_SECRET` en las variables públicas del frontend.

## Uso de herramientas de IA

Se usó asistencia de IA para estructurar las capas del backend, preparar componentes por feature, integrar los formularios con la API y redactar documentación inicial. El código generado se ajustó tras los chequeos de TypeScript, ESLint, compilación y solicitudes HTTP locales: entre otras correcciones, se alinearon los claims del JWT, se vinculó cada interacción con su numeral y se corrigieron errores de prerenderizado y dependencias de efectos de React. La revisión manual y las verificaciones descritas en este README siguen siendo necesarias antes de un despliegue.
