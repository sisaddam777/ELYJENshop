/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { QuickViewModal } from './QuickViewModal';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    images: string[];
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isTrending?: boolean;
    stock: number;
    categories?: any[];
    variants?: any[];
    ratings?: number;
    numReviews?: number;
  };
  isFlashSale?: boolean;
}

export default function ProductCardV6({ product, isFlashSale }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { status } = useSession();
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const isInWishlist = wishlist.includes(product._id);
  const hasVariants = product.variants && product.variants.length > 0;

  const [showQuickViewModal, setShowQuickViewModal] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasVariants) {
      setShowQuickViewModal(true);
    } else {
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        price: product.salePrice ?? product.price,
        basePrice: product.price,
        quantity: 1,
        image: product.images?.[0]
      }));
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === 'unauthenticated') {
      toast.error('Please login to add to wishlist');
      return;
    }
    dispatch(toggleWishlist(product._id));
    toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  return (
    <div className="group relative flex flex-col font-jost animate-in fade-in duration-700">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted rounded-none">
        <Link href={`/product/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.images?.[0] || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Sale / Flash Ribbon Badge (Top Right) */}
        {(discount > 0 || isFlashSale) && (
          <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 z-10 pointer-events-none">
            <div className={`absolute top-0 right-0 text-white text-[10px] font-black py-1 w-32 text-center rotate-45 translate-x-10 translate-y-4 shadow-lg uppercase tracking-widest ${
              isFlashSale ? 'bg-orange-500 animate-pulse' : 'bg-primary'
            }`}>
              {isFlashSale ? 'Flash' : `${discount}% OFF`}
            </div>
          </div>
        )}

        {/* Status Ribbon Badge (Top Left) */}
        {(product.isNewArrival || product.isTrending || product.isFeatured) && (
          <div className="absolute top-0 left-0 overflow-hidden w-24 h-24 z-10 pointer-events-none">
            <div className={`absolute top-0 left-0 text-white text-[10px] font-black py-1 w-32 text-center -rotate-45 -translate-x-10 translate-y-4 shadow-lg uppercase tracking-widest ${
              product.isNewArrival ? 'bg-emerald-500' :
              product.isTrending ? 'bg-rose-500' :
              'bg-amber-500'
            }`}>
              {product.isNewArrival ? 'New' :
               product.isTrending ? 'Trending' :
               'Featured'}
            </div>
          </div>
        )}

        {/* Hover Actions - Centered circles */}
        <div className="absolute inset-0 hidden md:flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/5 backdrop-blur-[2px]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-12 w-12 rounded-full bg-white text-black hover:bg-primary hover:text-white shadow-xl transition-all hover:scale-110"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add to cart</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-12 w-12 rounded-full bg-white text-black hover:bg-primary hover:text-white shadow-xl transition-all hover:scale-110"
                  onClick={(e) => { e.preventDefault(); setShowQuickViewModal(true); }}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick View</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className={`h-12 w-12 rounded-full bg-white shadow-xl transition-all hover:scale-110 ${isInWishlist ? 'text-primary' : 'text-black hover:bg-primary hover:text-white'}`}
                  onClick={handleWishlist}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-4 text-center space-y-1">
        <Link 
          href={`/product/${product.slug}`}
          className="text-base font-semibold text-foreground hover:text-primary transition-colors block leading-tight px-4"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-center gap-2">
          {product.salePrice ? (
            <>
              <span className="text-[#00a870] font-semibold text-[15px]">৳{Math.round(product.salePrice)}</span>
              <span className="text-muted-foreground line-through text-[13px] font-normal">৳{Math.round(product.price)}</span>
            </>
          ) : (
            <span className="text-[#00a870] font-semibold text-[15px]">৳{Math.round(product.price)}</span>
          )}
        </div>
      </div>

      <QuickViewModal
        product={product}
        isOpen={showQuickViewModal}
        onClose={() => setShowQuickViewModal(false)}
      />
    </div>
  );
}
