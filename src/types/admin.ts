// ============================================================
// TIPOS DE ADMIN Y FASE 2/4 — PAPELILLO
// Extiende los tipos base (src/types/index.ts) sin tocarlos.
// ============================================================

export type Unit = "cm" | "mm" | "m";
export type FieldTypeExt =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "image"
  | "date";

export type RequestStatus =
  | "new"
  | "review"
  | "contacted"
  | "quoted"
  | "approved"
  | "completed"
  | "cancelled";

export type RequestOrigin = "configurator" | "contact-form" | "product-page" | "whatsapp";

// ---------- PRODUCT OPTIONS (configurables por el admin) ----------

export interface ProductOptionValue {
  id: string;
  label: string;
  /** Texto adicional si la opción elegida es "Otro" */
  isOther?: boolean;
  /** Ajuste de precio en COP (positivo o negativo) */
  priceAdjustment?: number;
  /** Si el valor no está disponible temporalmente */
  isAvailable?: boolean;
  order?: number;
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  /** Nombre legible del campo (label) */
  label: string;
  type: FieldTypeExt;
  required: boolean;
  order: number;
  isActive: boolean;
  /** Opciones predefinidas (para select/radio/checkbox) */
  options?: string[];
  /** Si la opción "Otro" está habilitada */
  allowOther?: boolean;
  /** Placeholder para inputs de texto */
  placeholder?: string;
  /** Valor por defecto */
  defaultValue?: string | number | boolean;
  /** Validaciones: cantidad mínima / máxima */
  min?: number;
  max?: number;
  /** Formatos aceptados para file (ej: ".jpg,.png,.pdf") */
  accept?: string;
}

// ---------- PRODUCTO EXTENDIDO ----------

export interface ProductDimensions {
  height?: number;
  width?: number;
  depth?: number;
  unit?: Unit;
  approximate?: boolean;
}

export interface ExtendedProductFields {
  subcategory?: string;
  dimensions?: ProductDimensions;
  features?: { id: string; text: string; order: number }[];
  options?: ProductOption[];
  minQuantity?: number;
  maxQuantity?: number;
  allowedFormats?: string[];
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number | null;
  compareAtPrice?: number | null;
  priceType: "fixed" | "from" | "perUnit" | "quote";
  currency: "COP";
  images: string[];
  category: string;
  tags?: string[];
  specs?: { label: string; value: string }[];
  stock: number | null;
  featured: boolean;
  isNew: boolean;
  isPopular: boolean;
  isCustomizable: boolean;
  requiresQuote: boolean;
  isActive: boolean;
  customFields?: Array<{
    id: string;
    label: string;
    type: FieldTypeExt;
    required?: boolean;
    options?: string[];
    placeholder?: string;
    hint?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  ctaLabel?: string;

  /** ----- Campos nuevos Fase 2 ----- */
  subcategory?: string;
  dimensions?: ProductDimensions;
  features?: { id: string; text: string; order: number }[];
  options?: ProductOption[];
  minQuantity?: number;
  maxQuantity?: number;
  allowedFormats?: string[];

  /** ----- Fase 4: control de compra ----- */
  /** Si el producto puede comprarse directamente (addToCart) */
  canBuy?: boolean;
  /** Costo base de envío opcional (COP) */
  shippingCost?: number;
  /** Peso aproximado en gramos (para cálculo de envío futuro) */
  weight?: number;
}

// ---------- CATEGORÍA EXTENDIDA ----------

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  color: "red" | "yellow" | "green" | "blue" | "ink";
  order: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// ---------- SOLICITUDES DE PERSONALIZACIÓN ----------

export interface CustomRequestCustomer {
  name: string;
  email: string;
  whatsapp: string;
}

export interface CustomRequestConfig {
  productId?: string;
  productName: string;
  values: Record<
    string,
    | string
    | number
    | boolean
    | string[]
    | { value: string; otherText?: string; fileName?: string }
  >;
  quantity: number;
  dueDate?: string;
  summary: Array<{ label: string; value: string }>;
  attachments?: Array<{ name: string; type: string; dataUrl?: string; size?: number }>;
}

export interface AdminNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface CustomRequest {
  id: string;
  status: RequestStatus;
  origin: RequestOrigin;
  customer: CustomRequestCustomer;
  config: CustomRequestConfig;
  estimatedPrice: number | null;
  estimatedPriceType: "fixed" | "from" | "quote";
  isOutOfCatalog: boolean;
  notes: AdminNote[];
  createdAt: string;
  updatedAt: string;
}

// ---------- MENSAJES DE CONTACTO ----------

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
}

// ============================================================
// FAASE 4 — PEDIDOS, PAGOS, ENVÍOS
// ============================================================

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "approved"
  | "declined"
  | "expired"
  | "refunded"
  | "error";

