# PAPELILLO — Fase 3: Shop Funcional + Animaciones Premium

Esta fase se centra en **conectar el Admin con la tienda pública** y en **dar vida a la experiencia visual** de la Home.

## ✅ Problemas resueltos

### 1. `/shop` ahora muestra los productos reales
Antes era un placeholder. Ahora es una **tienda completamente funcional** que usa la misma fuente de datos que el admin.

### 2. Fuente única de datos
```
ADMIN → products.service.ts (localStorage) → HOOKS → SHOP / HOME / DETAIL
```
Si creas, editas o eliminas un producto desde el admin, el cambio se refleja inmediatamente en todas las páginas públicas.

### 3. Home con vida
El Hero y la sección "HECHO A TU MANERA" ahora tienen animaciones inspiradas en papel, stickers y recortes.

---

## 🛍️ Shop funcional (`/shop`)

### Características
- **Catálogo dinámico**: usa `useActiveProducts()` (reactivo al admin)
- **Filtros**:
  - Por categoría (tabs con colores)
  - Toggle: solo personalizables
  - Toggle: solo disponibles
  - Rango de precio máximo
- **Búsqueda** en tiempo real (nombre, descripción, tags)
- **Ordenamiento**: más recientes, populares, precio ↑↓, nombre A–Z
- **Estados de UI**: loading (skeletons), empty, error, success
- **Responsive**: drawer de filtros en mobile, sidebar en desktop
- **URL reactiva**: los filtros se reflejan en la URL (`?category=...&q=...&sort=...`)

### Componentes creados
- `src/components/shop/ShopControls.tsx` — búsqueda, sorting, tabs, toggles, drawer mobile
- `src/components/shop/ProductSkeleton.tsx` — skeleton loading

---

## 🎨 Animaciones de la Home

### Hero
- **Tarjetas flotantes orgánicas** con diferentes timings y rotaciones
- **Mouse tracking sutil**: los elementos se desplazan ligeramente siguiendo al cursor
- **Mouse tilt** en la composición central (efecto 3D muy sutil)
- **Doodles que aparecen progresivamente** al cargar: estrellas, corazones, hojas de papel, squiggles
- **Título con highlights animados**: las palabras clave (IDEAS, ESPECIALES) tienen un subrayado dibujado a mano
- **Sticker tags** que se "pegan" a la composición
- **Marquee** con las palabras clave de la marca
- **Staggered text reveal**: eyebrow → título → descripción → botones → stats

### "HECHO A TU MANERA" (CustomHighlight)
- **Parallax sutil** en las tarjetas al hacer scroll
- **Entrada staggered**: las tarjetas caen desde arriba como piezas de papel colocadas sobre una mesa
- **Hover interactivo**: cada tarjeta se eleva, rota y crece ligeramente
- **Enlaces a productos reales**: si el admin tiene el producto activo, la tarjeta enlaza a `/product/[slug]`
- **Doodles animados** de fondo (corazones, estrellas) que aparecen cuando la sección entra en viewport

### Galería
- **Masonry editorial** con entrada staggered tipo "drop-in"
- **Hover**: elevación + sombra sticker + pequeño scale

### CTA final
- **Decoraciones animadas** al entrar en viewport
- **Papelillos decorativos** dispersos con rotaciones

### Instagram
- **Mockup de posts** con colores de marca y rotaciones
- **Hover**: se enderezan y crecen

### Categorías
- **Doodles únicos** por color de categoría
- **Entrada staggered**

---

## 📄 Product Detail (`/product/[slug]`)

Actualizado para usar `productsService.getProductBySlug()` (datos vivos del admin).

### Nuevas features
- **Breadcrumb** de navegación
- **Quantity selector** para productos por unidad
- **Total dinámico** cuando priceType = "perUnit"
- **Dimensiones** visualizadas con icono
- **Features** dinámicas del admin (array de características)
- **Productos relacionados** de la misma categoría
- **CTA inteligente**:
  - Producto cotizable → "Solicitar cotización"
  - Producto personalizable → "Personalizar" (lleva al configurador con producto preseleccionado)
  - Producto estándar → "Agregar al carrito" + WhatsApp

---

## ⚙️ Configurador de Personalización

### Nueva feature: pre-selección por URL
El configurador ahora acepta un query parameter `?producto=[slug]`.
Si un producto personalizable existe con ese slug, se abre directamente en el paso de configuración.

