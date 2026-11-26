import type { MetadataRoute } from "next";

// Shaxsiy va xizmat sahifalari qidiruv tizimlariga kerak emas: ular kirishni talab qiladi
// yoki (admin) umuman koʻrinmasligi kerak. Katalog va mahsulot sahifalari ochiq.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cart", "/checkout", "/orders", "/profile", "/login", "/api/"],
    },
  };
}
