import { useState } from "react";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getCities, getPropertyTypes, getPriceRanges } from "@/lib/utils";
import translations from "@/lib/i18n";

export default function HeroSearch() {
  const [, navigate] = useLocation();
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (city && city !== 'all') params.append("city", city);
    if (propertyType && propertyType !== 'all') params.append("type", propertyType);
    if (priceRange && priceRange !== 'all') params.append("priceRange", priceRange);
    
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <form onSubmit={handleSearch}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="location" className="block text-neutral-700 text-sm mb-1">
              {translations.search.city}
            </label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger id="location" className="w-full">
                <SelectValue placeholder={translations.search.allCities} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{translations.search.allCities}</SelectItem>
                {getCities().map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label htmlFor="propertyType" className="block text-neutral-700 text-sm mb-1">
              {translations.search.propertyType}
            </label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="propertyType" className="w-full">
                <SelectValue placeholder={translations.search.allTypes} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{translations.search.allTypes}</SelectItem>
                {getPropertyTypes().map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label htmlFor="priceRange" className="block text-neutral-700 text-sm mb-1">
              {translations.search.priceRange}
            </label>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger id="priceRange" className="w-full">
                <SelectValue placeholder={translations.search.allPrices} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{translations.search.allPrices}</SelectItem>
                {getPriceRanges().filter(range => range.value !== '' && range.value !== 'all').map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-medium px-6 py-6">
              <i className="fas fa-search ml-2"></i>
              {translations.search.searchNow}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
