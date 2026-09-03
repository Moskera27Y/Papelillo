# 🎨 FASE 4 — E-commerce y Wompi

**Fecha:** Septiembre 2026
**Proyecto:** Papelillo — Papelería creativa

---

## 🎯 Resumen ejecutivo

La Fase 4 convierte a Papelillo en un **e-commerce funcional** con integración de pagos Wompi (pasarela colombiana), sin destruir nada de lo existente.

### Problemas resueltos
1. ✅ **Carrito 404 solucionado** — Ahora existe un `CartDrawer` lateral + página `/cart`
2. ✅ **Checkout completo** — Formulario de envío + pago Wompi o WhatsApp
3. ✅ **Pedidos reales** — CRUD completo en admin con estados y notas
4. ✅ **Wompi Sandbox/Producción** — Widget oficial, firma server-side, webhook
5. ✅ **Fondo animado "Mesa Creativa"** — Elementos flotantes sutiles
6. ✅ **Logo editable desde admin** — Upload sin tocar código

---

## 🛒 Carrito (soluciona el 404)

### Problema original
El `Header` enlazaba a `/cart` pero esa ruta no existía, causando 404.

### Solución
- **CartDrawer lateral**: Se abre al hacer clic en el icono del carrito.
- **Página `/cart`**: Alternativa full-page para navegación directa.
- **Persistencia**: localStorage bajo `papelillo-cart-v1`.
- **Reactividad**: Se actualiza automáticamente cuando cambian los productos.

### Archivos
```
src/components/cart/CartDrawer.tsx   ← Drawer lateral
src/app/cart/page.tsx                ← Página completa
src/context/CartContext.tsx          ← Context extendido (lines, increment, decrement)
```

---

## 💳 Checkout

### Flujo
1. **Datos de envío** (nombre, email, teléfono, dirección, ciudad...)
2. **Método de pago**:
   - **Wompi** (tarjetas, PSE, Nequi, Daviplata)
   - **WhatsApp** (coordinar pago alternativo)
3. **Confirmación** → `/checkout/success`

### Archivos
```
src/app/checkout/page.tsx           ← Checkout multi-paso
src/app/checkout/success/page.tsx   ← Confirmación del pedido
```

---

## 🏦 Wompi — Integración de pagos

### Arquitectura segura
```
Frontend                    Server (API)               Wompi
--------                    ------------               -----
Widget → Abre checkout ──────────────────────→ Carga widget
         ↓
Solicita firma ───→ /api/wompi/signature ──→ Genera SHA-256 (usa INTEGRITY_KEY)
         ↓                                     ↑
Abre widget de pago ─────────────────────────→ Procesa pago
         ↓                                     ↓
Redirige a /checkout/success                   Notifica a /api/wompi/webhook
         ↓                                     ↓
Muestra confirmación                  Actualiza pedido en DB
```

### Variables de entorno
Ver `.env.example`:
```
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_xxx      ← Frontend
NEXT_PUBLIC_WOMPI_ENVIRONMENT=sandbox          ← Frontend
WOMPI_PRIVATE_KEY=priv_test_xxx                ← SOLO server
WOMPI_INTEGRITY_KEY=xxx                        ← SOLO server
WOMPI_EVENTS_SECRET=evt_test_xxx               ← SOLO server (webhooks)
```

### Endpoints
- `POST /api/wompi/signature` — Genera firma HMAC-SHA256 (server-side, seguro)
- `POST /api/wompi/webhook` — Recibe eventos de Wompi y valida firma

### Widget
Se carga dinámicamente según el ambiente (sandbox/production):
- Sandbox: `https://checkout.sandbox.wompi.co/widget.js`
- Producción: `https://checkout.wompi.co/widget.js`

### ⚠️ Importante: Migración a DB real
Actualmente los pedidos viven en **localStorage** (client-side). Para producción real:
- Migrar a **Supabase**, **Prisma + PostgreSQL** o similar
- El webhook `/api/wompi/webhook` necesita escribir en la DB server-side
- La API route de webhook ya está preparada para esto

---

## 📦 Pedidos (Admin)

