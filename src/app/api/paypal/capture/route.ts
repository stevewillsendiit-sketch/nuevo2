import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_API = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64');

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  return data.access_token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token'); // PayPal order ID
    const userId = searchParams.get('userId');
    const amount = searchParams.get('amount');
    const bonus = searchParams.get('bonus');

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?tab=perfil&payment=error`
      );
    }

    const accessToken = await getPayPalAccessToken();

    // Capturar el pago
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await response.json();

    if (captureData.status === 'COMPLETED') {
      // Pago exitoso - aquí deberías actualizar los créditos en Firebase
      // await updateUserCredits(userId, parseFloat(amount) + parseFloat(bonus));
      
      console.log(`✅ PayPal: Usuario ${userId} recibió ${parseFloat(amount!) + parseFloat(bonus!)}€ en créditos`);
      
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?tab=perfil&payment=success&amount=${amount}&bonus=${bonus}`
      );
    } else {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?tab=perfil&payment=error`
      );
    }
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?tab=perfil&payment=error`
    );
  }
}
