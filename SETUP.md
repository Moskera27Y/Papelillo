# PAPELILLO — Guía de Configuración Rápida

## 🚀 Instalación y Primer Uso

### 1. Instalar dependencias

```bash
cd "C:\Users\user\Desktop\IA\PRUEBAS CON OTROS MODELOS\Pagina Kiara"
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 3. Build de producción

```bash
npm run build
npm start
```

---

## ⚙️ Configuración Inicial

### Logo

1. Reemplaza el archivo `public/images/logo.svg` con el logo oficial de Papelillo.
2. Mantén el nombre del archivo como `logo.svg` (no necesitas cambiar código).

### WhatsApp

Edita `src/lib/config.ts`:

```typescript
whatsappNumber: "573001234567", // Sin símbolo +, sin espacios
```

### Email

Edita `src/lib/config.ts`:

```typescript
email: "hola@papelillo.com",
```

### Redes Sociales

Edita `src/lib/config.ts`:

```typescript
instagramUrl: "https://instagram.com/papelillo",
facebookUrl: "https://facebook.com/papelillo",
tiktokUrl: "https://tiktok.com/@papelillo",
```

### Dirección y Horarios

Edita `src/lib/config.ts`:

```typescript
address: "Bogotá, Colombia",
hours: "Lun–Vie 9:00–18:00",
```

---

## 📸 Agregar Fotografías Reales

### Productos

1. Coloca las imágenes en `public/images/products/`
2. Edita `src/data/products.ts` y actualiza el campo `images` de cada producto:

```typescript
{
  id: "p-mini-libros",
  name: "Mini libros",
  images: ["/images/products/mini-libros-1.jpg", "/images/products/mini-libros-2.jpg"],
  // ... resto del producto
}
```

### Galería

Edita `src/components/home/Gallery.tsx` y reemplaza los `<div>` con `<img>` o componentes `<Image>` de Next.js.

---

## 📝 Editar Textos del Sitio

Edita `src/data/site-content.ts` para cambiar:

- Texto del Hero
- Descripciones de secciones
- Títulos de páginas
- Mensajes de CTA

---

## 🛍️ Agregar Nuevos Productos

Edita `src/data/products.ts` y agrega un nuevo objeto al array `products`:

```typescript
{
  id: "p-nuevo-producto",
  slug: "nuevo-producto",
  name: "Nuevo Producto",
  shortDescription: "Descripción corta",
  description: "Descripción completa del producto.",
  price: 5000,
  priceType: "fixed", // "fixed" | "from" | "perUnit" | "quote"
  currency: "COP",
  images: ["/images/products/nuevo.jpg"],
  category: "categoria-slug",
  specs: [
    { label: "Característica", value: "Valor" }
  ],
  stock: null,
  featured: true,
  isNew: true,
  isPopular: false,
  isCustomizable: false,
  requiresQuote: false,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

---

## 🎨 Cambiar Colores de Marca

Edita `tailwind.config.ts` y actualiza los valores en `theme.extend.colors.brand`.

---

## 🔍 Verificar el Build

Antes de desplegar:

```bash
npm run lint
npm run typecheck
npm run build
```

Corrige cualquier error que aparezca.

---

## 📦 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a [vercel.com](https://vercel.com)
2. Vercel detectará automáticamente que es un proyecto Next.js
3. Despliega con un clic

### Otros proveedores

- **Netlify**: Compatible con Next.js
- **Railway**: Soporte nativo para Next.js
- **DigitalOcean App Platform**: Funciona bien

---

## 🚧 Fase 2 — Próximos Pasos

Esta versión es la **Fase 1** (experiencia visual completa). La Fase 2 incluirá:

- **Base de datos** (productos, pedidos, clientes)
- **Panel Admin** (`/admin`)
- **Carrito funcional** con persistencia
- **Checkout** (Stripe / PayPal)
- **Sistema de inventario**
- **Gestión de pedidos**
- **CMS para contenido**

La arquitectura ya está preparada para estas integraciones sin romper lo existente.

---

## 📞 Soporte

Si encuentras errores o necesitas ayuda:

1. Revisa la consola del navegador (F12)
2. Revisa los logs de `npm run dev`
3. Consulta la documentación de [Next.js](https://nextjs.org/docs)
4. Consulta la documentación de [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ Checklist de Configuración

- [ ] Reemplacé el logo en `public/images/logo.svg`
- [ ] Configuré el número de WhatsApp en `src/lib/config.ts`
- [ ] Configuré el email en `src/lib/config.ts`
- [ ] Agregué las URLs de redes sociales
- [ ] Agregué la dirección y horarios
- [ ] Reemplacé las imágenes placeholder con fotos reales
- [ ] Edité los textos en `src/data/site-content.ts`
- [ ] Ejecuté `npm run build` sin errores
- [ ] Probé el sitio en móvil y desktop

---

¡Listo! Tu sitio de Papelillo está funcionando. 🎉