### Rutas
- `/admin/orders` — Lista con filtros y búsqueda
- `/admin/orders/[id]` — Detalle con productos, cliente, envío, notas, estados

### Estados de pedido
```
pending → paid → processing → ready → shipped → delivered
                                         ↓
                                    cancelled / refunded
```

### Estados de pago
```
pending → approved
       → declined
       → expired
       → refunded
```

### Features
- ✅ Cambio de estado manual
- ✅ Notas internas con timestamps
- ✅ Datos de envío (transportadora, tracking)
- ✅ Contacto directo por WhatsApp
- ✅ Eliminación con confirmación
- ✅ Estadísticas en dashboard

### Archivos
```
src/services/orders.service.ts     ← CRUD completo
src/app/admin/orders/page.tsx      ← Listado
src/app/admin/orders/[id]/page.tsx ← Detalle
src/hooks/useDataService.ts        ← useOrders(), useOrder(id)
```

---

## 🎨 Fondo animado "Mesa Creativa"

Elementos sutiles de papelería flotando alrededor del contenido:
- Hojas, estrellas, corazones
- Clips, trozos de papel
- Lápices, cintas adhesivas
- Squiggles, stickers con cara, sobres

### Características
- **12 elementos en móvil / 22 en desktop**
- **Movimientos orgánicos** (diferentes duraciones y velocidades)
- **Parallax sutil** al hacer scroll
- **Reacción al mouse** (muy ligera)
- **Reduce-motion** respetado
- **Performance**: usa `transform` y `opacity` (GPU-friendly)

### Archivo
```
src/components/layout/CreativeBackground.tsx
```

---

## ⚙️ Configuración del Admin

### Nueva sección: Marca y Logo
- Upload de logo (PNG, JPG, WEBP, SVG, máx 2MB)
- Preview en vivo
- Se almacena como Data URL en `SiteSettings.branding.logoDataUrl`
- Fallback a URL estática si no hay upload

### Nueva sección: Pagos — Wompi
- Toggle para habilitar/deshabilitar
- Selector de ambiente (Sandbox / Producción)
- Campo para llave pública (frontend)
- Campo para nombre comercial
- Estado de credenciales secretas (solo muestra si están en .env)
- Botón "Probar configuración" (valida firma server-side)

### Archivo
```
src/app/admin/settings/page.tsx  ← Ampliado con Logo + Wompi
```

---

## 🧪 Cómo probar

### 1. Carrito
```bash
# En /shop, haz clic en "Agregar" en cualquier producto
# Se abrirá automáticamente el CartDrawer
# Modifica cantidades, elimina productos
# Haz clic en "Finalizar compra"
```

### 2. Checkout (WhatsApp)
```bash
# En el carrito, "Finalizar compra"
# Completa el formulario de envío
# Elige "Coordinar por WhatsApp"
# Se abrirá WhatsApp con el mensaje prellenado
```

### 3. Wompi Sandbox
Requiere configurar `.env.local`:
```
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_xxxxx
WOMPI_INTEGRITY_KEY=xxxxx
NEXT_PUBLIC_WOMPI_ENVIRONMENT=sandbox
```

Y en `/admin/settings`, habilitar Wompi y pegar la llave pública.

**Tarjetas de prueba Wompi Sandbox:**
- Visa aprobada: `4111 1111 1111 1111`
- Visa rechazada: `4242 4242 4242 4242`
- Cualquier fecha futura, cualquier CVV

### 4. Ver pedido en admin
```bash
# Ve a /admin/orders
# El pedido aparecerá con estado "pending" y pago "pending" o "approved"
# Cambia el estado del pedido y agrega notas
```

### 5. Verificar fondo animado
```bash
# Ve a /
# Observa los elementos flotantes (hojas, estrellas, clips...)
# Haz scroll para ver el parallax
# Mueve el mouse para ver reacción sutil
```

### 6. Cambiar logo desde admin
```bash
# /admin/settings → "Marca y logo"
# Sube un nuevo logo (PNG/JPG/SVG)
# Guarda
# El header se actualiza automáticamente
```

---

