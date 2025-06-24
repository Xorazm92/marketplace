import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, ShoppingCart, User, Bell, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/context/CartContext";
import { useLanguage, type Language, type Currency } from "@/context/LanguageContext";
import ShoppingCartSidebar from "./ShoppingCart";

export default function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const { language, setLanguage, currency, setCurrency, t } = useLanguage();

  // Type-safe language and currency handlers
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const handleCurrencyChange = (curr: Currency) => {
    setCurrency(curr);
  };
  
  // Type-safe language and currency values
  const currentLanguage = language as Language;
  const currentCurrency = currency as Currency;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const languages = [
    { code: 'en' as const, label: '🇺🇸 EN', name: 'English' },
    { code: 'ru' as const, label: '🇷🇺 RU', name: 'Русский' },
    { code: 'uz' as const, label: '🇺🇿 UZ', name: 'O\'zbek' },
  ] as const;

  const currencies = ['USD', 'EUR', 'UZS'] as const;

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={isAuthenticated ? "/home" : "/"}>
                <h1 className="text-2xl font-bold text-primary cursor-pointer">
                  GlobalMarket
                </h1>
              </Link>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder={t('header.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4"
                />
              </form>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <Globe className="h-4 w-4" />
                          <span>{currentLanguage.toUpperCase()}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {languages.map((lang) => (
                          <DropdownMenuItem
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className={currentLanguage === lang.code ? 'bg-accent' : ''}
                          >
                            {lang.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <span>{currentCurrency}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {currencies.map((curr) => (
                          <DropdownMenuItem
                            key={curr}
                            onClick={() => setCurrency(curr)}
                            className={currentCurrency === curr ? 'bg-accent' : ''}
                          >
                            {curr}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setIsCartOpen(true)}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {getTotalItems() > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                      >
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user?.role === 'seller' && (
                        <DropdownMenuItem asChild>
                          <Link href="/seller">{t('header.sellerDashboard')}</Link>
                        </DropdownMenuItem>
                      )}
                      {user?.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">{t('header.adminPanel')}</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <a href="/api/logout">{t('header.logout')}</a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button asChild>
                  <a href="/api/login">{t('header.login')}</a>
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="space-y-4 mt-4">
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder={t('header.searchPlaceholder')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </form>
                    
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/">{t('nav.home')}</Link>
                      </Button>
                      {isAuthenticated && (
                        <>
                          <Button variant="ghost" className="w-full justify-start" asChild>
                            <Link href="/dashboard">{t('nav.dashboard')}</Link>
                          </Button>
                          {user?.role === 'seller' && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                              <Link href="/seller">{t('nav.seller')}</Link>
                            </Button>
                          )}
                          {user?.role === 'admin' && (
                            <Button variant="ghost" className="w-full justify-start" asChild>
                              <Link href="/admin">{t('nav.admin')}</Link>
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <ShoppingCartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
