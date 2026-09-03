// src/services/db/orders.service.ts
import { db } from '@/lib/db'
import type { Order, OrderItem, OrderNote } from '@prisma/client'

export interface OrderWithRelations extends Order {
  items: OrderItem[]
  notes: OrderNote[]
}

export interface CreateOrderInput {
  customer: {
    name: string
    lastName: string
    email: string
    phone: string
    documentType?: string
    documentNumber?: string
  }
  shipping: {
    address: string
    address2?: string
    city: string
    department: string
    postalCode?: string
    notes?: string
    cost: number
    carrier?: string
    trackingNumber?: string
  }
  items: Array<{
    productId: string
    slug: string
    name: string
    image?: string
    unitPrice: number
    quantity: number
    customization?: Record<string, string>
  }>
  payment: {
    method: 'wompi' | 'whatsapp' | 'cash' | 'other'
    reference: string
    amount: number
    currency?: string
  }
  subtotal: number
  total: number
}

function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
  return `PAP-${year}${month}-${random}`
}

export async function createOrder(data: CreateOrderInput): Promise<OrderWithRelations> {
  const order = await db.order.create({
    data: {
      number: generateOrderNumber(),
      status: data.payment.method === 'wompi' ? 'pending' : 'pending',
      customerName: data.customer.name,
      customerLastName: data.customer.lastName,
      customerEmail: data.customer.email,
      customerPhone: data.customer.phone,
      customerDocumentType: data.customer.documentType,
      customerDocumentNumber: data.customer.documentNumber,
      shippingAddress: data.shipping.address,
      shippingAddress2: data.shipping.address2,
      shippingCity: data.shipping.city,
      shippingDepartment: data.shipping.department,
      shippingPostalCode: data.shipping.postalCode,
      shippingNotes: data.shipping.notes,
      shippingCost: data.shipping.cost,
      shippingCarrier: data.shipping.carrier,
      shippingTrackingNumber: data.shipping.trackingNumber,
      paymentMethod: data.payment.method,
      paymentStatus: 'pending',
      paymentReference: data.payment.reference,
      paymentAmount: data.payment.amount,
      paymentCurrency: data.payment.currency || 'COP',
      subtotal: data.subtotal,
      total: data.total,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          image: item.image,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          customization: item.customization,
        })),
      },
    },
    include: {
      items: true,
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })

  return order
}

export async function getOrders(): Promise<OrderWithRelations[]> {
  return db.order.findMany({
    include: {
      items: true,
      notes: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrderById(id: string): Promise<OrderWithRelations | null> {
  return db.order.findUnique({
    where: { id },
    include: {
      items: true,
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function getOrderByNumber(number: string): Promise<OrderWithRelations | null> {
  return db.order.findUnique({
    where: { number },
    include: {
      items: true,
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  return db.order.update({
    where: { id },
    data: { status },
  })
}

export async function updateOrderPaymentStatus(
  id: string,
  paymentStatus: string,
  additionalData?: {
    wompiTransactionId?: string
    paidAt?: Date
    failureReason?: string
  }
): Promise<Order> {
  return db.order.update({
    where: { id },
    data: {
      paymentStatus,
      ...additionalData,
      status: paymentStatus === 'approved' ? 'paid' : undefined,
    },
  })
}

export async function updateOrderShipping(
  id: string,
  data: {
    carrier?: string
    trackingNumber?: string
    shippedAt?: Date
    deliveredAt?: Date
  }
): Promise<Order> {
  return db.order.update({
    where: { id },
    data,
  })
}

export async function addOrderNote(orderId: string, text: string): Promise<OrderNote> {
  return db.orderNote.create({
    data: {
      orderId,
      text,
    },
  })
}

export async function deleteOrder(id: string): Promise<void> {
  await db.order.delete({ where: { id } })
}

export async function getOrderStats() {
  const [total, pending, paid, shipped, delivered] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: 'pending' } }),
    db.order.count({ where: { paymentStatus: 'approved' } }),
    db.order.count({ where: { status: 'shipped' } }),
    db.order.count({ where: { status: 'delivered' } }),
  ])

  const revenue = await db.order.aggregate({
    _sum: { total: true },
    where: { paymentStatus: 'approved' },
  })

  return {
    total,
    pending,
    paid,
    shipped,
    delivered,
    revenue: revenue._sum.total || 0,
  }
}
