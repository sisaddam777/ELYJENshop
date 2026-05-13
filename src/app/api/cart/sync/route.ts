import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { getTenantDomain } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json();
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ message: 'Invalid items array' }, { status: 400 });
    }

    const domain = await getTenantDomain();
    await connectToDatabase();

    const validItems = [];
    let removedCount = 0;

    for (const item of items) {
      const product = await Product.findOne({ 
        _id: item.productId, 
        domain, 
        isPublished: true 
      });

      if (!product) {
        removedCount++;
        continue;
      }

      // If item has variant details, check if they still exist
      if (item.color || item.size) {
        const variant = product.variants?.find((v: any) => 
          (v.color || undefined) === (item.color || undefined) &&
          (v.size || undefined) === (item.size || undefined)
        );
        
        if (!variant) {
          removedCount++;
          continue;
        }
      }

      validItems.push(item);
    }

    return NextResponse.json({ 
      validItems, 
      removedCount 
    });

  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