export type PaymentMethod = "wompi" | "whatsapp" | "cash" | "other";

export interface OrderCustomer {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  documentType?: string;
  documentNumber?: string;
}

export interface OrderShipping {
  address: string;
  address2?: string;
  city: string;
  department: string;
  postalCode?: string;
  notes?: string;
  /** Costo de envío en COP */
  cost: number;
  /** Transportadora (se usa en admin) */
  carrier?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image?: string;
  /** Precio por unidad (en el momento del pedido) */
  unitPrice: number;
  quantity: number;
  /** Snapshot de personalización si la hubiera */
  customization?: Record<string, string>;
}

export interface OrderPayment {
  method: PaymentMethod;
  status: PaymentStatus;
  /** Referencia única generada por nosotros */
  reference: string;
  /** ID de la transacción en Wompi (si aplica) */
  wompiTransactionId?: string;
  /** Monto pagado en COP */
  amount: number;
  currency: "COP";
  /** Timestamp de aprobación */
  paidAt?: string;
  /** Razón en caso de rechazo */
  failureReason?: string;
}

export interface Order {
  id: string;
  /** Número legible (ej: PAP-00001) */
  number: string;
  customer: OrderCustomer;
  shipping: OrderShipping;
  items: OrderItem[];
  payment: OrderPayment;
  /** Subtotal de productos (sin envío) */
  subtotal: number;
  /** Total incluyendo envío */
  total: number;
  status: OrderStatus;
  /** Notas internas del admin */
  notes: AdminNote[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// WOMPI — Configuración segura
// ============================================================

export interface WompiConfig {
  enabled: boolean;
  /** "sandbox" | "production" */
  environment: "sandbox" | "production";
  /** PUBLIC KEY (puede mostrarse en frontend) */
  publicKey: string;
  /** Nombre comercial mostrado en checkout Wompi */
  merchantName: string;
  /** Moneda fija */
  currency: "COP";
  /**
   * PRIVATE KEY e INTEGRITY KEY nunca deben guardarse aquí.
   * Se obtienen de process.env en API routes server-side.
   */
  /** Webhook URL pública (se muestra en admin como referencia) */
  webhookUrl?: string;
  /** Indica si las credenciales secretas están definidas en .env */
  hasServerSecrets: boolean;
}

// ============================================================
// SITE SETTINGS — extendido con branding y pagos
// ============================================================

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  isActive: boolean;
  order: number;
}

export interface ContactInfo {
  email: string;
  whatsapp: string;
  whatsappDefaultMessage: string;
  phone?: string;
  address?: string;
  city?: string;
  hours?: string;
  contactText?: string;
}

export interface HomeSection<T = unknown> {
  enabled: boolean;
  order: number;
  data: T;
}

export interface HeroData {
  title: string;
  titleAccent?: string[];
  description: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
  marqueeWords: string[];
}

export interface CustomHighlightData {
  eyebrow: string;
  title: string;
  description: string;
  cta: { label: string; href: string };
}

export interface AboutData {
  eyebrow: string;
  title: string;
  intro: string;
  values: Array<{
    id?: string;
    label: string;
    color: "red" | "yellow" | "green" | "blue";
    text: string;
  }>;
  mission?: string;
  vision?: string;
  story?: string;
}

export interface PersonalizedData {
  heroTitle: string;
  heroDescription: string;
  process: Array<{ step: string; title: string; description: string }>;
}

export interface CTAData {
  title: string;
  description: string;
  ctaPrimary: { label: string; href: string };
  ctaSecondary: { label: string; href: string };
}

export interface SiteContentEditable {
  brandName: string;
  tagline: string;
  hero: HeroData;
  customHighlight: CustomHighlightData;
  about: AboutData;
  personalized: PersonalizedData;
  ctaFinal: CTAData;
  footerDescription: string;
}

export interface SiteSettings {
  contact: ContactInfo;
  social: SocialLink[];
  seo: {
    siteName: string;
    siteDescription: string;
    siteUrl: string;
    ogImage?: string;
    defaultKeywords?: string[];
  };
  branding: {
    /** Ruta del logo (public o data URL) */
    logoSrc: string;
    /** Data URL del logo subido desde admin (opcional, tiene prioridad sobre logoSrc) */
    logoDataUrl?: string;
    faviconSrc: string;
  };
  /** Configuración pública de Wompi (los secretos viven en .env) */
  wompi: WompiConfig;
}

// ---------- AUTH ----------

export interface AdminUser {
  username: string;
  passwordHash: string;
}

export interface AdminSession {
  username: string;
  expiresAt: number;
}

// ---------- EVENTOS DE CAMBIO DE DATOS ----------

export type DataChannel =
  | "products"
  | "categories"
  | "requests"
  | "messages"
  | "site-content"
  | "settings"
  | "auth"
  | "orders";
