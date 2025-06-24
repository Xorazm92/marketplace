import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Filter, ChevronDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/context/LanguageContext";

export default function Category() {
  const { slug } = useParams();
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();
  
  // Parse search params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const searchQuery = searchParams.get('search') || '';
  
  // Filter state
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: [`/api/categories/${slug}`],
    enabled: !!slug && slug !== 'search',
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products', { 
      categoryId: category?.id,
      search: searchQuery,
      limit: 50 
    }],
    enabled: !!category?.id || !!searchQuery,
  });

  // Filter products based on current filters
  const filteredProducts = products.filter((product: any) => {
    const price = parseFloat(product.price.toString());
    const rating = parseFloat(product.rating?.toString() || '0');
    
    // Price filter
    if (price < priceRange[0] || price > priceRange[1]) return false;
    
    // Rating filter
    if (rating < minRating) return false;
    
    // Brand filter (simplified - using first word of product name)
    if (selectedBrands.length > 0) {
      const brand = product.name.split(' ')[0].toLowerCase();
      if (!selectedBrands.map(b => b.toLowerCase()).includes(brand)) return false;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'price-asc':
        return parseFloat(a.price.toString()) - parseFloat(b.price.toString());
      case 'price-desc':
        return parseFloat(b.price.toString()) - parseFloat(a.price.toString());
      case 'rating':
        return parseFloat(b.rating?.toString() || '0') - parseFloat(a.rating?.toString() || '0');
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Extract unique brands from products
  const availableBrands = Array.from(new Set(
    products.map((product: any) => product.name.split(' ')[0])
  )).slice(0, 10); // Limit to 10 brands

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedBrands([]);
    setMinRating(0);
    setSortBy('name');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">{t('category.priceRange')}</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Brands */}
      {availableBrands.length > 0 && (
        <>
          <div>
            <h3 className="font-semibold mb-3">{t('category.brands')}</h3>
            <div className="space-y-2">
              {availableBrands.map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox
                    id={brand}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => handleBrandToggle(brand)}
                  />
                  <label htmlFor={brand} className="text-sm font-medium">
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />
        </>
      )}

      {/* Rating */}
      <div>
        <h3 className="font-semibold mb-3">{t('category.rating')}</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={(checked) => setMinRating(checked ? rating : 0)}
              />
              <label htmlFor={`rating-${rating}`} className="flex items-center space-x-1 text-sm">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span>& Up</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Button variant="outline" onClick={clearFilters} className="w-full">
        {t('category.clearFilters')}
      </Button>
    </div>
  );

  if (categoryLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="h-96 bg-gray-300 rounded"></div>
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const pageTitle = searchQuery 
    ? `Search results for "${searchQuery}"`
    : category?.name || 'Products';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <span>Home</span>
          <span>/</span>
          {category && (
            <>
              <span>Categories</span>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900">{pageTitle}</span>
        </nav>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
            <p className="text-gray-600">
              {sortedProducts.length} products found
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('category.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* Mobile Filter Button */}
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  {t('category.filters')}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>{t('category.filters')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4">{t('category.filters')}</h2>
                <FilterContent />
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Filter className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('category.noProducts')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    {t('category.clearFilters')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
