# PAPELILLO — Papelería creativa

Sitio web profesional para la marca **Papelillo**: papelería creativa, personalizados, invitaciones, regalos, juegos y artículos con sello propio.

Esta es la **Fase 1**: experiencia visual completa y arquitectura escalable. La Fase 2 conectará base de datos, admin, carrito real, checkout y pagos.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **React 18**
- **Tailwind CSS 3**
- **Google Fonts** (Fredoka + Manrope)

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de producción
npm run lint    # lint
npm run typecheck
```

## Estructura

```
src/
  app/                 # Rutas (/, /shop, /product/[slug], /personalizados, /nosotros, /contacto, políticas)
  components/          # Componentes reutilizables
    ui/                # Button, Badge, SectionHeading, Doodles, ProductImage
    layout/            # Header, Footer, MobileMenu, WhatsAppButton
    products/          # ProductCard, ProductGrid, ProductPrice, ProductBadge, ProductGallery
    home/              # Hero, CategoryGrid, FeaturedProducts, CustomHighlight, Gallery, InstagramSection, CTASection
    forms/             # CustomProductForm, ContactForm
  context/             # CartContext (preparado para Fase 2)
  data/                # products.ts, categories.ts, site-content.ts
  lib/                 # utils.ts, config.ts
  types/               # Types globales (Product, Category, Cart, SiteContent)
  styles/              # globals.css
```

## Configuración de marca

- **Logo**: reemplaza `public/images/logo.svg` con el logo oficial (mantén el nombre del archivo).
- **Productos**: agrega imágenes reales en `public/images/products/` y actualiza `src/data/products.ts`.
- **Contacto / redes**: edita `src/lib/config.ts` (WhatsApp, Instagram, email, dirección).
- **Textos del sitio**: edita `src/data/site-content.ts` (hero, about, destacados).

## Arquitectura preparada para Fase 2

- `CartContext` listo para persistencia y backend.
- `Product.requiresQuote` y `Product.isCustomizable` definen flujos de compra.
- `CustomProductForm` prepara el payload para envío a una API.
- Rutas `/admin/*` y `/checkout/*` pueden agregarse sin tocar lo ya construido.

## Reglas de diseño

- No se usan todos los colores a la vez en áreas grandes.
- Fondo principal `#FFFDF9` (paper). Negro para texto. Colores de marca para acentos.
- Sticker-shadow (sombra dura offset) en lugar de blur-soft shadows.
- Composición editorial, asimétrica, con espacio negativo.
- Mobile-first: cada sección rediseñada para móvil, no solo escalada.
