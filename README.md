# ColComex Web

Frontend de ColComex, una plataforma de asesoría en comercio exterior (importaciones, exportaciones, inversiones, endeudamiento externo y servicios). Permite consultar el catálogo público de numerales cambiarios, diligenciar formularios de operación y hojas de datos mínimos de declaración de cambio, enviar solicitudes de asesoría y, para administradores, gestionar el catálogo y revisar la actividad de los usuarios.

Construido con Next.js 16 (App Router), React 19, TypeScript estricto y Tailwind CSS 4. Consume la API REST de `proyecto-comex-backend` (contrato en el README del backend).

## Despliegue

| Componente           | URL                                                  |
| -------------------- | ---------------------------------------------------- |
| Frontend (Vercel)    | Pendiente del primer despliegue                      |
| Backend (API)        | Pendiente del despliegue                             |
| Repositorio frontend | https://github.com/cindy1204/proyecto-comex-frontend |
| Repositorio backend  | https://github.com/cindy1204/proyecto-comex-backend  |

### Publicar el frontend en Vercel

1. Publica los cambios aprobados en GitHub y conecta la rama de producción acordada con el equipo.
2. En [Vercel](https://vercel.com), elige **Add New → Project** e importa `cindy1204/proyecto-comex-frontend`.
3. En **Settings → Environment Variables**, configura `NEXT_PUBLIC_API_HOST` con la URL pública del backend, sin `/api` ni una barra final.
4. Ejecuta **Deploy**. Al finalizar, Vercel genera la URL pública del frontend (por ejemplo, `https://nombre-del-proyecto.vercel.app`); copia la URL real en la tabla anterior.
5. Verifica que el frontend pueda comunicarse con el backend. El backend debe tener habilitado en `CORS_ORIGINS` el dominio real de Vercel.

`NEXT_PUBLIC_API_HOST` se incluye en el build del frontend. Debe apuntar a un backend ya desplegado y accesible antes de compilar; después de cambiarlo se requiere un nuevo despliegue. Las URLs de producción siguen pendientes hasta completar y verificar los despliegues.

## Reparto del trabajo

| Componente | Responsabilidades                                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend   | Interfaz Next.js, navegación, autenticación en cliente, formularios, catálogo, solicitudes, experiencia adaptable y descarga en PDF de los formularios oficiales (importación y exportación) y de hojas de datos mínimos no oficiales (servicios, inversiones y endeudamiento). |
| Backend    | API REST, autenticación y roles, validación, persistencia PostgreSQL/Prisma, migraciones, seed de prueba, catálogo e integración con el frontend.                                                                                                                               |

Esta tabla describe la división técnica por repositorio; el equipo puede agregar los nombres de quienes asumieron cada parte.

## Instalación y ejecución

Requisitos: Node.js 22 o superior y el backend en ejecución (por defecto en `http://localhost:3001`).

```bash
npm install
cp .env.example .env.local   # ajusta NEXT_PUBLIC_API_HOST si el backend no está en localhost:3001
npm run dev                  # http://localhost:3000
```

Para producción: `npm run build && npm run start`.

| Script                            | Función                             |
| --------------------------------- | ----------------------------------- |
| `npm run typecheck`               | `tsc --noEmit`                      |
| `npm test` / `test:watch`         | Vitest (pruebas unitarias)          |
| `npm run lint` / `lint:fix`       | ESLint (Next, TypeScript, jsx-a11y) |
| `npm run format` / `format:check` | Prettier                            |
| `npm run build` / `start`         | Compilación y servidor productivo   |

### Variables de entorno

| Variable               | Obligatoria       | Descripción                                                                                                                    |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_API_HOST` | Sí, en producción | Origen del backend **sin** el sufijo `/api` (el cliente lo antepone). En desarrollo, si falta, se usa `http://localhost:3001`. |

Es una variable `NEXT_PUBLIC_*`: se incrusta al compilar, así que debe definirse antes de `npm run build`. No se versiona ningún `.env` real; solo `.env.example`.

## Pruebas

Las pruebas usan [Vitest](https://vitest.dev) (misma versión que el backend), entorno `node`, y viven en `tests/unit/*.test.ts`. El alias `@` apunta a `src`, como en `tsconfig.json`. La configuración está en `vitest.config.mts`. Los archivos de `tests/` no forman parte del bundle de Next: `next build` solo compila lo que importan las rutas de `src/app`.

```bash
npm test             # una pasada (vitest run)
npm run test:watch   # modo interactivo
```

Cubren únicamente lógica de dominio pura (sin DOM ni red); no hay pruebas de componentes ni de extremo a extremo.

| Archivo                          | Qué verifica                                                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `routes.test.ts`                 | `isPrivatePath`, `isAdminPath`, `isGuestOnlyPath` (prefijos parecidos, barra final, rutas `…/declaracion` de servicios) y `resolvePostAuthPath` por rol y `returnTo`.                     |
| `safe-path.test.ts`              | Rechazo de redirecciones abiertas (`//evil.com`, `/\evil`, URLs absolutas) en `toSafeInternalPath` y `toOptionalSafePath`.                                                                |
| `jwt.test.ts`                    | `isJwtExpired` con reloj inyectado (vigente, vencido, sin `exp`, malformado) y decodificación UTF-8 del payload.                                                                          |
| `id.test.ts`                     | `isCuid`: longitudes límite, mayúsculas y símbolos.                                                                                                                                       |
| `menu.test.ts`                   | Ítems del menú que ve el visitante, el usuario y el administrador; etiquetas existentes en ambos idiomas.                                                                                 |
| `catalog-form.test.ts`           | `validateCatalogInput`: campos obligatorios, límites de longitud, dirección e imagen (formato y tamaño); `readCatalogForm`.                                                               |
| `locale.test.ts`                 | `parseAcceptLanguage` (pesos `q`, regiones) y `resolveLocale` (cookie, cabecera, valor por defecto).                                                                                      |
| `translate.test.ts`              | `createTranslator`: claves anidadas, interpolación, plurales y clave inexistente.                                                                                                         |
| `dictionaries.test.ts`           | `es.ts` y `en.ts` tienen exactamente las mismas claves, los mismos parámetros `{nombre}` y variantes plurales completas.                                                                  |
| `decimal.test.ts`                | `normalizeDecimal` y `parseDecimal` (coma o punto decimal; rechaza signos, notación exponencial y vacíos), redondeo half-up a centavos y `formatCents`.                                   |
| `calculate-dollar-total.test.ts` | Valor en dólares (monto × tasa) con aritmética decimal exacta; entradas con coma o inválidas.                                                                                             |
| `net-reintegro.test.ts`          | Reintegro neto (FOB + gastos − deducciones) en centavos y la validación de deducciones que superan la base.                                                                               |
| `pdf-text.test.ts`               | `toPdfText`: caracteres que la fuente estándar del PDF no dibuja se sustituyen por `?`; conserva saltos de línea y elimina caracteres de control.                                         |
| `declaration-form.test.ts`       | Familias de declaración (servicios, inversiones, endeudamiento), campos del formulario frente al contrato `strict` del backend, validación, lectura de datos y `suggestedDocuments` nulo. |
| `declaration-pdf.test.ts`        | `declarationRows` (orden de campos, guion para vacíos, numeral con título), `declarationPdfContent` y `createDeclarationPdf` (A4, varias páginas, emoji y CJK sin fallar).                |
| `validation.test.ts`             | Validación de correo, inicio de sesión, registro y alta de administradores.                                                                                                               |

## Credenciales de prueba

Usuarios creados por el seed del backend.

| Rol           | Correo                 | Contraseña     |
| ------------- | ---------------------- | -------------- |
| Administrador | `admin@colcomex.com`   | `Admin#2026`   |
| Usuario       | `usuario@colcomex.com` | `Usuario#2026` |

## Funcionalidades

- **Catálogo público** (`/catalogo`): listado paginado con filtros combinables (categoría, tipo ingreso/egreso, búsqueda con espera de escritura, rango de fechas de creación), estados de carga, vacío y error, tarjetas con imagen y respaldo cuando falta o falla. Detalle en `/catalogo/[id]` con `notFound()`.
- **Catálogo (administración)**: tabla con filtro de estado (`Activos`, `Eliminados`, `Todos`), alta y edición en un modal con validación en cliente y errores por campo del backend, subida real de imagen (JPG, PNG o WebP de hasta 5 MB, con vista previa), eliminación lógica con confirmación y restauración.
- **Interacciones**: el usuario crea formularios de importación y exportación y descarga el formulario oficial diligenciado en PDF. También registra declaraciones de cambio de servicios, inversiones y endeudamiento (campos de datos mínimos) y descarga una hoja de apoyo en PDF marcada como no oficial; en `/mis-interacciones` los lista, filtra por tipo y fechas, consulta, edita y elimina. Los montos aceptan coma o punto decimal; el valor en dólares y el reintegro neto (FOB + gastos − deducciones, solo en exportaciones) se calculan en centavos con redondeo half-up, y el formulario avisa si el neto es negativo. En el PDF, los caracteres que la fuente estándar no dibuja se sustituyen por `?`. Tras guardar, el formulario se limpia para una nueva captura. El administrador ve el listado global con filtros por tipo, usuario (ID) y fechas, consulta el usuario de cada registro y puede eliminar.
- **Solicitudes de contacto** (`/contacto`): formulario público (con sesión, la solicitud queda asociada al usuario) con monto estimado opcional en USD. En `/mis-solicitudes` el usuario las lista, edita y elimina; el administrador las revisa globalmente con filtros por servicio, búsqueda y fechas.
- **Servicios** (`/servicios`, `/servicios/[servicio]`): contenido informativo, numerales relacionados y enlace al formulario correspondiente. Los servicios de declaración (servicios, inversiones y endeudamiento) enlazan además a `/servicios/[servicio]/declaracion`, que exige sesión. Un servicio inexistente responde un 404 real (ver Notas técnicas).
- **Panel de administración** (`/admin`): pestañas Catálogo, Interacciones, Solicitudes y Administradores (alta de nuevos administradores). Los totales de cada pestaña se leen de `pagination.total` de los propios listados (`limit=1`), sin endpoints adicionales.
- **Experiencia común**: tablas que se convierten en tarjetas en móvil, barra de filtros con "Limpiar filtros", selector de tamaño de página, mensajes de éxito y error anunciados a lectores de pantalla (`aria-live`), botones con estado de carga que evitan envíos dobles, modo claro y oscuro.

## Arquitectura

`src/app` solo compone: cada `page.tsx` monta componentes de `src/features`. La lógica vive en features con capas `domain` (tipos y reglas puras), `services` (llamadas a la API), `hooks` y `components`. El flujo de dependencias es componentes → hooks → services; solo `common/services/http.ts` llama a `fetch`.

```
src/
  proxy.ts                 protección de rutas en el servidor
  app/                     rutas, layout, not-found, error, loading, globals.css (tokens)
  features/
    common/                config, utils, hooks, componentes UI reutilizables, services/http.ts
    auth/                  sesión, login, registro
    dashboard/             guards, reglas de acceso por ruta, menú por rol
    layout/                header responsive, footer, marca
    home/                  landing informativa
    catalog/               catálogo público y administración (CRUD, imagen, restauración)
    interactions/          formularios de importación/exportación y declaraciones de datos mínimos: alta, listado, edición, borrado
    contact/               solicitudes de contacto: formulario, listado, edición, borrado
    services/              contenido estático de servicios, formulario genérico y declaración de datos mínimos
    admin/                 panel con pestañas, totales y alta de administradores
    i18n/                  idiomas: diccionarios es/en, `t()`, proveedor, selector de idioma
```

El script `scripts/i18n-check.mjs` (`npm run i18n:check`) verifica los diccionarios; ver [Internacionalización](#internacionalización-es--en).

Reglas del proyecto: sin `any`, sin `console.*`, estilos con tokens semánticos de Tailwind (`bg-surface`, `text-muted-foreground`, `border-border`, `bg-primary`…) definidos en `globals.css`, modo oscuro por clase `.dark`.

### Piezas reutilizables (`features/common`)

- Componentes: `DataTable` (tabla/tarjetas), `FilterBar`, `DateRangeFields`, `PageSizeSelect`, `QueryFeedback` (carga, error y vacío), `Notice`, `Tabs`, `Pagination`, `Modal`, `ConfirmDialog`, `FileInput`, `Field`, `Alert`, `Badge`, `Card`, `Button`, `Loading`, `Spinner`, `EmptyState`, `PageHeader`.
- Hooks: `useAsyncData`, `useFormAction`, `usePagination` y `useClampPage`, `useDateRange`, `useDebounce`, `useNotice`, `useRemoveAction`.
- Cliente HTTP: `apiRequest<T>(path, {method, body, query, signal, auth})` antepone `/api`, adjunta el Bearer, acepta JSON o `FormData`, omite parámetros vacíos y lanza `ApiError` (`status`, `code`, `message`, `fieldErrors`). Es el único punto que trata el `401`: borra la sesión y emite `SESSION_EXPIRED_EVENT`.

## Internacionalización (es / en)

Idiomas: español (`es`, por defecto) e inglés (`en`). No hay segmentos `[locale]`: las URLs son las mismas en ambos idiomas y `proxy.ts` no cambia su lógica de acceso. Todo vive en `src/features/i18n/`, sin librerías externas.

**Cómo se resuelve el idioma** (en el servidor, en el layout raíz, para que `<html lang>` sea correcto desde el primer byte, sin parpadeo ni desajuste de hidratación):

1. Cookie `locale` (`es` | `en`), que escribe el selector de idioma (1 año, `SameSite=Lax`).
2. Cabecera `Accept-Language` (se respetan los pesos `q`; `en-US` cuenta como `en`).
3. `es`.

**Uso**

- Servidor: `const { t, locale, format } = await getTranslations()` (`services/get-translations.ts`).
- Cliente: `const { t, locale, format } = useTranslation()`, o `const { locale, setLocale, isPending } = useLocale()` para cambiar de idioma; el `I18nProvider` del layout raíz recibe el idioma ya resuelto.
- `t('catalog.title')`, con parámetros `t('layout.greeting', { name })` (placeholder `{name}`) y plurales `t('catalog.items', { count })`, que elige `catalog.items_one` / `catalog.items_other` con `Intl.PluralRules`. Las claves están tipadas: una clave inexistente falla en `npm run typecheck`.
- Fechas, números y moneda: `format` (`Intl` con `es-CO` / `en-US`), nunca formato manual.
- Selector accesible **ES | EN** en el header (escritorio) y en el menú móvil: guarda la cookie, llama a `router.refresh()` y el layout vuelve a renderizar con el nuevo `<html lang>`.
- Los dominios puros (validación de formularios, etiquetas) reciben `t` por parámetro; no importan React.

**Errores de la API**: `getErrorMessage(error, t)` traduce por `error.code` (`VALIDATION_ERROR`, `UNAUTHORIZED`, credenciales inválidas, `409`, `413`, `415`, `IMAGE_STORAGE_NOT_CONFIGURED`, red y tiempo de espera), luego por estado HTTP, y si el código no se conoce usa el mensaje del backend como respaldo.

**Qué no se traduce (por diseño)**

- Los valores técnicos que se envían al backend (tipos de interacción, categorías, direcciones, tipos de identificación como `'Cédula de ciudadanía'`): solo cambia la etiqueta visible.
- El contenido del catálogo que viene de la base de datos (código, título, descripción de cada numeral) sigue en español.
- Los mensajes de error por campo (`details`) del backend, que llegan en español y se muestran tal cual.
- El texto de la descripción que se guarda en la solicitud de servicio queda en español (es un dato persistido, no UI).
- No se traducen los nombres de idioma del selector (`Español`, `English`).

**Cómo agregar un idioma** (por ejemplo `pt`)

1. `domain/locale.ts`: añadir `'pt'` a `LOCALES` y su entrada en `INTL_LOCALES` (`pt-BR`) y `LOCALE_NAMES`.
2. Crear `dictionaries/pt.ts` con `export const pt: Messages = { ... }` (`import type { Messages } from './es'`): el compilador exige la misma forma que `es.ts`.
3. Registrarlo en `dictionaries/index.ts` (`DICTIONARIES`).
4. Si el idioma tiene más formas plurales que `one`/`other`, añadir las claves `_few`, `_many`… (el pluralizador usa `Intl.PluralRules`, solo hay que declararlas).
5. `npm run typecheck && npm run i18n:check`. El selector se genera a partir de `LOCALES`.

**`npm run i18n:check`** (sin dependencias, también se ejecuta dentro de `npm run lint`):

- Paridad: todos los diccionarios deben tener las mismas claves, los mismos parámetros `{x}` y la pareja `_one`/`_other`.
- Texto fijo: avisa de texto JSX y atributos (`label`, `title`, `placeholder`, `aria-label`…) que parezcan español en `src/features/**/components` y `src/app`. Se puede excluir una línea con un comentario `i18n-ignore`.
- Límites: es una heurística (tildes, `¿¡` y palabras vacías comunes). No detecta español sin tildes ni palabras vacías (por ejemplo `{'Cargando'}`), ni texto armado en código fuera de componentes, ni verifica la calidad de la traducción. Las claves usadas en `t('…')` las valida el compilador.

## Rutas

| Ruta                                     | Acceso        |
| ---------------------------------------- | ------------- |
| `/`                                      | Público       |
| `/catalogo`, `/catalogo/[id]`            | Público       |
| `/servicios`, `/servicios/[servicio]`    | Público       |
| `/contacto`                              | Público       |
| `/login`, `/registro`                    | Solo invitado |
| `/servicios/[servicio]/formulario`       | Autenticado   |
| `/servicios/[servicio]/declaracion`      | Autenticado   |
| `/importaciones`, `/exportaciones`       | Autenticado   |
| `/mis-interacciones`, `/mis-solicitudes` | Autenticado   |
| `/admin`, `/admin/interacciones`         | Administrador |

`/admin/interacciones` abre el panel directamente en la pestaña Interacciones.

La ruta de registro es `/registro` (equivale al `/register` de la rúbrica). El registro público siempre crea usuarios con rol `user`; el administrador solo existe por el seed.

## Protección de rutas

El JWT se guarda en `localStorage` (`colcomex-session`) y en las cookies `auth_token` y `auth_role` (no `HttpOnly`: las escribe el cliente y solo las lee el proxy para decidir redirecciones). La protección tiene tres capas; la autorización real la hace siempre el backend en cada endpoint.

1. **`src/proxy.ts`** (servidor): comprueba presencia y expiración del JWT y redirige antes de renderizar.
2. **Guards en cliente**: `AuthGuard`, `RoleGuard role="admin"` y `GuestGuard` protegen el contenido aunque se edite una cookie.
3. **Backend**: rechaza con `401`/`403` cualquier petición sin permiso.

Las reglas de acceso están en `dashboard/domain/routes.ts` y las comparten el proxy y los guards.

| Caso                                     | Resultado                           |
| ---------------------------------------- | ----------------------------------- |
| Ruta privada sin sesión                  | `/login?returnTo=<ruta>`            |
| Token vencido                            | `/login?returnTo=<ruta>&expirada=1` |
| `/admin` con rol distinto de `admin`     | `/`                                 |
| `/login` o `/registro` con sesión válida | `/`                                 |

Un `401` de la API cierra la sesión y los guards redirigen al login con `returnTo`.

## Notas técnicas

- El layout raíz lee la cookie de idioma, por lo que todas las rutas se renderizan por petición (`export const instant = false` en `app/layout.tsx` evita que esa lectura bloquee el build con `cacheComponents: true`). En ese modo Next no puede cambiar a 404 el estado HTTP desde `notFound()`, así que `proxy.ts` responde 404 (reescribiendo a una ruta inexistente, que muestra la página 404 traducida) para un servicio desconocido (`/servicios/xyz`) y para un id de catálogo con formato inválido. `/nada` y las demás rutas sin coincidencia devuelven 404 de forma nativa.
- `/catalogo/[id]` valida el formato del identificador antes de consultar el backend: un id con formato inválido responde 404 (lo resuelve `proxy.ts`); uno válido pero inexistente muestra la página de "no encontrado" (`notFound()`) con `noindex` y estado 200.
- El detalle público consulta al backend sin credenciales, por lo que no muestra numerales eliminados (ni siquiera a un administrador).
- Las rutas privadas sin sesión redirigen a `/login` desde `proxy.ts` antes de evaluar la página. Por eso `/servicios/exportaciones/formulario` sin sesión responde 307 (no 404); con sesión, un servicio que no usa el formulario genérico llama a `notFound()` y responde 404 real. `/servicios/[servicio]/declaracion` sigue la misma regla: un servicio sin declaración responde 404 con sesión. Un servicio inexistente (`/servicios/no-existe/formulario`) responde 404 real. El 404 con sesión para un servicio no genérico aún no se comprobó en un navegador.
- El formulario de solicitud de servicio usa las mismas reglas que el de contacto (campos y monto con coma o punto decimal).

## Limitaciones conocidas

- **Sesión en el cliente:** el JWT está en `localStorage` y en cookies no `HttpOnly`, así que un script inyectado (XSS) podría leer el token. Pasar a cookies `HttpOnly` exige rediseñar las rutas de autenticación; no está hecho.
- **Despliegue pendiente:** las URLs de producción de la tabla "Despliegue" no están verificadas. No hay un build desplegado para probar contra un backend real.
- **Equipo pendiente:** la tabla de reparto no incluye los nombres de quienes asumieron cada parte.
- **Datos mínimos sin especificación por campo:** el Anexo 1 de la DCIP-83 del Banco de la República no define los campos de datos mínimos de servicios, inversiones ni endeudamiento. La lista de campos y la hoja PDF son un núcleo común pendiente de confirmar con la fuente oficial. La hoja se marca como no oficial y no rellena una plantilla oficial.
- **Verificación:** `npm run build` compila sin errores; las comprobaciones de `i18n:check`, `typecheck`, `lint`, `test` y `format:check` pasan en local.

## Comprobaciones automáticas

`npm run i18n:check`, `npm run typecheck`, `npm run lint`, `npm test` y `npm run build`.
