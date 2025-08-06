import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./Breadcrumb.module.scss";

const uzNamesMap: Record<string, string> = {
  profile: "Profil",
  product: "Mening e'lonlarim",
  productdetails: "Mahsulot tafsilotlari",
  favorites: "Sevimlilar",
  admin: "Admin panel",
  createproduct: "Mahsulot qo'shish",
  search: "Qidiruv",
  category: "Kategoriya",
  login: "Kirish",
  signup: "Ro'yxatdan o'tish",
};

const isIdSegment = (segment: string) => {
  if (/^\d+$/.test(segment)) return true;
  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      segment,
    )
  )
    return true;
  return false;
};

const Breadcrumb = () => {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = [
    { name: "Bosh sahifa", href: "/" },
    ...segments
      .filter((segment) => !isIdSegment(segment))
      .map((segment, index) => {
        const href =
          "/" +
          segments
            .slice(0, index + 1)
            .filter((s) => !isIdSegment(s))
            .join("/");
        const name =
          uzNamesMap[segment.toLowerCase()] ||
          decodeURIComponent(segment)
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

        return { name, href };
      }),
  ];

  return (
    <nav className={`${styles.breadcrumb} ${styles.container}`}>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <span key={index} className={styles.item}>
            {!isLast ? (
              <>
                <Link href={crumb.href} className={styles.link}>
                  {crumb.name}
                </Link>
                <span className={styles.arrow}>→</span>
              </>
            ) : (
              <span className={styles.current}>{crumb.name}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
