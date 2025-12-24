import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Validar que el monto esté en rango permitido
const MIN_AMOUNT = 1;  // 1€ mínimo
const MAX_AMOUNT = 1000; // 1000€ máximo

// Sanitizar string
function sanitizeString(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/[<>\"'&]/g, '').trim().slice(0, 255);
}

// Validar email básico
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // Verificar Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 415 }
      );
    }

    const body = await request.json();
    const { amount, userId, userEmail } = body;

    // ============================================
    // VALIDACIONES DE SEGURIDAD
    // ============================================
    
    // Validar que amount sea un número
    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Validar rango de monto
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Amount must be between ${MIN_AMOUNT}€ and ${MAX_AMOUNT}€` },
        { status: 400 }
      );
    }

    // Validar userId
    if (!userId || typeof userId !== 'string' || userId.length < 10) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Validar email
    if (userEmail && !isValidEmail(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitizar datos
    const safeUserId = sanitizeString(userId);
    const safeEmail = sanitizeString(userEmail);

    // Crear PaymentIntent solo con tarjeta, sin Link
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'eur',
      metadata: {
        userId: safeUserId,
        credits: amount.toString(),
        timestamp: Date.now().toString(),
      },
      receipt_email: safeEmail || undefined,
      payment_method_types: ['card'],
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      // Descripción para el extracto bancario
      statement_descriptor_suffix: 'VINDEL10',
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    console.error('Error creating payment intent:', error);
    
    // No revelar detalles del error en producción
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = isDev && error instanceof Error 
      ? error.message 
      : 'Payment initialization failed';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
