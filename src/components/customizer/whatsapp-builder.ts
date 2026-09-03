import type { AdminProduct } from "@/types/admin";
import { formatCOP } from "@/lib/utils";

interface BuildMessageInput {
  customer: {
    name: string;
    email: string;
    whatsapp: string;
  };
  product: AdminProduct;
  values: Record<string, unknown>;
  quantity: number;
  dueDate?: string;
  estimatedPrice: number | null;
  isOutOfCatalog: boolean;
}

export function buildWhatsAppMessage(input: BuildMessageInput): string {
  const lines: string[] = [];
  lines.push("Hola Papelillo 👋");
  lines.push("");
  lines.push("Quiero crear un producto personalizado.");
  lines.push("");
  lines.push(`Producto: ${input.product.name}`);
  lines.push("");

  // Resumen de opciones elegidas
  const options = input.product.options ?? [];
  options.forEach((opt) => {
    const val = input.values[opt.name];
    if (val === undefined || val === null || val === "") return;

    let display = "";
    if (typeof val === "string") {
      display = val;
    } else if (typeof val === "number") {
      display = String(val);
    } else if (typeof val === "boolean") {
      display = val ? "Sí" : "No";
    } else if (Array.isArray(val)) {
      display = val.join(", ");
    } else if (typeof val === "object" && val !== null && "value" in val) {
      const obj = val as { value: string; otherText?: string };
      if (obj.value === "__other__" && obj.otherText) {
        display = `Otro: ${obj.otherText}`;
      } else {
        display = obj.value;
      }
    }

    if (display) {
      lines.push(`${opt.label}: ${display}`);
    }
  });

  lines.push("");
  lines.push(`Cantidad: ${input.quantity}`);
  if (input.dueDate) {
    lines.push(`Fecha deseada: ${input.dueDate}`);
  }

  if (input.estimatedPrice !== null) {
    lines.push("");
    lines.push(`Precio estimado: ${formatCOP(input.estimatedPrice)} COP`);
  }

  if (input.isOutOfCatalog) {
    lines.push("");
    lines.push("⚠️ Esta solicitud incluye opciones fuera del catálogo estándar.");
  }

  lines.push("");
  lines.push("¿Podemos revisar mi solicitud?");

  return lines.join("\n");
}
