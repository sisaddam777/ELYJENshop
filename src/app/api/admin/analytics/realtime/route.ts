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

    if (propertyId === 'unknown') {
       return NextResponse.json({ message: 'Property ID is not configured' }, { status: 400 });
    }

    console.log('Realtime API Execution State:', {
      domain,
      hasSettings: !!settings,
      hasEmail: !!clientEmail,
      propertyId,
      userRole: (session.user as any).role,
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
    console.error('Realtime Analytics API Error Details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    });
    
    // Robust error message extraction
    let errorMsg = 'Unknown Error';
    try {
      errorMsg = error?.message || error?.statusText || (typeof error === 'string' ? error : JSON.stringify(error));
    } catch (e) {
      errorMsg = String(error);
    }

    // Extract all keys from error for debugging
    const errorDebug: any = {};
    if (error && typeof error === 'object') {
      Object.getOwnPropertyNames(error).forEach(key => {
        errorDebug[key] = error[key];
      });
    }

    return NextResponse.json({ 
      activeUsersNow: 0, 
      message: `Failed to fetch realtime data: ${errorMsg}`,
      debug: errorDebug
    }, { status: 500 });
  }
}

