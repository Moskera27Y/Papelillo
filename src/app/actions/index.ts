'use server'

import { revalidatePath } from 'next/cache'
import * as productService from '@/services/db/products.service'
import * as categoryService from '@/services/db/categories.service'
import * as orderService from '@/services/db/orders.service'
import * as requestService from '@/services/db/requests.service'
import * as messageService from '@/services/db/messages.service'
import * as siteService from '@/services/db/site.service'
import * as authService from '@/services/db/auth.service'
import { cookies } from 'next/headers'

// ============================================================
// AUTH
// ============================================================

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { success: false, error: 'Credenciales requeridas' }
  }

  const user = await authService.verifyCredentials(username, password)
  if (!user) {
    return { success: false, error: 'Credenciales inválidas' }
  }

  // Set session cookie
  const cookieStore = cookies()
  cookieStore.set('admin_session', JSON.stringify({
    userId: user.id,
    username: user.username,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000 // 8 hours
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60, // 8 hours
    path: '/',
  })

  return { success: true }
}

export async function logoutAction() {
  const cookieStore = cookies()
  cookieStore.delete('admin_session')
  return { success: true }
}

export async function getSessionAction() {
  const cookieStore = cookies()
  const session = cookieStore.get('admin_session')
  
  if (!session) return null
  
  try {
    const data = JSON.parse(session.value)
    if (data.expiresAt < Date.now()) {
      cookieStore.delete('admin_session')
      return null
    }
    return data
  } catch {
    return null
  }
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  
  const session = await getSessionAction()
  if (!session) return { success: false, error: 'No autorizado' }
  
  const user = await authService.verifyCredentials(session.username, currentPassword)
  if (!user) return { success: false, error: 'Contraseña actual incorrecta' }
  
  await authService.changePassword(user.id, newPassword)
  return { success: true }
}

export async function changeUsernameAction(formData: FormData) {
  const username = formData.get('username') as string
  if (!username || username.trim().length < 3) {
    return { success: false, error: 'El nombre debe tener al menos 3 caracteres' }
  }
  const session = await getSessionAction()
  if (!session) return { success: false, error: 'No autorizado' }
  await authService.changeUsername(session.userId, username)
  return { success: true }
}

// ============================================================
// PRODUCTS
// ============================================================

export async function getProductsAction() {
  return productService.getProducts()
}

export async function getActiveProductsAction() {
  return productService.getActiveProducts()
}

export async function getProductBySlugAction(slug: string) {
  return productService.getProductBySlug(slug)
}

export async function createProductAction(data: productService.CreateProductInput) {
  const product = await productService.createProduct(data)
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  revalidatePath('/')
  return product
}

export async function updateProductAction(data: productService.UpdateProductInput) {
  const product = await productService.updateProduct(data)
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  revalidatePath(`/product/${product.slug}`)
  revalidatePath('/')
  return product
}

export async function deleteProductAction(id: string) {
  await productService.deleteProduct(id)
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  revalidatePath('/')
  return { success: true }
}

export async function deleteOrderAction(id: string) {
  await orderService.deleteOrder(id)
  revalidatePath('/admin/orders')
  return { success: true }
}

export async function toggleProductActiveAction(id: string) {
  await productService.toggleProductActive(id)
  revalidatePath('/admin/products')
  revalidatePath('/shop')
  revalidatePath('/')
  return { success: true }
}

export async function duplicateProductAction(id: string) {
  const product = await productService.duplicateProduct(id)
  revalidatePath('/admin/products')
  return product
}

// ============================================================
// CATEGORIES
// ============================================================

export async function getCategoriesAction() {
  return categoryService.getCategories()
}

export async function getActiveCategoriesAction() {
  return categoryService.getActiveCategories()
}

export async function createCategoryAction(data: categoryService.CreateCategoryInput) {
  const category = await categoryService.createCategory(data)
  revalidatePath('/admin/categories')
  revalidatePath('/shop')
  revalidatePath('/')
  return category
}

export async function updateCategoryAction(id: string, data: Partial<categoryService.CreateCategoryInput>) {
  const category = await categoryService.updateCategory(id, data)
  revalidatePath('/admin/categories')
  revalidatePath('/shop')
  revalidatePath('/')
  return category
}

export async function deleteCategoryAction(id: string) {
  await categoryService.deleteCategory(id)
  revalidatePath('/admin/categories')
  revalidatePath('/shop')
  revalidatePath('/')
  return { success: true }
}

export async function toggleCategoryActiveAction(id: string) {
  await categoryService.toggleCategoryActive(id)
  revalidatePath('/admin/categories')
  revalidatePath('/shop')
  revalidatePath('/')
  return { success: true }
}

// ============================================================
// ORDERS
// ============================================================

