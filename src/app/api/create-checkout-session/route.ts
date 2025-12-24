import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, bonus, userId, userEmail } = await request.json();

    // Crear sesión de checkout de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Reîncărcare Credite Vindel10`,
              description: bonus > 0 
                ? `${amount}€ + ${bonus}€ bonus = ${amount + bonus}€ total` 
                : `${amount}€ credite`,
              images: ['https://vindel10.com/logo.png'],
            },
            unit_amount: amount * 100, // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?tab=perfil&payment=success&amount=${amount}&bonus=${bonus}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?tab=perfil&payment=cancelled`,
      metadata: {
        userId,
        amount: amount.toString(),
        bonus: bonus.toString(),
        totalCredits: (amount + bonus).toString(),
      },
      customer_email: userEmail,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear sesión de pago' },
      { status: 500 }
    );
  }
}
