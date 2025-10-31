import React from 'react';
import { Brand } from '@/types/brand';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrand?: Brand;
  onSelectBrand: (brandId: string) => void;
  onCreateBrand: () => void;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
  onCreateBrand,
}) => {
  return (
    <div className="flex items-center gap-3">
      <Select
        value={selectedBrand?.id}
        onValueChange={onSelectBrand}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a brand" />
        </SelectTrigger>
        <SelectContent>
          {brands?.map((brand) => (
            <SelectItem key={brand.id} value={brand.id}>
              <div className="flex items-center gap-2">
                {brand.logo_url && (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                )}
                <span>{brand.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button onClick={onCreateBrand} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        New Brand
      </Button>
    </div>
  );
};
