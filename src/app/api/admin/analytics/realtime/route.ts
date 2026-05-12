import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export async function GET() {
  console.log('Realtime Analytics API Called');
  let domain = 'unknown';
  let propertyId = 'unknown';

  try {
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { getTenantDomain } = await import('@/lib/tenant');
    domain = await getTenantDomain() || 'unknown';
    if (!domain || domain === 'unknown') {
      return NextResponse.json({ message: 'Tenant domain is missing' }, { status: 400 });
    }

    // Security check: Ensure admin has access to this domain
    const isSuperAdmin = (session.user as any).role === 'super_admin';
    const userDomain = (session.user as any).domain;
    
    const cleanUserDomain = userDomain?.replace('www.', '').toLowerCase();
    const cleanDomain = domain?.replace('www.', '').toLowerCase();

    if (!isSuperAdmin && cleanUserDomain !== cleanDomain) {
      return NextResponse.json({ message: 'Unauthorized access to this tenant' }, { status: 403 });
    }

    const { getCachedSettings } = await import('@/lib/data-fetching');
    const settings = await getCachedSettings(domain);

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');
    propertyId = settings?.googleAnalyticsId || process.env.GOOGLE_GA4_PROPERTY_ID || 'unknown';

    console.log('Realtime Analytics Config Check:', {
      hasEmail: !!clientEmail,
      emailPrefix: clientEmail?.substring(0, 5),
      hasPrivateKey: !!privateKey,
      keyPrefix: privateKey?.substring(0, 20),
      propertyId
    });

    const analyticsClient = new BetaAnalyticsDataClient({
      credentials: { client_email: clientEmail, private_key: privateKey },
    });

    const [realtimeResponse] = await analyticsClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }]
    });

    const activeUsersNow = parseInt(realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

    return NextResponse.json({ activeUsersNow });

  } catch (error: any) {
    console.error('Realtime Analytics API Error:', error);
    let errorMsg = 'Unknown Error';
    
    if (error?.message) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    } else {
      try {
        errorMsg = JSON.stringify(error);
      } catch (e) {
        errorMsg = 'Circular or non-stringifiable error object';
      }
    }

    return NextResponse.json({ 
      activeUsersNow: 0, 
      message: `Failed to fetch realtime data: ${errorMsg}`,
      debug: {
        code: error?.code,
        status: error?.status,
        details: error?.details
      }
    }, { status: 500 });
  }
}

