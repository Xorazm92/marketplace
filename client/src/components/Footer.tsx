import { Link } from "wouter";
import { Facebook, Twitter, Instagram } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">GlobalMarket</h3>
            <p className="text-gray-400 mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.shop')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/category/electronics" className="hover:text-white">{t('categories.electronics')}</Link></li>
              <li><Link href="/category/fashion" className="hover:text-white">{t('categories.fashion')}</Link></li>
              <li><Link href="/category/home-garden" className="hover:text-white">{t('categories.homeGarden')}</Link></li>
              <li><Link href="/category/sports" className="hover:text-white">{t('categories.sports')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">{t('footer.helpCenter')}</a></li>
              <li><a href="#" className="hover:text-white">{t('footer.contactUs')}</a></li>
              <li><a href="#" className="hover:text-white">{t('footer.shippingInfo')}</a></li>
              <li><a href="#" className="hover:text-white">{t('footer.returns')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.sell')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">{t('footer.startSelling')}</a></li>
              <li><a href="#" className="hover:text-white">{t('footer.sellerGuide')}</a></li>
              <li><Link href="/seller" className="hover:text-white">{t('footer.sellerDashboard')}</Link></li>
              <li><a href="#" className="hover:text-white">{t('footer.fees')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 GlobalMarket. {t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}
