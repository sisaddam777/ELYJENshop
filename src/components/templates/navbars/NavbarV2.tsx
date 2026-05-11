/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, Heart, LogOut, LayoutDashboard, Settings, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { CartDrawer } from '@/components/layout/CartDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

export default function NavbarV2() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = useAppSelector((state) => state.cart.items.reduce((total, item) => total + item.quantity, 0));
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NAV_LINKS = [
    { label: 'Collection', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'Flash Sale', href: '/shop?filter=flash' },
    { label: 'Journal', href: '/blog' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors" 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="text-2xl md:text-3xl font-black text-foreground tracking-tighter hover:scale-105 transition-transform flex items-center gap-1 group font-jost">
            ELYJEN<span className="text-primary group-hover:animate-ping">.</span>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <form className="relative w-full group" onSubmit={(e) => { e.preventDefault(); const query = (e.currentTarget.elements[0] as HTMLInputElement).value; router.push(`/shop?search=${query}`); }}>
            <input 
              type="text" 
              placeholder="Search sneakers..." 
              className="w-full bg-muted/50 border border-transparent focus:border-primary/50 focus:bg-background px-10 py-2.5 rounded-full text-sm transition-all outline-none"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <ul className="hidden lg:flex items-center gap-6 mr-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link 
                  href={link.href} 
                  className="text-xs font-bold text-foreground/70 hover:text-primary transition-all uppercase tracking-widest relative group font-jost"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 md:gap-3">
             {/* Mobile Search Icon */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-foreground hover:bg-muted rounded-full"
              onClick={() => router.push('/shop')}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Link 
              href="/dashboard/wishlist" 
              className="relative group"
            >
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted rounded-full relative">
                <Heart className="h-5 w-5 group-hover:fill-primary transition-all" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-background">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <CartDrawer>
              <div className="relative group cursor-pointer">
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted rounded-full relative pointer-events-none">
                  <ShoppingCart className="h-5 w-5 group-hover:text-primary transition-all" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-background">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>
              </div>
            </CartDrawer>

            <div className="hidden md:block h-6 w-[1px] bg-muted mx-2" />

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 group cursor-pointer outline-none">
                    <div className="h-9 w-9 rounded-full border-2 border-primary/50 overflow-hidden group-hover:scale-110 transition-transform relative">
                      <Image 
                        src={session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || '')}`} 
                        alt={session.user?.name || 'User'} 
                        fill
                        className="object-cover" 
                      />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-background/95 backdrop-blur-xl border-muted shadow-2xl">
                  <div className="px-3 py-3 mb-2 border-b border-muted">
                    <p className="text-sm font-bold truncate">{session.user?.name}</p>
                    <p className="text-[10px] opacity-60 truncate">{session.user?.email}</p>
                  </div>
                  
                  {(session.user as any)?.role?.includes('admin') && (
                    <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="rounded-xl cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-primary" /> Admin Dashboard
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-xl cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => router.push('/track-order')} className="rounded-xl cursor-pointer">
                    <Truck className="mr-2 h-4 w-4" /> Track Order
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-muted" />
                  <DropdownMenuItem onClick={() => signOut()} className="rounded-xl cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs px-6">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-3xl lg:hidden animate-in fade-in zoom-in duration-500">
          <div className="flex justify-end p-8">
            <button 
              className="text-white hover:text-primary transition-colors" 
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-10 w-10" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full -mt-20 gap-10">
             {NAV_LINKS.map((link) => (
                <Link 
                  key={link.label} 
                  href={link.href}
                  className="text-5xl font-black text-white hover:text-primary transition-all duration-500 uppercase tracking-tighter"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
             ))}
             {!session && (
               <Link href="/login" className="mt-10" onClick={() => setMobileMenuOpen(false)}>
                 <Button className="rounded-full bg-primary text-white w-56 h-16 font-black text-xl uppercase tracking-widest">
                    Access
                 </Button>
               </Link>
             )}
          </div>
        </div>
      )}
    </nav>
  );
}

