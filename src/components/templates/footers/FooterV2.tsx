/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from '@/components/ui/social-icons';
import { Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DeveloperLogo from '@/components/ui/developerlogo';
import { useSettings } from '@/components/SettingsProvider';
import * as SocialIcons from '@/components/ui/social-icons';
import { Circle } from 'lucide-react';

const socialIconMap: Record<string, any> = {
  facebook: SocialIcons.Facebook || Circle,
  twitter: SocialIcons.Twitter || SocialIcons.X || Circle,
  instagram: SocialIcons.Instagram || Circle,
  youtube: SocialIcons.Youtube || Circle,
  linkedin: SocialIcons.Linkedin || Circle,
  tiktok: SocialIcons.Tiktok || Circle,
  whatsapp: SocialIcons.Whatsapp || Circle,
};

export default function FooterV2() {
  const currentYear = new Date().getFullYear();
  const settings = useSettings();
  const socialLinks = settings?.socialLinks || {};
  const hasSocialLinks = Object.values(socialLinks).some(v => v);

  const LINKS = {
    discovery: [
      { label: 'Shop All', href: '/shop' },
      { label: 'New Arrivals', href: '/shop?filter=new' },
      { label: 'Best Sellers', href: '/shop?filter=popular' },
      { label: 'Release Calendar', href: '/blog' }
    ],
    support: [
      { label: 'Order Tracking', href: '/track-order' },
      { label: 'Returns \u0026 Exchanges', href: '/returns' },
      { label: 'Size Guide', href: '/size-guide' },
      { label: 'Contact Support', href: '/contact' }
    ]
  };

  return (
    <footer className="bg-background border-t border-muted text-foreground pt-24 pb-12 px-6 font-jost">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Essence */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="text-4xl font-black tracking-tighter hover:text-primary transition-all inline-block italic">
              ELYJEN<span className="text-primary">.</span>
            </Link>
            <p className="text-muted-foreground text-base max-w-sm leading-relaxed font-medium">
              Pushing the boundaries of footwear design. From performance athletics to high-street style. Born in the heart of Dhaka, engineering for the world.
            </p>
            {hasSocialLinks && (
              <div className="flex items-center gap-4">
                {Object.entries(socialLinks).map(([platform, url]) => {
                  if (!url) return null;
                  const Icon = socialIconMap[platform];
                  if (!Icon) return null;

                  return (
                    <Link 
                      key={platform} 
                      href={url as string} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 rounded-full border border-muted flex items-center justify-center hover:bg-primary hover:border-primary transition-all group"
                    >
                        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Modules */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
             <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Discovery</h4>
                <ul className="space-y-3">
                   {LINKS.discovery.map(link => (
                     <li key={link.label}>
                        <Link href={link.href} className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">
                           {link.label}
                        </Link>
                     </li>
                   ))}
                </ul>
             </div>
             <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Support</h4>
                <ul className="space-y-3">
                   {LINKS.support.map(link => (
                     <li key={link.label}>
                        <Link href={link.href} className="text-sm font-bold text-muted-foreground hover:text-primary transition-all">
                           {link.label}
                        </Link>
                     </li>
                   ))}
                </ul>
             </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3 space-y-6">
             <h4 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Newsletter</h4>
             <div className="space-y-4">
                <p className="text-xs text-muted-foreground font-medium">Get early access to drops and exclusive sneaker news.</p>
                <form 
                  className="relative group"
                  onSubmit={(e) => {
                    e.preventDefault();
                    toast.success('You\u0027re on the list. Stay tuned.');
                    (e.target as HTMLFormElement).reset();
                  }}
                >
                   <input 
                    type="email"
                    className="w-full bg-muted/30 border-b border-muted pb-3 text-sm focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/50 font-bold" 
                    placeholder="Enter email" 
                    required
                   />
                   <button 
                    type="submit"
                    className="absolute right-0 bottom-3 text-primary hover:scale-110 transition-transform"
                   >
                      <ArrowUpRight className="h-5 w-5" />
                   </button>
                </form>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-muted flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
           <p>© {currentYear} ELYJEN CO. ALL RIGHTS RESERVED.</p>
           <div className="flex items-center gap-8">
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
           </div>
           <DeveloperLogo className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
        </div>
      </div>
    </footer>
  );
}

