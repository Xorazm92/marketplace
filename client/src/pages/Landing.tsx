import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/Footer";
import {
  Laptop,
  Shirt,
  Home,
  Zap,
  Book,
  Heart,
  ShoppingBag,
  Users,
  Globe,
} from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Globe,
      title: t('landing.features.global.title'),
      description: t('landing.features.global.description'),
    },
    {
      icon: Users,
      title: t('landing.features.community.title'),
      description: t('landing.features.community.description'),
    },
    {
      icon: ShoppingBag,
      title: t('landing.features.secure.title'),
      description: t('landing.features.secure.description'),
    },
  ];

  const categories = [
    { icon: Laptop, name: t('categories.electronics'), count: '1,247' },
    { icon: Shirt, name: t('categories.fashion'), count: '2,856' },
    { icon: Home, name: t('categories.homeGarden'), count: '934' },
    { icon: Zap, name: t('categories.sports'), count: '567' },
    { icon: Book, name: t('categories.books'), count: '1,123' },
    { icon: Heart, name: t('categories.healthBeauty'), count: '789' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">GlobalMarket</h1>
            </div>
            <Button asChild>
              <a href="/api/login">{t('landing.getStarted')}</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="h-96 hero-gradient flex items-center justify-center text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h1 className="text-5xl font-bold mb-6">
              {t('landing.hero.title')}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                size="lg"
                className="bg-secondary hover:bg-orange-500 text-white"
                asChild
              >
                <a href="/api/login">{t('landing.hero.startShopping')}</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur"
                asChild
              >
                <a href="/api/login">{t('landing.hero.becomeSeller')}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-gray-600">
              {t('landing.features.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('landing.categories.title')}
            </h2>
            <p className="text-gray-600">
              {t('landing.categories.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="text-center p-4 hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-lg flex items-center justify-center">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{category.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('landing.cta.subtitle')}
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-gray-100"
            asChild
          >
            <a href="/api/login">{t('landing.cta.button')}</a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
