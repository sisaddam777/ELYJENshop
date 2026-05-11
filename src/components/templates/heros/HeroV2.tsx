/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, PlayCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroV2Props {
  banners: any[];
}

export default function HeroV2({ banners }: HeroV2Props) {
  const banner = banners?.[0];
  const title = banner?.title ?? 'Elevated Living Essentials';
  const subtitle = banner?.subtitle ?? 'CURATED COLLECTION 2026';
  const image = banner?.image ?? '/placeholder.png';

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black font-jost">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover opacity-60 transition-transform duration-[10s] hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] border border-primary/30 backdrop-blur-sm mx-auto">
            <Sparkles className="h-3 w-3" />
            Limited Drop 2026
          </div>

          <h1 className="text-6xl md:text-[12rem] font-black tracking-[calc(-0.05em)] leading-none text-white uppercase italic">
            {title}
          </h1>

          <p className="text-white/80 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Link href="/shop">
              <Button size="lg" className="h-16 px-12 rounded-full bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all font-black text-lg gap-3 group">
                Shop Collection <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="lg" className="h-16 px-10 rounded-full border-white/20 bg-white/5 text-white hover:bg-white hover:text-black transition-all font-bold text-lg gap-2 backdrop-blur-md">
                <PlayCircle className="h-5 w-5" /> Our Story
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Scroll</span>
        <div className="h-12 w-6 border-2 border-white/20 rounded-full flex justify-center p-1">
          <div className="h-2 w-1 bg-primary rounded-full animate-scroll-dot" />
        </div>
      </div>

      {/* Decorative Accents */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 hidden xl:block">
        <div className="flex flex-col gap-20">
          <div className="rotate-90 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 whitespace-nowrap">Performance First</div>
          <div className="rotate-90 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 whitespace-nowrap">Elite Craftsmanship</div>
        </div>
      </div>
    </section>
  );
}

