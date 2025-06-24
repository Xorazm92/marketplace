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
import { useLanguage } from "@/context/LanguageContext";
import ShoppingCartSidebar from "./ShoppingCart";

export default function Header() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const { language, setLanguage, currency, setCurrency, t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const languages = [
    { code: 'en', label: '🇺🇸 EN', name: 'English' },
    { code: 'ru', label: '🇷🇺 RU', name: 'Русский' },
    { code: 'uz', label: '🇺🇿 UZ', name: 'O\'zbek' },
  ];

  const currencies = ['USD', 'EUR', 'UZS'];

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
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

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Globe className="h-4 w-4 mr-2" />
                    {languages.find(l => l.code === language)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as any)}
                    >
                      {lang.label} {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Currency Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    {currency}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {currencies.map((curr) => (
                    <DropdownMenuItem
                      key={curr}
                      onClick={() => setCurrency(curr as any)}
                    >
                      {curr}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart */}
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-secondary">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              )}

              {/* Profile */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      {user?.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt="Profile"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                      <span className="hidden sm:block">
                        {user?.firstName || 'User'}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">{t('header.dashboard')}</Link>
                    </DropdownMenuItem>
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
                    <DropdownMenuItem>
                      <a href="/api/logout">{t('header.logout')}</a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
