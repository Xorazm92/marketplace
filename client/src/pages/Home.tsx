import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import {
  Laptop,
  Shirt,
  Home as HomeIcon,
  Zap,
  Book,
  Heart,
} from "lucide-react";

export default function Home() {
  const { t } = useLanguage();

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const { data: trendingProducts = [] } = useQuery({
    queryKey: ['/api/products/trending'],
  });

  const categoryIcons: Record<string, any> = {
    'electronics': Laptop,
    'fashion': Shirt,
    'home-garden': HomeIcon,
    'sports': Zap,
    'books': Book,
    'health-beauty': Heart,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="space-y-12 pb-12">
        {/* Hero Section */}
        <section className="relative">
          <div className="h-96 hero-gradient flex items-center justify-center text-white relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h1 className="text-5xl font-bold mb-6">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl mb-8 opacity-90">
                {t('home.hero.subtitle')}
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  size="lg"
                  className="bg-secondary hover:bg-orange-500 text-white"
                  asChild
                >
                  <Link href="/category/electronics">{t('home.hero.startShopping')}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur"
                  asChild
                >
                  <Link href="/seller">{t('home.hero.becomeSeller')}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.categories.title')}
            </h2>
            <p className="text-gray-600">
              {t('home.categories.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((category: any) => {
              const IconComponent = categoryIcons[category.slug] || Laptop;
              
              return (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-md transition-shadow border group-hover:border-primary/20">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-xl flex items-center justify-center">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        View products
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Trending Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {t('home.trending.title')}
              </h2>
              <p className="text-gray-600">
                {t('home.trending.subtitle')}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/category/electronics">{t('home.trending.viewAll')} →</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Special Offers Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-secondary to-orange-500 text-white p-8">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row items-center justify-between">
                <div className="mb-6 lg:mb-0">
                  <h2 className="text-4xl font-bold mb-4">
                    {t('home.offer.title')}
                  </h2>
                  <p className="text-xl opacity-90 mb-4">
                    {t('home.offer.subtitle')}
                  </p>
                  <p className="text-lg opacity-75">
                    {t('home.offer.deadline')}
                  </p>
                </div>
                <div className="text-center lg:text-right">
                  <Button
                    size="lg"
                    className="bg-white text-secondary hover:bg-gray-100"
                    asChild
                  >
                    <Link href="/category/electronics">{t('home.offer.button')}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
