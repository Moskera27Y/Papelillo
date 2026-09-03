# PAPELILLO — Fase 2: Admin + Configurador

## 🎯 Resumen de lo implementado

Esta fase añade al proyecto existente (sin destruir nada de la Fase 1):

### 🛠️ Panel Administrativo (`/admin`)
- **Login seguro** con SHA-256 y sesión temporal
- **Dashboard** con estadísticas: productos totales/activos/agotados, solicitudes nuevas/en revisión, mensajes sin leer
- **Gestión de productos** completa:
  - Crear / editar / duplicar / desactivar / eliminar
  - Información general (nombre, slug, descripción, categoría)
  - Precio (fijo, desde, por unidad, cotización)
  - Imágenes (upload con drag & drop, reordenar, eliminar)
  - Dimensiones (alto, ancho, profundidad, unidad)
  - Características dinámicas
  - Stock (mínimo, máximo, disponible)
  - **Personalización**: definir campos que el cliente verá (texto, número, select, radio, checkbox, fecha, archivo, imagen)
  - Opción "Otro" en selects/radios para detectar solicitudes fuera de catálogo
- **Gestión de categorías**: CRUD completo con color y orden
- **Solicitudes de personalización**: ver todas las solicitudes enviadas desde el configurador, cambiar estado, agregar notas, contactar por WhatsApp
- **Mensajes de contacto**: inbox con estados (nuevo, leído, respondido)
- **Home editable**: hero, sección personalizada, CTA final, footer
- **Nosotros editable**: título, historia, misión, visión, valores dinámicos
- **Contacto editable**: email, WhatsApp, teléfono, dirección, horarios
- **Redes sociales**: agregar/eliminar enlaces a Instagram, Facebook, TikTok, etc.
- **Configuración**: SEO, branding, cambio de usuario y contraseña

### 🎨 Configurador Público (`/crear-mi-producto`)
- **Flujo en 3 pasos**:
  1. Elegir producto personalizable
  2. Configurar opciones (campos dinámicos definidos por el admin)
  3. Resumen + datos de contacto + envío
- **Campos dinámicos**: text, textarea, number, select, radio, checkbox, date, file, image
- **Opción "Otro"**: cuando el cliente elige "Otro", se muestra un campo de texto para especificar
- **Detección de solicitudes fuera de catálogo**: si el cliente elige "Otro" en alguna opción, se marca como `isOutOfCatalog`
- **Cálculo de precio estimado**: si el producto tiene precio fijo o por unidad, se calcula automáticamente
- **Envío a WhatsApp**: construye un mensaje con todos los detalles y lo envía al número configurado
- **Registro en el sistema**: cada solicitud se guarda en el admin para seguimiento

### 🔌 Arquitectura
- **Servicio de datos**: capa de abstracción sobre `localStorage` que permite CRUD completo
- **Persistencia**: todos los cambios del admin se guardan en `localStorage` y persisten entre sesiones
- **Eventos reactivos**: los hooks escuchan cambios y refrescan automáticamente
- **Autenticación cliente**: SHA-256 + sesión temporal (8 horas)
- **Credenciales por defecto**: `admin` / `papelillo2026` (cambiables desde `/admin/settings`)

### 🔗 Integraciones
- **CustomHighlight** (sección "Hecho a tu manera") ahora enlaza a `/crear-mi-producto`
- **Footer** incluye un enlace sutil "Admin" en la parte inferior
- **WhatsApp**: todas las solicitudes se envían al número configurado en `/admin/contact`

---

## 🚀 Cómo usar

### 1. Acceder al admin
```
http://localhost:3000/admin
```

Credenciales por defecto:
- **Usuario**: `admin`
- **Contraseña**: `papelillo2026`

⚠️ **Cambia estas credenciales** desde `/admin/settings` antes de publicar el sitio.

### 2. Crear un producto personalizable
1. Ve a `/admin/products` → "Nuevo producto"
2. Completa la información general, precio, imágenes
3. Activa **"Este producto es personalizable"**
4. Agrega campos de personalización:
   - Nombre interno: `theme`
   - Etiqueta: `Temática`
   - Tipo: `select`
   - Opciones: `Cumpleaños`, `Baby shower`, `Bautizo`
   - Permitir "Otro": ✅
5. Guarda y publica

### 3. Configurar WhatsApp
1. Ve a `/admin/contact`
2. Ingresa tu número de WhatsApp con código de país (sin `+`): `573001234567`
3. Guarda cambios

### 4. Probar el configurador
1. Ve a `/crear-mi-producto`
2. Elige un producto personalizable
3. Completa los campos
4. Envía la solicitud → se abrirá WhatsApp con todos los detalles

---

## 📁 Estructura de archivos nuevos

