import { ProductDetails } from "@/app";
import SEO from "@/components/common/SEO";
import { useRouter } from "next/router";

export default function ProductDetailsPage() {
  const router = useRouter();
  const { id } = router.query;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Mahsulot nomi",
    "description": "Mahsulot tavsifi",
    "image": "https://inbola.uz/img/product-placeholder.jpg",
    "url": `https://inbola.uz/productdetails/${id}`,
    "brand": {
      "@type": "Brand",
      "name": "INBOLA"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "UZS",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "INBOLA Kids Marketplace"
      }
    }
  };

  return (
    <>
      <SEO 
        title={`Mahsulot nomi - INBOLA Kids Marketplace`}
        description="Mahsulot tavsifi va xususiyatlari. Xavfsiz va sifatli mahsulotlar faqat bolalar uchun."
        keywords="mahsulot, bolalar uchun, xavfsiz, sifatli, tez yetkazib berish"
        type="product"
        structuredData={structuredData}
      />
      <main>
        <ProductDetails />
      </main>
    </>
  );
}