export async function createOrderAction(data: orderService.CreateOrderInput) {
  const order = await orderService.createOrder(data)
  revalidatePath('/admin/orders')
  return order
}

export async function getOrdersAction() {
  return orderService.getOrders()
}

export async function getOrderByIdAction(id: string) {
  return orderService.getOrderById(id)
}

export async function getOrderStatsAction() {
  return orderService.getOrderStats()
}

export async function getRequestStatsAction() {
  return requestService.getRequestStats()
}

export async function updateOrderStatusAction(id: string, status: string) {
  await orderService.updateOrderStatus(id, status)
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  return { success: true }
}

export async function updateOrderPaymentStatusAction(
  id: string,
  paymentStatus: string,
  additionalData?: any
) {
  await orderService.updateOrderPaymentStatus(id, paymentStatus, additionalData)
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  return { success: true }
}

export async function updateOrderShippingAction(id: string, data: any) {
  await orderService.updateOrderShipping(id, data)
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  return { success: true }
}

export async function addOrderNoteAction(orderId: string, text: string) {
  await orderService.addOrderNote(orderId, text)
  revalidatePath(`/admin/orders/${orderId}`)
  return { success: true }
}

// ============================================================
// REQUESTS
// ============================================================

export async function createRequestAction(data: requestService.CreateRequestInput) {
  const request = await requestService.createRequest(data)
  revalidatePath('/admin/custom-requests')
  return request
}

export async function getRequestsAction() {
  return requestService.getRequests()
}

export async function getRequestByIdAction(id: string) {
  return requestService.getRequestById(id)
}

export async function updateRequestStatusAction(id: string, status: string) {
  await requestService.updateRequestStatus(id, status)
  revalidatePath('/admin/custom-requests')
  revalidatePath(`/admin/custom-requests/${id}`)
  return { success: true }
}

export async function addRequestNoteAction(requestId: string, text: string) {
  await requestService.addRequestNote(requestId, text)
  revalidatePath(`/admin/custom-requests/${requestId}`)
  return { success: true }
}

export async function deleteRequestAction(id: string) {
  await requestService.deleteRequest(id)
  revalidatePath('/admin/custom-requests')
  return { success: true }
}

// ============================================================
// MESSAGES
// ============================================================

export async function createMessageAction(data: messageService.CreateMessageInput) {
  const message = await messageService.createMessage(data)
  revalidatePath('/admin/contact')
  return message
}

export async function getMessagesAction() {
  return messageService.getMessages()
}

export async function updateMessageStatusAction(id: string, status: string) {
  await messageService.updateMessageStatus(id, status)
  revalidatePath('/admin/contact')
  return { success: true }
}

export async function deleteMessageAction(id: string) {
  await messageService.deleteMessage(id)
  revalidatePath('/admin/contact')
  return { success: true }
}

// ============================================================
// SITE SETTINGS
// ============================================================

export async function getSiteSettingsAction() {
  try {
    return await siteService.getSiteSettings()
  } catch (e: any) {
    console.error('[getSiteSettingsAction]', e?.message ?? e)
    return {
      id: 'main',
      brandName: 'Papelillo',
      tagline: 'Papelería creativa',
      whatsappNumber: '573185171163',
      email: 'hola@papelillo.co',
      phone: '',
      address: '',
      socialLinks: [],
      // fallbacks para los accesos directos en componentes admin
      contact: { whatsapp: '573185171163', email: 'hola@papelillo.co', phone: '', address: '' },
      seo: { title: 'Papelillo', description: '', keywords: '' },
      branding: { logoUrl: '/images/logo.png', favicon: '/favicon.svg' },
      wompi: { enabled: false, publicKey: '', privateKey: '' },
    } as any
  }
}

export async function getSiteContentAction() {
  try {
    const settings = await siteService.getSiteSettings()
    const content = await siteService.getSiteContent()
    // Combina settings de DB + content editable (JSON o null → seed fallback)
    const base = {
      brandName: content?.brandName ?? settings.brandName ?? "Papelillo",
      tagline: content?.tagline ?? settings.tagline ?? "Papelería creativa",
      footerDescription: content?.footerDescription ?? null,
      hero: content?.hero ?? {},
      customHighlight: content?.customHighlight ?? {},
      about: content?.about ?? { values: [] },
      personalized: content?.personalized ?? { steps: [] },
      ctaFinal: content?.ctaFinal ?? { badge: "", title: "", description: "", primaryCta: { label: "", href: "" }, secondaryCta: { label: "", href: "" } },
    } as any
    return base
  } catch (e: any) {
    console.error('[getSiteContentAction]', e?.message ?? e)
    return {
      brandName: 'Papelillo',
      tagline: 'Papelería creativa',
      footerDescription: null,
      hero: {},
      customHighlight: {},
      about: { values: [] },
      personalized: { steps: [] },
      ctaFinal: { badge: '', title: '', description: '', primaryCta: { label: '', href: '' }, secondaryCta: { label: '', href: '' } },
    } as any
  }
}