```
src/
├── types/
│   └── admin.ts                    # Tipos extendidos para admin
├── services/
│   ├── storage.ts                  # Capa de abstracción sobre localStorage
│   ├── events.ts                   # Pub/Sub para cambios reactivos
│   ├── ids.ts                      # Generador de IDs únicos
│   ├── auth.service.ts             # Autenticación (login, logout, cambio de contraseña)
│   ├── products.service.ts         # CRUD de productos
│   ├── categories.service.ts       # CRUD de categorías
│   ├── requests.service.ts         # CRUD de solicitudes de personalización
│   ├── messages.service.ts         # CRUD de mensajes de contacto
│   ├── site.service.ts             # Contenido editable y configuración
│   └── index.ts                    # Barrel export
├── hooks/
│   └── useDataService.ts           # Hooks reactivos para consumir servicios
├── components/
│   ├── admin/
│   │   ├── AuthGuard.tsx           # Wrapper que redirige si no hay sesión
│   │   ├── AdminSidebar.tsx        # Sidebar del admin
│   │   ├── StatCard.tsx            # Tarjeta de estadística
│   │   ├── AdminUI.tsx             # Componentes UI reutilizables (Input, Select, Toggle, etc.)
│   │   ├── ProductEditor.tsx       # Editor completo de producto
│   │   └── FieldBuilder.tsx        # Editor de listas de opciones
│   └── customizer/
│       ├── Configurator.tsx        # Configurador paso a paso
│       ├── DynamicField.tsx        # Renderiza cualquier tipo de campo
│       └── whatsapp-builder.ts     # Construye el mensaje de WhatsApp
└── app/
    ├── admin/
    │   ├── layout.tsx              # Layout del admin
    │   ├── login/page.tsx          # Página de login
    │   ├── page.tsx                # Dashboard
    │   ├── products/
    │   │   ├── page.tsx            # Listado de productos
    │   │   ├── new/page.tsx        # Crear producto
    │   │   └── [id]/page.tsx       # Editar producto
    │   ├── categories/page.tsx     # Gestión de categorías
    │   ├── requests/
    │   │   ├── page.tsx            # Listado de solicitudes
    │   │   └── [id]/page.tsx       # Detalle de solicitud
    │   ├── messages/page.tsx       # Inbox de mensajes
    │   ├── home/page.tsx           # Editar home
    │   ├── about/page.tsx          # Editar nosotros
    │   ├── contact/page.tsx        # Editar contacto
    │   ├── social/page.tsx         # Editar redes sociales
    │   └── settings/page.tsx       # Configuración general
    └── crear-mi-producto/
        └── page.tsx                # Configurador público
```

---

## ⚠️ Limitaciones y próximos pasos

### Base de datos
Actualmente **todos los datos se guardan en `localStorage`** del navegador. Esto significa:
- ✅ Funciona perfectamente para desarrollo y pruebas
- ❌ No persiste entre dispositivos
- ❌ No es seguro para producción

**Para producción, reemplaza los servicios con una base de datos real:**
- **Supabase** (PostgreSQL + auth + storage)
- **Firebase** (Firestore + auth + storage)
- **Prisma + PostgreSQL/MySQL** (self-hosted)
- **PlanetScale** (MySQL serverless)

### Autenticación
La autenticación actual es **solo cliente** (SHA-256 en el navegador). Para producción:
- **NextAuth.js** (soporta Google, GitHub, credentials, etc.)
- **Clerk** (auth managed, fácil de integrar)
- **Auth0** (enterprise-grade)
- **Supabase Auth** (si usas Supabase)

### Subida de archivos
Las imágenes se guardan como **data URLs en localStorage**. Para producción:
- **Cloudinary** (CDN + transformación de imágenes)
- **AWS S3** (storage escalable)
- **Supabase Storage**
- **Firebase Storage**

### Hosting
El proyecto está listo para desplegar en:
- **Vercel** (recomendado para Next.js)
- **Netlify**
- **AWS Amplify**
- **Railway** / **Render** (si agregas backend)

---

## 🔧 Comandos útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Verificar tipos
npm run typecheck

# Linter
npm run lint
```

---

## 🎉 ¡Listo!

Tu sitio Papelillo ahora tiene:
- ✅ Panel administrativo completo
- ✅ Configurador inteligente de productos personalizados
- ✅ Sistema de solicitudes con seguimiento
- ✅ Integración con WhatsApp
- ✅ Arquitectura escalable para e-commerce

**Próximos pasos sugeridos:**
1. Agregar base de datos real (Supabase/Firebase)
2. Implementar carrito y checkout
3. Agregar pasarela de pagos (Stripe/PayPal)
4. Configurar dominio y desplegar en Vercel
5. Optimizar SEO y performance

¡Disfruta creando con Papelillo! 🎨✨
