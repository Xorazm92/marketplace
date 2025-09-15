import { usePathname } from 'next/navigation';

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  const pathname = usePathname();
  const baseUrl = 'https://inbola.uz';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${baseUrl}${item.url}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export default BreadcrumbSchema;






