import { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contáctanos por WhatsApp, email o envíanos un mensaje.",
};

import ContactoClientPage from "./page-client";

export default function ContactoPage() {
  return <ContactoClientPage />;
}