**Ejemplo**: `/crear-mi-producto?producto=invitaciones-digitales`

Esto permite que el botón "Personalizar" en el Product Detail lleve al configurador con el producto ya seleccionado.

---

## 🎭 Nuevas animaciones (Tailwind config)

### Keyframes
- `float-gentle` — movimiento orgánico multi-eje con rotación variable
- `float-paper` — flotación tipo papel sobre una mesa
- `wiggle-soft` — wobble sutil
- `drop-in` — entrada desde arriba con rebote (como una pieza de papel que cae)
- `scale-in` — zoom suave
- `draw-line` — trazo progresivo SVG
- `sticker-peel` — efecto de sticker que se despega y aparece
- `shimmer` — skeleton loading

### CSS utilities
- `.skeleton` — fondo shimmer para loading states
- `.paper-card` / `.sticker-hover` — hover con sombra offset
- `.paper-texture` — overlay de ruido sutil
- `.hand-underline` — subrayado dibujado a mano
- `.stagger-children` — animación secuencial de hijos
- `.hide-scrollbar` — oculta scrollbar en carruseles
- `@media (prefers-reduced-motion: reduce)` — respeta preferencia de accesibilidad

---

## 🔧 Hooks y servicios actualizados

### `useActiveProducts()` / `useActiveCategories()`
Ahora son la **fuente única** para:
- `/shop`
- Home (FeaturedProducts, CategoryGrid, CustomHighlight)
- Product Detail
- Configurator
- CartContext (cálculo de subtotal)

### CartContext
Actualizado para usar `productsService.getAllProducts()` en lugar del array estático.

---

## 🧪 Verificación

### Prueba crítica de Admin → Shop
1. Ve a `/admin/products/new` → crea un producto
2. Ve a `/shop` → verifica que aparece
3. Edita el precio desde `/admin/products/[id]` → verifica que cambia en `/shop`
4. Desactiva el producto → verifica que desaparece
5. Reactiva → verifica que vuelve

### Prueba de Product Detail
1. Haz clic en un producto desde `/shop`
2. Verifica que abre `/product/[slug]` con los datos correctos
3. Verifica el breadcrumb
4. Verifica productos relacionados

### Prueba de configurador
1. Desde Product Detail, haz clic en "Personalizar" (en un producto personalizable)
2. Verifica que el configurador abre con el producto preseleccionado
3. Completa el flujo y verifica que el mensaje de WhatsApp incluye todos los datos

### Prueba de animaciones
1. Recarga `/` → observa la entrada progresiva del Hero
2. Mueve el mouse sobre la composición → observa el parallax sutil
3. Haz scroll hasta "HECHO A TU MANERA" → observa las tarjetas caer
4. Haz hover sobre las tarjetas → observa la elevación y rotación
5. Activa "Reducir movimiento" en tu sistema → verifica que las animaciones se desactivan

---

## 📋 Archivos modificados

```
tailwind.config.ts           — nuevas keyframes y animaciones
globals.css                  — skeletons, utilities, reduce-motion

src/app/shop/
  page.tsx                   — tienda funcional completa (nueva)
  layout.tsx                 — metadata del shop

src/app/product/[slug]/
  page.tsx                   — usa service, quantity, related
  layout.tsx                 — metadata

src/app/crear-mi-producto/
  page.tsx                   — Suspense wrapper

src/components/home/
  Hero.tsx                   — animaciones premium
  CustomHighlight.tsx        — parallax + staggered entry
  FeaturedProducts.tsx       — usa useActiveProducts
  CategoryGrid.tsx           — usa useActiveCategories
  Gallery.tsx                — scroll-reveal
  CTASection.tsx             — scroll-reveal
  InstagramSection.tsx       — scroll-reveal

src/components/shop/
  ShopControls.tsx           — filtros, búsqueda, sorting, drawer
  ProductSkeleton.tsx        — loading states

src/components/customizer/
  Configurator.tsx           — query param support

src/context/
  CartContext.tsx            — usa productsService
```

---

## 🚀 Próximos pasos sugeridos (Fase 4)

- [ ] Conectar productos con imágenes reales (upload al admin)
- [ ] Carrito completo (checkout flow)
- [ ] Stripe/PayPal integration
- [ ] Email notifications (Resend)
- [ ] Panel de pedidos completo
- [ ] CMS avanzado (home sections editables)
- [ ] Migración a base de datos real (Supabase / Prisma)