## 📂 Archivos creados/modificados

### Nuevos
```
.env.example                                       ← Variables de entorno
src/types/admin.ts                                 ← Ampliado con Order, Wompi
src/services/orders.service.ts                     ← CRUD de pedidos
src/services/wompi.service.ts                      ← Cliente Wompi
src/components/cart/CartDrawer.tsx                 ← Drawer del carrito
src/components/layout/CreativeBackground.tsx       ← Fondo animado
src/app/cart/page.tsx                              ← Página /cart
src/app/checkout/page.tsx                          ← Checkout multi-paso
src/app/checkout/success/page.tsx                  ← Confirmación
src/app/api/wompi/signature/route.ts               ← API firma Wompi
src/app/api/wompi/webhook/route.ts                 ← Webhook Wompi
src/app/admin/orders/page.tsx                      ← Lista de pedidos
src/app/admin/orders/[id]/page.tsx                 ← Detalle pedido
```

### Modificados
```
src/types/admin.ts                                 ← Añadidos tipos
src/services/index.ts                              ← Exporta nuevos services
src/services/site.service.ts                       ← Añade wompi config
src/context/CartContext.tsx                        ← Más funciones (lines, increment...)
src/components/layout/Header.tsx                   ← Abre CartDrawer, usa logo admin
src/components/admin/AdminSidebar.tsx              ← Añade "Pedidos"
src/app/layout.tsx                                 ← Añade CartDrawer + fondo animado
src/app/admin/settings/page.tsx                    ← Añade Logo + Wompi
src/app/admin/page.tsx                             ← Stats de pedidos
src/hooks/useDataService.ts                        ← useOrders(), useOrder()
```

---

## ⚠️ Pendientes para producción

### Crítico
1. **Migrar a DB real** (Supabase / Prisma + PostgreSQL)
   - Los pedidos actualmente viven en localStorage
   - Los webhooks de Wompi necesitan escribir server-side
   - El carrito debería sincronizarse con DB en usuarios logueados

2. **Configurar credenciales de Wompi reales**
   - Solicitar en https://comercios.wompi.co
   - Configurar URL de webhook en el dashboard de Wompi
   - Cambiar `NEXT_PUBLIC_WOMPI_ENVIRONMENT` a `production`

3. **Autenticación real para admin**
   - Actual: SHA-256 client-side
   - Recomendar: NextAuth.js, Clerk o Auth0

### Recomendado
4. **Subida real de imágenes de productos** (S3 / Cloudinary)
5. **Emails de confirmación** (Resend / SendGrid)
6. **Cálculo de envío** (integración con API de transportadora)
7. **Cupones y descuentos**
8. **Panel de clientes** (historial de pedidos)

---

## 🔐 Seguridad

- ✅ Secretos Wompi **NUNCA** expuestos en frontend
- ✅ Firma de transacciones generada **server-side**
- ✅ Webhook valida firma HMAC-SHA256
- ✅ `hasServerSecrets` flag visible en admin
- ✅ Admin requiere login (AuthGuard)
- ✅ `robots: { index: false }` en admin

---

## 📊 Métricas

| Métrica | Fase 3 | Fase 4 |
|---|---|---|
| Páginas públicas | 12 | 15 (+/cart, /checkout, /checkout/success) |
| Rutas admin | 11 | 13 (+orders, orders/[id]) |
| API routes | 0 | 2 (signature, webhook) |
| Servicios | 6 | 8 (+orders, wompi) |
| Componentes cart | 0 | 1 (CartDrawer) |
| Modelos de datos | ~8 | ~15 (+Order, OrderItem, etc.) |

---

## 🎉 Resultado

Papelillo ahora es un **e-commerce funcional con**:
- ✅ Carrito persistente y visual
- ✅ Checkout multi-paso
- ✅ Pagos con Wompi (Sandbox listo)
- ✅ Pagos alternativos por WhatsApp
- ✅ Pedidos con estados, notas y tracking
- ✅ Logo editable desde admin
- ✅ Fondo animado sutil
- ✅ Identidad visual intacta

**¡Listo para configurar en producción!** 🚀
