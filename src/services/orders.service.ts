// ============================================================
// ORDERS SERVICE — CRUD de pedidos (Fase 4).
// Persistencia: localStorage (migrable a DB real posteriormente).
// ============================================================

import type {
  Order,
  OrderItem,
  OrderCustomer,
  OrderShipping,
  OrderPayment,
  OrderStatus,
  PaymentStatus,
  AdminNote,
} from "@/types/admin";
import { storage } from "./storage";
import { emit } from "./events";
import { uid, nowISO } from "./ids";

const KEY = "orders";

export function getAllOrders(): Order[] {
  const list = storage.get<Order[] | null>(KEY, null);
  if (!list) return [];
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getOrderById(id: string): Order | undefined {
  return getAllOrders().find((o) => o.id === id);
}

export function getOrderByNumber(number: string): Order | undefined {
  return getAllOrders().find((o) => o.number === number);
}

export function getOrdersByPaymentRef(reference: string): Order | undefined {
  return getAllOrders().find((o) => o.payment.reference === reference);
}

export function getOrdersByStatus(status: OrderStatus): Order[] {
  return getAllOrders().filter((o) => o.status === status);
}

export function getOrdersByPaymentStatus(status: PaymentStatus): Order[] {
  return getAllOrders().filter((o) => o.payment.status === status);
}

/** Genera un número legible tipo PAP-00001 */
function nextOrderNumber(): string {
  const orders = getAllOrders();
  const maxNum = orders.reduce((max, o) => {
    const m = /^PAP-(\d+)$/.exec(o.number);
    if (!m) return max;
    const n = parseInt(m[1], 10);
    return n > max ? n : max;
  }, 0);
  return `PAP-${String(maxNum + 1).padStart(5, "0")}`;
}

/** Genera una referencia única para Wompi */
export function generateReference(): string {
  const rnd = Math.random().toString(36).slice(2, 10).toUpperCase();
  const ts = Date.now().toString(36).toUpperCase();
  return `PAP_${ts}_${rnd}`;
}

function save(list: Order[]): void {
  storage.set<Order[]>(KEY, list);
  emit("orders");
}

export interface CreateOrderInput {
  customer: OrderCustomer;
  shipping: OrderShipping;
  items: OrderItem[];
  paymentMethod: OrderPayment["method"];
  /** Monto total (productos + envío). Si no se pasa, se calcula. */
  total?: number;
}

/**
 * Crea un pedido. Por defecto queda con estado "pending" y payment.status "pending"
 * a menos que se indique otra cosa (ej: pedido por WhatsApp sin pago online).
 */
export function createOrder(input: CreateOrderInput): Order {
  const subtotal = input.items.reduce(
    (acc, it) => acc + it.unitPrice * it.quantity,
    0
  );
  const total = input.total ?? subtotal + input.shipping.cost;

  const payment: OrderPayment = {
    method: input.paymentMethod,
    status: input.paymentMethod === "whatsapp" || input.paymentMethod === "cash"
      ? "pending"
      : "pending",
    reference: generateReference(),
    amount: total,
    currency: "COP",
  };

  const order: Order = {
    id: uid("ord"),
    number: nextOrderNumber(),
    customer: input.customer,
    shipping: input.shipping,
    items: input.items,
    payment,
    subtotal,
    total,
    status: "pending",
    notes: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  const list = getAllOrders();
  list.unshift(order);
  save(list);
  return order;
}

export function updateOrder(
  id: string,
  patch: Partial<Omit<Order, "id" | "number" | "createdAt">>
): Order | null {
  const list = getAllOrders();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  const updated: Order = {
    ...list[idx],
    ...patch,
    id: list[idx].id,
    number: list[idx].number,
    createdAt: list[idx].createdAt,
    updatedAt: nowISO(),
  };
  list[idx] = updated;
  save(list);
  return updated;
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const order = getOrderById(id);
  if (!order) return null;

  const patch: Partial<Order> = { status };

  // Auto-manejar timestamps de envío/entrega
  if (status === "shipped" && !order.shipping.shippedAt) {
    patch.shipping = { ...order.shipping, shippedAt: nowISO() };
  }
  if (status === "delivered" && !order.shipping.deliveredAt) {
    const shippedAt = order.shipping.shippedAt ?? nowISO();
    patch.shipping = { ...order.shipping, shippedAt, deliveredAt: nowISO() };
  }

  return updateOrder(id, patch);
}

export function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
  extra?: {
    wompiTransactionId?: string;
    paidAt?: string;
    failureReason?: string;
  }
): Order | null {
  const order = getOrderById(id);
  if (!order) return null;

  const newPayment: OrderPayment = {
    ...order.payment,
    status: paymentStatus,
    ...(extra ?? {}),
  };

  const patch: Partial<Order> = { payment: newPayment };

  // Si el pago fue aprobado, avanzar el pedido a "paid" si estaba "pending"
  if (paymentStatus === "approved" && order.status === "pending") {
    patch.status = "paid";
  }

  return updateOrder(id, patch);
}

export function updateShipping(
  id: string,
  shippingPatch: Partial<OrderShipping>
): Order | null {
  const order = getOrderById(id);
  if (!order) return null;
  return updateOrder(id, {
    shipping: { ...order.shipping, ...shippingPatch },
  });
}

export function addOrderNote(id: string, text: string): Order | null {
  const order = getOrderById(id);
  if (!order) return null;
  const note: AdminNote = {
    id: uid("note"),
    text,
    createdAt: nowISO(),
  };
  return updateOrder(id, { notes: [...order.notes, note] });
}

export function deleteOrder(id: string): boolean {
  const list = getAllOrders();
  const next = list.filter((o) => o.id !== id);
  if (next.length === list.length) return false;
  save(next);
  return true;
}

// ---------- ESTADÍSTICAS ----------

export function getOrderStats() {
  const orders = getAllOrders();
  const now = Date.now();
  const last30Days = now - 30 * 24 * 60 * 60 * 1000;

  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    paid: orders.filter((o) => o.status === "paid" || o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    paymentPending: orders.filter((o) => o.payment.status === "pending").length,
    paymentApproved: orders.filter((o) => o.payment.status === "approved").length,
    revenue30d: orders
      .filter(
        (o) =>
          o.payment.status === "approved" &&
          new Date(o.createdAt).getTime() >= last30Days
      )
      .reduce((acc, o) => acc + o.total, 0),
    orders30d: orders.filter(
      (o) => new Date(o.createdAt).getTime() >= last30Days
    ).length,
    latest: orders.slice(0, 5),
  };
}