export async function updateSiteContentAction(data: Record<string, any>) {
  const result = await siteService.updateSiteContent(data)
  revalidatePath('/admin/home')
  return result
}

export async function updateSiteSettingsAction(data: any) {
  // ✅ Des-normaliza el draft UI → columnas Prisma planas
  // El draft tiene nesting: seo.{siteName,siteDescription,siteUrl,ogImage,keywords}
  // branding.{logoSrc,logoDataUrl,faviconSrc}, contact.{email,whatsapp,...}, socialLinks:[], wompi{}
  const flat: any = {
  id: data?.id ?? 'main',
    brandName: data?.brandName ?? 'Papelillo',
    tagline: data?.tagline ?? 'Papelería creativa',
    footerDescription: data?.footerDescription ?? null,
    // Contact (flat columns)
    contactEmail: data?.contact?.email ?? data?.contactEmail ?? null,
    contactWhatsapp: data?.contact?.whatsapp ?? data?.contactWhatsapp ?? null,
    contactWhatsappMsg: data?.contact?.text ?? data?.contactWhatsappMsg ?? null,
    contactPhone: data?.contact?.phone ?? data?.contactPhone ?? null,
    contactAddress: data?.contact?.address ?? data?.contactAddress ?? null,
    contactCity: data?.contact?.city ?? data?.contactCity ?? null,
    contactHours: data?.contact?.hours ?? data?.contactHours ?? null,
    contactText: data?.contact?.text ?? data?.contactText ?? null,
    // SEO (flat columns)
    seoSiteName: data?.seo?.siteName ?? data?.seoSiteName ?? data?.brandName ?? 'Papelillo',
    seoSiteDescription: data?.seo?.siteDescription ?? data?.seoSiteDescription ?? null,
    seoSiteUrl: data?.seo?.siteUrl ?? data?.seoSiteUrl ?? null,
    seoOgImage: data?.seo?.ogImage ?? data?.seoOgImage ?? null,
    seoKeywords: data?.seo?.keywords ?? data?.seoKeywords ?? [],
    // Branding (flat columns)
    logoSrc: data?.branding?.logoSrc ?? data?.logoSrc ?? '/images/logo.svg',
    logoDataUrl: data?.branding?.logoDataUrl ?? data?.logoDataUrl ?? null,
    faviconSrc: data?.branding?.faviconSrc ?? data?.faviconSrc ?? '/favicon.ico',
    // Wompi (flat columns)
    wompiEnabled: data?.wompi?.enabled ?? data?.wompiEnabled ?? false,
    wompiEnvironment: data?.wompi?.environment ?? data?.wompiEnvironment ?? 'production',
    wompiPublicKey: data?.wompi?.publicKey ?? data?.wompiPublicKey ?? null,
    wompiMerchantName: data?.wompi?.merchantName ?? data?.wompiMerchantName ?? null,
    wompiWebhookUrl: data?.wompi?.webhookUrl ?? data?.wompiWebhookUrl ?? null,
  };

  // Separar socialLinks (relación) del resto
  const links = data?.socialLinks;
  const result = await siteService.updateSiteSettings(flat);
  if (Array.isArray(links) && links.length > 0) {
    await siteService.updateSocialLinks(links.map((l: any) => ({
      name: l.name,
      url: l.url ?? '',
      icon: l.icon ?? '',
      isActive: l.isActive ?? true,
      order: l.order ?? 0,
    })));
  }
  revalidatePath('/admin/settings');
  revalidatePath('/');
  revalidatePath('/nosotros');
  revalidatePath('/contacto');
  return result;
}

export async function updateSocialLinksAction(links: any[]) {
  const settings = await siteService.updateSocialLinks(links)
  revalidatePath('/admin/settings')
  revalidatePath('/')
  return settings
}

export async function updateBrandingAction(data: any) {
  const settings = await siteService.updateBranding(data)
  revalidatePath('/admin/settings')
  revalidatePath('/')
  return settings
}

export async function updateWompiConfigAction(data: any) {
  const settings = await siteService.updateWompiConfig(data)
  revalidatePath('/admin/settings')
  return settings
}

// ============================================================
// STATS
// ============================================================

export async function getDashboardStatsAction() {
  const [productStats, orderStats, requestStats, messageStats] = await Promise.all([
    productService.getProductStats(),
    orderService.getOrderStats(),
    requestService.getRequestStats(),
    messageService.getMessageStats(),
  ])

  return {
    products: productStats,
    orders: orderStats,
    requests: requestStats,
    messages: messageStats,
  }
}
