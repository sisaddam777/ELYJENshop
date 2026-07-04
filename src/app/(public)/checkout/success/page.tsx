'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, ArrowRight, Home, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      router.replace(`/checkout?order=success&id=${id}`);
    } else {
      router.replace('/checkout');
    }
  }, [id, router]);

  return (
    <div className="container py-24 flex justify-center items-center h-[50vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
        <div className="container py-24 flex justify-center items-center h-[50vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    }>
        <SuccessContent />
    </Suspense>
  );
}

