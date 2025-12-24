"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, Shield, CheckCircle, X, Loader2 } from 'lucide-react';

// Cargar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  amount: number;
  bonus: number;
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ELEMENT_STYLE = {
  base: {
    fontSize: '16px',
    color: '#1f2937',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    '::placeholder': {
      color: '#9ca3af',
    },
  },
  invalid: {
    color: '#ef4444',
    iconColor: '#ef4444',
  },
};

function CheckoutForm({ amount, bonus, clientSecret, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  const isFormComplete = cardNumberComplete && cardExpiryComplete && cardCvcComplete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'A apărut o eroare la procesarea plății');
        setPaymentStatus('error');
        setIsProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        setPaymentStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'A apărut o eroare neașteptată');
      setPaymentStatus('error');
      setIsProcessing(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Plată reușită!</h3>
        <p className="text-gray-600 text-sm">
          S-au adăugat <span className="font-bold text-emerald-600">{amount + bonus}€</span> în contul tău.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Número de tarjeta */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Număr card</label>
        <div className="p-4 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
          <CardNumberElement 
            options={{ 
              style: ELEMENT_STYLE,
              showIcon: true,
            }}
            onChange={(e) => setCardNumberComplete(e.complete)}
          />
        </div>
      </div>

      {/* Fecha y CVC en una fila */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expirare</label>
          <div className="p-4 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
            <CardExpiryElement 
              options={{ style: ELEMENT_STYLE }}
              onChange={(e) => setCardExpiryComplete(e.complete)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
          <div className="p-4 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white transition-all">
            <CardCvcElement 
              options={{ style: ELEMENT_STYLE }}
              onChange={(e) => setCardCvcComplete(e.complete)}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <X size={16} />
          {errorMessage}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Shield size={14} />
          <span>Plată securizată</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Lock size={14} />
          <span>SSL criptat</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || !isFormComplete}
        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
      >
        {isProcessing ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Se procesează...
          </>
        ) : (
          <>
            <Lock size={16} />
            Plătește {amount}€
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={isProcessing}
        className="w-full py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-colors disabled:opacity-50"
      >
        Anulează
      </button>
    </form>
  );
}

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  bonus: number;
  userId: string;
  userEmail: string;
  onSuccess: () => void;
}

export default function StripePaymentModal({
  isOpen,
  onClose,
  amount,
  bonus,
  userId,
  userEmail,
  onSuccess,
}: StripePaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && amount > 0) {
      setLoading(true);
      setError(null);
      
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, userId, userEmail }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            setError(data.error || 'Error la inițializarea plății');
          }
        })
        .catch(() => setError('Error de conexiune'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, amount, userId, userEmail]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CreditCard size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Plată cu cardul</h2>
              <p className="text-white/80 text-sm">
                Total: <span className="font-bold text-white">{amount}€</span>
                {bonus > 0 && <span className="text-emerald-300"> (+{bonus}€ bonus)</span>}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 size={28} className="animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Se inițializează plata...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <X size={28} className="text-red-600" />
              </div>
              <p className="text-red-600 mb-3 text-sm">{error}</p>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Închide
              </button>
            </div>
          ) : clientSecret ? (
            <Elements 
              stripe={stripePromise} 
              options={{ 
                clientSecret,
                appearance: { theme: 'stripe' }
              }}
            >
              <CheckoutForm
                amount={amount}
                bonus={bonus}
                clientSecret={clientSecret}
                onSuccess={() => { onSuccess(); onClose(); }}
                onCancel={onClose}
              />
            </Elements>
          ) : null}
        </div>
      </div>
    </div>
  );
}
