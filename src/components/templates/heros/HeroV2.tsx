'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, PlayCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface HeroV2Props {
  banners: any[];
}

const AUTOPLAY_DELAY = 6000;

export default function HeroV2({ banners }: HeroV2Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = banners && banners.length > 0 ? banners : [];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black font-jost group/hero">
      {/* Embla Viewport */}
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full w-full">
          {slides.map((banner, index) => {
            const isActive = index === activeIndex;
            return (
              <div key={banner._id || index} className="relative flex-[0_0_100%] min-w-0 h-full">
                {/* Background Image with Ken Burns Effect */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    priority={index === 0}
                    unoptimized={true}
                    className={`object-cover opacity-60 transition-transform duration-[7000ms] ease-out ${isActive ? 'scale-110' : 'scale-100'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
                </div>

                {/* Content */}
                <div className="container relative z-10 mx-auto px-4 h-full flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6 lg:max-w-[50%]"
                      >
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] border border-primary/30 backdrop-blur-sm lg:mx-0 mx-auto"
                        >
                          <Sparkles className="h-3 w-3" />
                          Limited Drop 2026
                        </motion.div>

                        <motion.h1 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                          className="text-6xl md:text-[10rem] font-black tracking-[-0.05em] leading-[0.9] text-white uppercase italic drop-shadow-2xl"
                        >
                          {banner.title}
                        </motion.h1>

                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-white/80 text-lg md:text-2xl max-w-2xl lg:mx-0 mx-auto leading-relaxed font-light tracking-wide"
                        >
                          {banner.subtitle || 'CURATED COLLECTION 2026'}
                        </motion.p>

                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-8"
                        >
                          <Link href={banner.primaryBtnLink || '/shop'}>
                            <Button size="lg" className="h-16 px-12 rounded-full bg-primary text-primary-foreground hover:bg-white hover:text-black transition-all font-black text-lg gap-3 group/btn">
                              {banner.primaryBtnText || 'Shop Collection'} 
                              <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-2 transition-transform" />
                            </Button>
                          </Link>
                          <Link href={banner.secondaryBtnLink || '/blog'}>
                            <Button variant="outline" size="lg" className="h-16 px-10 rounded-full border-white/20 bg-white/5 text-white hover:bg-white hover:text-black transition-all font-bold text-lg gap-2 backdrop-blur-md">
                              <PlayCircle className="h-5 w-5" /> {banner.secondaryBtnText || 'Our Story'}
                            </Button>
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button 
            onClick={scrollPrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/5 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-primary"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button 
            onClick={scrollNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-white/5 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-primary"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 lg:left-20 lg:translate-x-0 z-30 flex gap-3">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${i === activeIndex ? 'w-12 bg-primary' : 'w-3 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}

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

