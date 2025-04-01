import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Property, PropertySearch } from "@shared/schema";
import { getCities, getPropertyTypes, getPriceRanges } from "@/lib/utils";
import translations from "@/lib/i18n";

export default function Properties() {
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<PropertySearch>({});
  const [sortBy, setSortBy] = useState("newest");

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    
    const newSearchParams: PropertySearch = {};
    
    if (params.get("city")) newSearchParams.city = params.get("city") as string;
    if (params.get("type")) newSearchParams.type = params.get("type") as string;
    if (params.get("priceRange")) newSearchParams.priceRange = params.get("priceRange") as string;
    if (params.get("isRental")) newSearchParams.isRental = params.get("isRental") === "true";
    if (params.get("bedrooms")) newSearchParams.bedrooms = parseInt(params.get("bedrooms") as string);
    
    setSearchParams(newSearchParams);
  }, [location]);

  // Fetch properties based on search params
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/search', searchParams],
    queryFn: async ({ queryKey }) => {
      const [_, searchParams] = queryKey;
      const params = new URLSearchParams();
      
      // Add search params to query
      Object.entries(searchParams as PropertySearch).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          params.append(key, String(value));
        }
      });
      
      const res = await fetch(`/api/properties/search?${params.toString()}`, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      return res.json();
    },
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    // Add search params to URL
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, String(value));
      }
    });
    
    navigate(`/properties?${params.toString()}`);
  };

  // Sort properties based on selected option
  const sortedProperties = () => {
    if (!properties) return [];
    
    const sorted = [...properties];
    
    switch (sortBy) {
      case "priceHighToLow":
        return sorted.sort((a, b) => b.price - a.price);
      case "priceLowToHigh":
        return sorted.sort((a, b) => a.price - b.price);
      case "areaHighToLow":
        return sorted.sort((a, b) => b.area - a.area);
      case "newest":
      default:
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  };

  return (
    <>
      <Header />
      
      {/* Page Header */}
      <div className="bg-primary py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white font-heading mb-2">جميع العقارات</h1>
          <div className="text-white/80">الرئيسية / العقارات</div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Search Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6 font-heading">البحث المتقدم</h3>
              
              <form onSubmit={handleSearch}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{translations.search.city}</label>
                    <Select 
                      value={searchParams.city} 
                      onValueChange={(value) => setSearchParams({...searchParams, city: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={translations.search.allCities} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{translations.search.allCities}</SelectItem>
                        {getCities().map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{translations.search.propertyType}</label>
                    <Select 
                      value={searchParams.type} 
                      onValueChange={(value) => setSearchParams({...searchParams, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={translations.search.allTypes} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{translations.search.allTypes}</SelectItem>
                        {getPropertyTypes().map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{translations.search.priceRange}</label>
                    <Select 
                      value={searchParams.priceRange} 
                      onValueChange={(value) => setSearchParams({...searchParams, priceRange: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={translations.search.allPrices} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{translations.search.allPrices}</SelectItem>
                        {getPriceRanges().filter(range => range.value !== 'all').map((range) => (
                          <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">نوع العرض</label>
                    <Select 
                      value={searchParams.isRental !== undefined ? (searchParams.isRental ? "rent" : "sale") : "all"}
                      onValueChange={(value) => setSearchParams({
                        ...searchParams, 
                        isRental: value === "all" ? undefined : value === "rent"
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="الكل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="sale">للبيع</SelectItem>
                        <SelectItem value="rent">للإيجار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">عدد غرف النوم</label>
                    <Select 
                      value={searchParams.bedrooms?.toString() || "all"} 
                      onValueChange={(value) => setSearchParams({
                        ...searchParams, 
                        bedrooms: value === "all" ? undefined : parseInt(value)
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="الكل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <i className="fas fa-search ml-2"></i>
                    {translations.search.searchNow}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Main Content - Property Listings */}
          <div className="lg:col-span-3">
            {/* Sort Controls */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-8 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <p className="text-neutral-600">
                  نتائج البحث: <span className="font-bold text-neutral-800">{properties?.length || 0}</span> عقار
                </p>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-neutral-600 ml-2">{translations.search.sortBy}:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{translations.search.newest}</SelectItem>
                    <SelectItem value="priceHighToLow">{translations.search.priceHighToLow}</SelectItem>
                    <SelectItem value="priceLowToHigh">{translations.search.priceLowToHigh}</SelectItem>
                    <SelectItem value="areaHighToLow">{translations.search.areaHighToLow}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                    <Skeleton className="w-full h-64" />
                    <div className="p-5">
                      <Skeleton className="h-7 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-1/2 mb-4" />
                      <div className="flex justify-between mb-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-px w-full mb-4" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sortedProperties().map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="text-5xl text-neutral-300 mb-4">
                  <i className="fas fa-search"></i>
                </div>
                <h3 className="text-xl font-bold text-neutral-800 mb-2">لا توجد عقارات متطابقة مع بحثك</h3>
                <p className="text-neutral-600 mb-4">
                  حاول تغيير معايير البحث أو إزالة بعض الفلاتر للحصول على نتائج أكثر.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchParams({});
                    navigate("/properties");
                  }}
                >
                  إزالة كل الفلاتر
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
