import { NextRequest, NextResponse } from 'next/server';

// PayPal API endpoints
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

export async function POST(request: NextRequest) {
  try {
    const { amount, bonus, userId } = await request.json();
    
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'EUR',
              value: amount.toString(),
            },
            description: bonus > 0 
              ? `Vindel10: ${amount}€ + ${bonus}€ bonus = ${amount + bonus}€ credite`
              : `Vindel10: ${amount}€ credite`,
            custom_id: JSON.stringify({ userId, amount, bonus }),
          },
        ],
        application_context: {
          brand_name: 'Vindel10',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/paypal/capture?userId=${userId}&amount=${amount}&bonus=${bonus}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?tab=perfil&payment=cancelled`,
        },
      }),
    });

    const order = await response.json();

    if (order.id) {
      // Buscar el link de aprobación
      const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
      return NextResponse.json({ orderId: order.id, approvalUrl });
    } else {
      throw new Error(order.message || 'Error creating PayPal order');
    }
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear orden de PayPal' },
      { status: 500 }
    );
  }
}
