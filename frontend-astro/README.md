# frontend-astro

Frontend en [Astro](https://astro.build) para el backend [carevalojesus/backend-nest](https://github.com/carevalojesus/backend-nest). Implementa el flujo completo de autenticación: registro, login y vista de perfil del usuario autenticado.

## Stack

- **Astro 6** (template `minimal`, TypeScript strict)
- **Tailwind CSS v4** vía `@tailwindcss/vite` (sin `tailwind.config.js`, todo desde el CSS)
- **`@lucide/astro`** para los iconos
- Cliente HTTP propio basado en `fetch` con tipos compartidos del backend
- JWT almacenado en `localStorage`

## Requisitos previos

- Node.js 22.12+
- El backend [backend-nest](https://github.com/carevalojesus/backend-nest) corriendo (por defecto en `http://localhost:3000`)

## Instalación

```bash
npm install
```

## Configuración

Copia el ejemplo y ajusta si tu backend está en otra URL:

```bash
cp .env.example .env
```

```env
PUBLIC_API_URL=http://localhost:3000
```

> Astro expone al cliente solo las variables con prefijo `PUBLIC_`. El backend a su vez debe permitir CORS desde este origen (en `backend-nest/.env` configura `CORS_ORIGIN=http://localhost:4321`).

## Scripts

```bash
npm run dev      # dev server en http://localhost:4321
npm run build    # build estático en ./dist
npm run preview  # sirve el build estático para verificarlo localmente
```

## Páginas

| Ruta        | Descripción                                                                              |
| ----------- | ---------------------------------------------------------------------------------------- |
| `/`         | Landing con CTAs a `/login` y `/register`. Si hay token guardado, redirige a `/me`.     |
| `/login`    | Email + password. Al éxito guarda el token y redirige a `/me`.                          |
| `/register` | Formulario completo (email, password, nombres, apellidos, tipo y número de documento, teléfono y fecha de nacimiento opcionales). |
| `/me`       | Vista protegida (guard client-side). Llama `GET /auth/me` y muestra los datos del perfil. Incluye botón de cerrar sesión. |

Los guards de cliente:
- Si entras a `/me` sin token → te redirige a `/login`.
- Si entras a `/login` o `/register` con un token válido → te redirige a `/me`.
- Si el backend responde `401` en `/me` (token expirado o usuario eliminado) → limpia el token y redirige a `/login`.

## Estructura del proyecto

```
src/
├── layouts/
│   ├── Layout.astro            Layout base (HTML + CSS global)
│   └── AuthLayout.astro        Layout centrado para formularios de auth
├── components/
│   ├── Field.astro             Input con label, hint y estados de focus
│   ├── Select.astro            Select estilizado
│   └── Alert.astro             Banner para errores y mensajes de éxito
├── pages/
│   ├── index.astro             /
│   ├── login.astro             /login
│   ├── register.astro          /register
│   └── me.astro                /me
├── lib/
│   └── api.ts                  Cliente HTTP tipado + ApiError + helpers de token
└── styles/
    └── global.css              @import "tailwindcss";
```

## Cliente API (`src/lib/api.ts`)

Endpoints expuestos como métodos tipados:

```ts
import { api, auth, ApiError } from "../lib/api";

// Registro
const { accessToken } = await api.register({
  email, password, firstName, lastName,
  documentType: "DNI", documentNumber: "12345678",
  phone, birthDate,                  // opcionales
});

// Login
const { accessToken } = await api.login({ email, password });

// Perfil del usuario autenticado
const me = await api.me(token);      // { id, email, profile }
```

Manejo del token:

```ts
auth.saveToken(accessToken);          // guarda en localStorage
auth.getToken();                      // recupera o null
auth.clearToken();                    // logout
auth.requireAuth();                   // redirige a /login si no hay token
auth.redirectIfAuthenticated();       // redirige a /me si ya hay token
```

Errores: `ApiError` captura `status` y `messages[]`, así puedes mostrar las validaciones del backend tal cual:

```ts
try {
  await api.login(payload);
} catch (err) {
  if (err instanceof ApiError) {
    err.messages.forEach(showError);  // ej. ["El email no es válido"]
  }
}
```

## Diseño

Inspirado en los principios del libro **Refactoring UI**:

- Una sola tinta acento (indigo-600); fondos y textos en tonos slate (grises tibios).
- Jerarquía tipográfica fuerte: títulos semibold, labels en `sm`, hints en `xs gray-500`.
- Bordes sutiles y `shadow-sm`/`shadow-xs` en lugar de sombras pesadas.
- Focus ring de 4px en el tono claro del primary para accesibilidad visible.
- Botón primario lleno + secundario outline (un solo botón llamativo por sección).
- Estados disabled explícitos durante los submits.
- Mensajes de error como banner suave, no como `alert()`.

## Notas

- **Producción:** `localStorage` es vulnerable a XSS. Para un proyecto real, conviene que el backend emita el token como cookie `httpOnly` `Secure` `SameSite=Strict` y eliminar el uso de `localStorage` aquí.
- **Tailwind v4:** ya no necesita `tailwind.config.js` ni `postcss.config.js`. Las personalizaciones (colores, breakpoints, fuentes) se declaran en `global.css` con `@theme { ... }`.
- **Iconos:** importa solo los que uses (`import { LogOut } from "@lucide/astro"`), se renderizan como SVG inline en el HTML estático.
