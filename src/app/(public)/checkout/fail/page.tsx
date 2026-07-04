'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function FailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      router.replace(`/checkout?order=failed&id=${id}`);
    } else {
      router.replace('/checkout?order=failed');
    }
  }, [id, router]);

  return (
    <div className="container py-24 flex justify-center items-center h-[50vh]">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
        <div className="container py-24 flex justify-center items-center h-[50vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    }>
        <FailContent />
    </Suspense>
  );
}
