'use client';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, X, Plus, Minus, Star } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface QuickViewModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const dispatch = useAppDispatch();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(product.images?.[0] || '/placeholder.jpg');

  // Derive available options from variants
  const uniqueColors = useMemo(() =>
    Array.from(new Set((product.variants || []).map((v: any) => v.color))).filter(Boolean) as string[],
    [product.variants]
  );

  const uniqueSizes = useMemo(() =>
    Array.from(new Set((product.variants || []).map((v: any) => v.size))).filter(Boolean) as string[],
    [product.variants]
  );

  const availableSizes = useMemo(() =>
    (product.variants || [])
      .filter((v: any) => !selectedColor || v.color === selectedColor)
      .map((v: any) => v.size)
      .filter(Boolean) as string[],
    [product.variants, selectedColor]
  );

  const activeVariant = useMemo(() =>
    (product.variants || []).find(
      (v: any) =>
        (v.color || null) === (selectedColor || null) &&
        (v.size || null) === (selectedSize || null)
    ),
    [product.variants, selectedColor, selectedSize]
  );

  useEffect(() => {
    if (isOpen) {
      const initialColor = uniqueColors[0] || null;
      setSelectedColor(initialColor);

      const initialSizes = (product.variants || [])
        .filter((v: any) => !initialColor || v.color === initialColor)
        .map((v: any) => v.size)
        .filter(Boolean);
      const initialSize = initialSizes[0] || null;
      setSelectedSize(initialSize);
      setQuantity(1);
      setActiveImage(product.images?.[0] || '/placeholder.jpg');
    }
  }, [isOpen, uniqueColors, product.variants, product.images]);

  useEffect(() => {
    if (selectedSize == null || !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] || null);
    }
  }, [selectedColor, availableSizes]);

  useEffect(() => {
    if (activeVariant?.image) {
      setActiveImage(activeVariant.image);
    }
  }, [activeVariant]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const displayPrice = activeVariant?.price || product.price;
    const displaySalePrice = activeVariant?.salePrice || product.salePrice;

    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: (displaySalePrice !== undefined && displaySalePrice !== null) ? displaySalePrice : displayPrice,
      basePrice: displayPrice,
      quantity: quantity,
      image: activeVariant?.image || product.images?.[0],
      color: selectedColor || undefined,
      size: selectedSize || undefined
    }));
    toast.success(`${product.name} added to cart`);
    onClose();
  };

  const discountPercentage = product.price && product.salePrice 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl w-[95vw] p-0 overflow-hidden bg-white border-none rounded-none shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-50 p-2 bg-white/80 hover:bg-white rounded-none shadow-md transition-all border border-gray-100"
        >
          <X className="h-5 w-5 text-gray-800" />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden">
          {/* Left: Sticky Image Section */}
          <div className="w-full md:w-[50%] bg-[#f8f8f8] relative md:sticky md:top-0 h-fit md:h-full flex flex-col items-center justify-center border-r border-neutral-100">
            <div className="relative w-full aspect-square flex items-center justify-center p-0">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-700"
              />
            </div>
            
            {/* Thumbnails at the bottom of sticky image */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-4 w-full justify-center scrollbar-hide px-4 absolute bottom-0 bg-white/20 backdrop-blur-sm">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`h-16 w-16 flex-shrink-0 border-2 rounded-none overflow-hidden transition-all duration-300 ${
                      activeImage === img ? 'border-[#00a870]' : 'border-white opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {discountPercentage > 0 && (
              <Badge className="absolute top-6 left-6 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-none">
                SAVE {discountPercentage}%
              </Badge>
            )}
          </div>

          {/* Right: Scrollable Details Section */}
          <div className="w-full md:w-[50%] p-10 flex flex-col font-jost overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200">
            <div className="mb-2 flex items-center gap-2">
               <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 fill-current ${i < (product.ratings || 5) ? 'text-yellow-400' : 'text-gray-300'}`} />
                  ))}
               </div>
               <span className="text-xs text-gray-500">({product.numReviews || 0} Verified Reviews)</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.name}</h2>
            
            <div className="flex items-baseline gap-3 mb-4 pb-4 border-b border-gray-100">
              <span className="text-3xl font-bold text-[#00a870]">
                ৳{Math.round(activeVariant?.salePrice ?? activeVariant?.price ?? product.salePrice ?? product.price)}
              </span>
              {(activeVariant?.salePrice ?? product.salePrice) != null && (
                <span className="text-lg line-through text-gray-400">
                  ৳{Math.round(activeVariant?.price ?? product.price)}
                </span>
              )}
            </div>

            <div className="space-y-1 mb-6 text-sm">
               <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-none ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="font-medium text-gray-600">
                    {product.stock > 0 ? `In stock (${product.stock} units available)` : 'Out of stock'}
                  </span>
                  <span className="text-gray-300 mx-1">|</span>
                  <span className="text-gray-500 uppercase">SKU: {product.sku || 'N/A'}</span>
               </div>
            </div>

            {/* Attributes Section (Vertical) */}
            <div className="mb-8 space-y-4 border-t border-gray-100 pt-6">
               {product.attributes?.length > 0 ? (
                 product.attributes.map((attr: any, idx: number) => (
                   <div key={idx} className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-neutral-400 uppercase w-24 tracking-widest">{attr.name || 'Detail'}:</span>
                      <span className="text-sm font-bold text-neutral-800">{attr.value}</span>
                   </div>
                 ))
               ) : (
                 <>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-neutral-400 uppercase w-24 tracking-widest">Technology:</span>
                      <span className="text-sm font-bold text-neutral-800">Carbon Plate</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-neutral-400 uppercase w-24 tracking-widest">Material:</span>
                      <span className="text-sm font-bold text-neutral-800">PrimeKnit</span>
                   </div>
                 </>
               )}
            </div>

            {/* Variations Selection */}
            <div className="space-y-6 flex-grow">
              {uniqueColors.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Color: <span className="text-gray-900">{selectedColor}</span></span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueColors.map((colorName, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.preventDefault(); setSelectedColor(colorName); }}
                        className={`px-4 py-2 text-xs font-bold rounded-none border transition-all ${
                          selectedColor === colorName
                            ? 'border-[#00a870] bg-[#00a870]/5 text-[#00a870]'
                            : 'border-gray-200 hover:border-gray-900 text-gray-600'
                        }`}
                      >
                        {colorName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {uniqueSizes.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Size: <span className="text-gray-900">{selectedSize || 'Select...'}</span></span>
                  <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((sizeName, i) => {
                      const isAvailable = availableSizes.includes(sizeName);
                      return (
                        <button
                          key={i}
                          disabled={!isAvailable}
                          onClick={(e) => { e.preventDefault(); setSelectedSize(sizeName); }}
                          className={`min-w-[44px] px-2 py-2 text-xs font-bold rounded-none border transition-all ${
                            selectedSize === sizeName
                              ? 'border-[#00a870] bg-[#00a870]/5 text-[#00a870]'
                              : !isAvailable 
                                ? 'opacity-30 grayscale cursor-not-allowed bg-gray-100'
                                : 'border-gray-200 hover:border-gray-900 text-gray-600'
                          }`}
                        >
                          {sizeName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="pt-6 border-t border-gray-100 mt-6 flex gap-3">
              <div className="flex items-center border border-gray-200 bg-gray-50 rounded-none overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-200 transition-colors"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-gray-200 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <Button 
                className="flex-grow h-12 bg-[#00a870] hover:bg-[#008f5d] text-white font-bold uppercase tracking-widest text-xs rounded-none shadow-lg shadow-[#00a870]/20" 
                onClick={handleAddToCart}
                disabled={(activeVariant?.stock ?? product.stock) === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" /> 
                {(activeVariant?.stock ?? product.stock) === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              <button className="h-12 w-12 flex items-center justify-center border border-gray-200 rounded-none hover:bg-gray-50 hover:border-gray-900 transition-all">
                <Heart className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
