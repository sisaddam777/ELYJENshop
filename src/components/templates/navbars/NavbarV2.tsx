/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Heart, 
  LogOut, 
  LayoutDashboard, 
  Settings, 
  Truck, 
  Mic, 
  MicOff, 
  Package 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/store/hooks';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ModeToggle } from '@/components/mode-toggle';
import { AIChatbot } from '@/components/layout/AIChatbot';
import { useSettings } from '@/components/SettingsProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import Swal from 'sweetalert2';

import { CategoryNav } from '@/components/layout/CategoryNav';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blogs' },
  { href: '/contact', label: 'Contact' },
];

export default function NavbarV2() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const settings = useSettings();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  const cartCount = useAppSelector((state) => state.cart.totalQuantity);
  const totalAmount = useAppSelector((state) => state.cart.totalAmount);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Categories for Mobile
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.filter((c: any) => c.isActive && !c.parentCategory)))
      .catch(err => console.error('Failed to fetch categories', err));
  }, []);

  // Fetch Profile for Wallet Balance
  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error('Failed to fetch profile', err));
    }
  }, [status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      Swal.fire({
        title: 'Voice Search Unsupported',
        text: 'Please use Chrome for voice search.',
        icon: 'info'
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      router.push(`/shop?search=${encodeURIComponent(transcript.trim())}`);
    };
    recognition.start();
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 font-jost ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 text-foreground hover:text-primary transition-colors" 
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="text-2xl md:text-3xl font-black text-foreground tracking-tighter hover:scale-105 transition-transform flex items-center gap-1 group">
            ELYJEN<span className="text-primary group-hover:animate-ping">.</span>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <form className="relative w-full group" onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder={isListening ? 'Listening...' : 'Search sneakers...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-muted/50 border border-transparent focus:border-primary/50 focus:bg-background px-10 py-2.5 rounded-full text-sm transition-all outline-none"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <ul className="hidden lg:flex items-center gap-6 mr-4">
            {navItems.map((item, index) => (
              <React.Fragment key={item.label}>
                <li>
                  <Link 
                    href={item.href} 
                    className={`text-xs font-bold uppercase tracking-widest relative group transition-colors ${pathname === item.href ? 'text-primary' : 'text-foreground/70 hover:text-primary'}`}
                  >
                    {item.label}
                    <span className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300 ${pathname === item.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                </li>
                {index === 0 && (
                  <li>
                    <CategoryNav />
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>

          <div className="flex items-center gap-1 md:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <ModeToggle />
              {settings?.aiConfig?.openRouterApiKey && <AIChatbot />}
            </div>

            <Link href="/dashboard/wishlist">
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted rounded-full relative group">
                <Heart className={`h-5 w-5 transition-all ${wishlistCount > 0 ? 'fill-primary text-primary' : 'group-hover:text-primary'}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <CartDrawer>
              <div className="relative group cursor-pointer">
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted rounded-full relative pointer-events-none">
                  <ShoppingCart className="h-5 w-5 group-hover:text-primary transition-all" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[9px] font-black text-white rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
                      {cartCount}
                    </span>
                  )}
                </Button>
                <div className="hidden xl:block absolute -bottom-8 right-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">৳{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CartDrawer>

            <div className="hidden md:block h-6 w-[1px] bg-muted mx-1" />

            {status === 'authenticated' && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 group cursor-pointer outline-none">
                    <div className="h-9 w-9 rounded-full border-2 border-primary/50 overflow-hidden group-hover:scale-110 transition-transform">
                      <img 
                        src={session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || '')}`} 
                        alt={session.user?.name || 'User'} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 bg-background/95 backdrop-blur-xl border-muted shadow-2xl">
                  <DropdownMenuLabel className="px-3 py-3 mb-2 border-b border-muted">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-bold truncate">{session.user?.name}</p>
                      <p className="text-[10px] opacity-60 truncate">{session.user?.email}</p>
                      {profile && (
                        <div className="mt-2 flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full w-fit border border-primary/20">
                          <Package className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-black text-primary">৳{profile.walletBalance || 0} Tokens</span>
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuGroup>
                    {/* Role Based Navigation */}
                    {(session.user as any)?.role?.includes('admin') && (
                      <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="rounded-xl cursor-pointer py-2.5">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-primary" /> Admin Dashboard
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => router.push('/dashboard')} className="rounded-xl cursor-pointer py-2.5">
                      <User className="mr-2 h-4 w-4" /> My Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => router.push('/track-order')} className="rounded-xl cursor-pointer py-2.5">
                      <Truck className="mr-2 h-4 w-4" /> Track Order
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')} className="rounded-xl cursor-pointer py-2.5">
                      <Settings className="mr-2 h-4 w-4" /> Account Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-muted my-2" />
                  <DropdownMenuItem onClick={() => signOut()} className="rounded-xl cursor-pointer text-destructive py-2.5">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest px-6 h-10 shadow-lg shadow-primary/20">
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
            >
              <X className="h-10 w-10" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-full -mt-20 gap-8 overflow-y-auto pb-10">
             {navItems.map((link, index) => (
                <React.Fragment key={link.label}>
                  <Link 
                    href={link.href}
                    className={`text-5xl font-black transition-all duration-500 uppercase tracking-tighter ${pathname === link.href ? 'text-primary scale-110' : 'text-white hover:text-primary'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {index === 0 && (
                    <div className="w-full max-w-xs">
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="categories" className="border-none">
                          <AccordionTrigger className="text-2xl font-bold text-white/70 hover:text-primary hover:no-underline uppercase">
                            Categories
                          </AccordionTrigger>
                          <AccordionContent className="flex flex-col gap-4 pt-4 items-center">
                            {categories.map((cat: any) => (
                              <Link
                                key={cat._id}
                                href={`/shop?category=${cat.slug}`}
                                className="text-xl font-bold text-white/50 hover:text-primary uppercase transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  )}
                </React.Fragment>
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
