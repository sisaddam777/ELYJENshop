import { NextRequest, NextResponse } from 'next/server';
import { getCachedSettings } from '@/lib/data-fetching';
import { headers } from 'next/headers';
import crypto from 'crypto';

/**
 * Facebook Conversions API (CAPI) Route Handler
 * Prioritizes environment variables for configuration.
 */

async function hashData(data: string): Promise<string> {
    if (!data) return '';
    try {
        const hash = crypto.createHash('sha256');
        hash.update(data.trim().toLowerCase());
        return hash.digest('hex');
    } catch (error) {
        console.error('[FB CAPI] Hashing error:', error);
        return '';
    }
}

export async function POST(request: NextRequest) {
    try {
        const headersList = await headers();
        const hostname = headersList.get('host') || 'localhost';
        
        // Fetch settings for logging/context, but prioritize ENV for credentials as requested
        const settings = await getCachedSettings(hostname);

        const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
        const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
        const testEventCode = settings?.facebookTestEventCode || process.env.NEXT_PUBLIC_FACEBOOK_TEST_EVENT_CODE || process.env.FACEBOOK_TEST_EVENT_CODE;

        if (!pixelId || !accessToken) {
            console.error('[FB CAPI] Missing configuration for', hostname, { 
                hasPixelId: !!pixelId, 
                hasAccessToken: !!accessToken 
            });
            return NextResponse.json({ error: 'Missing Facebook configuration' }, { status: 500 });
        }

        const body = await request.json();
        const { 
            eventName = 'PageView', 
            eventUrl, 
            userAgent, 
            customData = {}, 
            userData = {} 
        } = body;

        // Get real client IP
        const ipAddress =
            request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            request.headers.get('x-real-ip') ||
            '0.0.0.0';

        // Use event ID from client for deduplication, fallback to random
        const eventId = body.eventId || crypto.randomUUID();

        // Get browser identifiers from cookies
        // Extract cookies for matching
        const fbp = request.cookies.get('_fbp')?.value || userData.fbp || userData.fbpCookie;
        const fbc = request.cookies.get('_fbc')?.value || userData.fbc || userData.fbcCookie;

        if (process.env.NODE_ENV === 'development') {
            console.log(`[FB CAPI] Event: ${eventName}, ID: ${eventId}`);
            console.log(`[FB CAPI] Cookies - fbp: ${fbp ? 'Found' : 'Missing'}, fbc: ${fbc ? 'Found' : 'Missing'}`);
        }

        // --- Hashing & Normalization ---
        const hashedEmail = userData.em ? await hashData(userData.em) : undefined;
        
        // Process phone: ensure digits only and has country code (BD default: 88)
        let phone = userData.ph ? userData.ph.replace(/\D/g, '') : '';
        if (phone && !phone.startsWith('88') && phone.length <= 11) {
            phone = '88' + phone;
        }
        const hashedPhone = phone ? await hashData(phone) : undefined;
        
        const hashedFirstName = userData.fn ? await hashData(userData.fn) : undefined;
        const hashedLastName = userData.ln ? await hashData(userData.ln) : undefined;
        const hashedCity = userData.ct ? await hashData(userData.ct) : undefined;
        const hashedState = userData.st ? await hashData(userData.st) : undefined;
        const hashedZip = userData.zp ? await hashData(userData.zp) : undefined;
        const hashedCountry = userData.country ? await hashData(userData.country) : undefined;

        // Prepare user data object (filtered for undefined values)
        const fbUserData: any = {
            client_ip_address: ipAddress,
            client_user_agent: userAgent,
            ...(fbp && { fbp }),
            ...(fbc && { fbc }),
            ...(hashedEmail && { em: [hashedEmail] }),
            ...(hashedPhone && { ph: [hashedPhone] }),
            ...(hashedFirstName && { fn: [hashedFirstName] }),
            ...(hashedLastName && { ln: [hashedLastName] }),
            ...(hashedCity && { ct: [hashedCity] }),
            ...(hashedState && { st: [hashedState] }),
            ...(hashedZip && { zp: [hashedZip] }),
            ...(hashedCountry && { country: [hashedCountry] }),
        };

        const payload: any = {
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: eventId,
                    event_source_url: eventUrl,
                    action_source: 'website',
                    user_data: fbUserData,
                    custom_data: {
                        ...customData,
                    },
                },
            ],
            // Sending access_token in the body is often more reliable
            access_token: accessToken,
        };

        if (testEventCode) {
            payload.test_event_code = testEventCode;
        }

        const fbResponse = await fetch(
            `https://graph.facebook.com/v19.0/${pixelId}/events`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        const result = await fbResponse.json();

        if (!fbResponse.ok) {
            console.error('[FB CAPI] Error Response:', JSON.stringify(result, null, 2));
            return NextResponse.json(
                { error: 'Facebook API Error', details: result },
                { status: fbResponse.status }
            );
        }

        console.log(`[FB CAPI] Success: ${eventName} (${eventId})`);
        return NextResponse.json({ success: true, eventId });

    } catch (error: any) {
        console.error('[FB CAPI] Unexpected error:', error.message || error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

