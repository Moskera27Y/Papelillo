import { getSiteSettingsAction } from "../app/actions/index";

getSiteSettingsAction()
  .then((s) => {
    console.log("RESULTADO getSiteSettingsAction():");
    console.log("brandName:", s?.brandName ?? "NULL");
    console.log("footerDescription:", s?.footerDescription ?? "NULL");
    console.log("branding.logoSrc:", s?.branding?.logoSrc ?? "NULL");
    console.log("branding.faviconSrc:", s?.branding?.faviconSrc ?? "NULL");
    console.log("seo.siteName:", s?.seo?.siteName ?? "NULL");
    console.log("seo.siteDescription:", s?.seo?.siteDescription ?? "NULL");
    console.log("seo.siteUrl:", s?.seo?.siteUrl ?? "NULL");
    console.log("seo.ogImage:", s?.seo?.ogImage ?? "NULL");
    console.log("seo.keywords:", s?.seo?.keywords ?? "NULL");
    console.log("contact.email:", s?.contact?.email ?? "NULL");
    console.log("wompi.enabled:", s?.wompi?.enabled ?? "NULL");
    console.log("socialLinks.length:", s?.socialLinks?.length ?? 0);
  })
  .catch((e) => {
    console.log("ERROR:", e?.message ?? e);
  });
