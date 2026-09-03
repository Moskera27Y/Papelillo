# Arquitectura — Papelillo (Fase 1 + Fase 2)

## 🏗️ Estructura general

```
src/
├── app/                    # Rutas de Next.js 14 (App Router)
│   ├── (public)/           # Páginas públicas
│   │   ├── page.tsx        # Home
│   │   ├── shop/page.tsx   # Tienda
│   │   ├── product/[slug]/ # Detalle de producto
│   │   ├── personalizados/ # Página de personalizados
│   │   ├── crear-mi-producto/ # Configurador (Fase 2)
│   │   ├── nosotros/
│   │   ├── contacto/
│   │   └── (legal pages)
│   ├── admin/              # Panel administrativo (Fase 2)
│   │   ├── login/
│   │   ├── page.tsx        # Dashboard
│   │   ├── products/
│   │   ├── categories/
│   │   ├── requests/
│   │   ├── messages/
│   │   ├── home/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── social/
│   │   └── settings/
│   ├── layout.tsx          # Layout raíz (Header, Footer, WhatsAppButton)
│   └── globals.css
├── components/
│   ├── admin/              # Componentes del panel admin (Fase 2)
│   ├── customizer/         # Configurador público (Fase 2)
│   ├── forms/              # Formularios de contacto y personalizados
│   ├── home/               # Secciones de la home (Hero, CategoryGrid, etc.)
│   ├── layout/             # Header, Footer, WhatsAppButton
│   ├── products/           # ProductCard, ProductGrid, ProductPrice
│   └── ui/                 # Componentes UI base (Button, Badge, Doodles)
├── context/
│   └── CartContext.tsx     # Estado global del carrito
├── data/                   # Datos estáticos (semilla)
│   ├── products.ts
│   ├── categories.ts
│   └── site-content.ts
├── hooks/                  # Hooks personalizados (Fase 2)
│   └── useDataService.ts
├── lib/
│   ├── config.ts           # Configuración global
│   └── utils.ts             # Utilidades (cn, formatPrice, slugify)
├── services/               # Capa de servicios (Fase 2)
│   ├── storage.ts
│   ├── events.ts
│   ├── auth.service.ts
│   ├── products.service.ts
│   ├── categories.service.ts
│   ├── requests.service.ts
│   ├── messages.service.ts
│   └── site.service.ts
├── types/
│   ├── index.ts            # Tipos base (Fase 1)
│   └── admin.ts            # Tipos extendidos (Fase 2)
└── styles/
```

---

## 🔄 Flujo de datos

### Fase 1 (estática)
```
data/*.ts → components → páginas estáticas
```

### Fase 2 (dinámica con localStorage)
```
servicios (localStorage) → hooks reactivos → componentes → páginas
         ↑
         └── admin (CRUD)
```

---

## 🎨 Identidad visual

### Colores
- **Paper**: `#FFFDF9` (fondo principal)
- **Paper Soft**: `#FFF7E8` (fondos secundarios)
- **Ink**: `#0A0A0A` (texto principal)
- **Brand Red**: `#FF2B32`
- **Brand Yellow**: `#FFD000`
- **Brand Green**: `#78D64B`
- **Brand Blue**: `#5274E8`

### Tipografía
- **Display**: Fredoka (títulos, headings)
- **Body**: Manrope (texto, párrafos)

### Sombras
- **Sticker**: `4px 4px 0 0 rgba(10,10,10,0.9)` (offset, sin blur)
- **Sticker SM**: `3px 3px 0 0 rgba(10,10,10,0.85)`
- **Sticker LG**: `6px 6px 0 0 rgba(10,10,10,0.9)`

---

## 🔐 Autenticación (Fase 2)

### Flujo
1. Usuario visita `/admin`
2. `AuthGuard` verifica sesión en `localStorage`
3. Si no hay sesión → redirige a `/admin/login`
4. Login → SHA-256(password) → compara con hash almacenado
5. Si coincide → crea sesión temporal (8 horas) en `localStorage`
6. Sesión válida → acceso al dashboard

### Seguridad
- ⚠️ **Solo cliente**: no hay validación en servidor
- ⚠️ **localStorage es accesible** por JavaScript en el navegador
- ⚠️ **No apto para producción** sin backend real

**Para producción:**
- Migrar a NextAuth.js / Clerk / Auth0
- Validar sesión en servidor (middleware de Next.js)
- Usar cookies httpOnly en lugar de localStorage

---

## 📦 Modelos de datos

### Product (Fase 1)
```typescript
{
  id, slug, name, shortDescription, description,
  price, compareAtPrice, priceType, currency,
  images, category, tags, variants, specs,
  stock, featured, isNew, isPopular,
  isCustomizable, requiresQuote, isActive,
  customFields, createdAt, updatedAt, ctaLabel
}
```

### Product (Fase 2 — extendido)
```typescript
{
  // ... Fase 1
  subcategory,
  dimensions: { height, width, depth, unit, approximate },
  features: [{ id, text, order }],
  options: ProductOption[],
  minQuantity, maxQuantity,
  allowedFormats
}
```

### ProductOption (Fase 2)
```typescript
{
  id, productId, name, label, type,
  required, order, isActive,
  options: string[],
  allowOther, placeholder, defaultValue,
  min, max, accept
}
```

### CustomRequest (Fase 2)
```typescript
{
  id, status, origin,
  customer: { name, email, whatsapp },
  config: {
    productId, productName,
    values: Record<string, unknown>,
    quantity, dueDate, summary, attachments
  },
  estimatedPrice, estimatedPriceType,
  isOutOfCatalog, notes, createdAt, updatedAt
}
```

---

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```
Accede a `http://localhost:3000`

### Producción
```bash
npm run build
npm start
```

### Variables de entorno (futuro)
```env
# Base de datos
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://papelillo.com

# Storage
CLOUDINARY_URL=...

# Email
RESEND_API_KEY=...

# WhatsApp
WHATSAPP_NUMBER=573001234567
```

---

## 📈 Escalabilidad

### Fase 3 (futuro)
- **E-commerce completo**: carrito, checkout, pagos
- **Base de datos real**: Supabase / Firebase / Prisma
- **Panel admin avanzado**: roles, permisos, auditoría
- **Integraciones**: email marketing, analytics, CRM
- **Multi-idioma**: i18n con next-intl
- **Blog / contenido**: CMS headless (Sanity, Contentful)

---

## 🧪 Testing (recomendado)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Linter
npm run lint

# Type check
npm run typecheck
```

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Supabase](https://supabase.com/docs)
- [NextAuth.js](https://next-auth.js.org)

---

**Última actualización**: Fase 2 completada ✅
