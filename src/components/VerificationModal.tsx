"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Send, 
  Shield, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  sendVerificationEmail,
  checkEmailVerification,
  sendPhoneVerificationCode,
  verifyPhoneCode,
  initRecaptcha,
  cleanupRecaptcha,
  getVerificationStatus,
  VerificationStatus,
} from '@/lib/verification.service';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export default function VerificationModal({ isOpen, onClose, onVerified }: VerificationModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado para email
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  
  // Estado para teléfono
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Cargar estado de verificación
  useEffect(() => {
    if (isOpen && user) {
      loadVerificationStatus();
    }
  }, [isOpen, user]);

  // Countdown para reenviar código
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Cleanup reCAPTCHA
  useEffect(() => {
    return () => {
      cleanupRecaptcha();
    };
  }, []);

  const loadVerificationStatus = async () => {
    setLoading(true);
    try {
      const verificationStatus = await getVerificationStatus();
      setStatus(verificationStatus);
    } catch (error) {
      console.error('Error cargando estado:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VERIFICACIÓN DE EMAIL
  // ============================================
  
  const handleSendEmailVerification = async () => {
    setEmailError(null);
    setLoading(true);
    
    try {
      await sendVerificationEmail();
      setEmailSent(true);
    } catch (error: any) {
      setEmailError(error.message || 'Eroare la trimiterea emailului');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmailVerification = async () => {
    setCheckingEmail(true);
    setEmailError(null);
    
    try {
      const verified = await checkEmailVerification();
      if (verified) {
        setStatus(prev => prev ? { ...prev, emailVerified: true } : null);
        onVerified?.();
      } else {
        setEmailError('Emailul nu a fost încă verificat. Verifică inbox-ul.');
      }
    } catch (error: any) {
      setEmailError(error.message);
    } finally {
      setCheckingEmail(false);
    }
  };

  // ============================================
  // VERIFICACIÓN DE TELÉFONO
  // ============================================

  const handleSendPhoneCode = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setPhoneError('Introdu un număr de telefon valid');
      return;
    }

    setPhoneError(null);
    setSendingCode(true);

    try {
      // Inicializar reCAPTCHA
      initRecaptcha('recaptcha-container');
      
      const verId = await sendPhoneVerificationCode(phoneNumber);
      setVerificationId(verId);
      setCodeSent(true);
      setCountdown(60); // 60 segundos para reenviar
    } catch (error: any) {
      setPhoneError(error.message || 'Eroare la trimiterea SMS-ului');
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyPhoneCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setPhoneError('Introdu codul de 6 cifre');
      return;
    }

    setPhoneError(null);
    setVerifyingCode(true);

    try {
      await verifyPhoneCode(verificationCode);
      setStatus(prev => prev ? { ...prev, phoneVerified: true, phone: phoneNumber } : null);
      onVerified?.();
    } catch (error: any) {
      setPhoneError(error.message || 'Cod invalid');
    } finally {
      setVerifyingCode(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Verifică contul</h2>
              <p className="text-white/80 text-sm">Securizează-ți contul</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'email'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Mail size={18} />
            Email
            {status?.emailVerified && <CheckCircle size={16} className="text-green-500" />}
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'phone'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone size={18} />
            Telefon
            {status?.phoneVerified && <CheckCircle size={16} className="text-green-500" />}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">Se încarcă...</p>
            </div>
          ) : (
            <>
              {/* Email Verification Tab */}
              {activeTab === 'email' && (
                <div className="space-y-4">
                  {status?.emailVerified ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Email verificat!</h3>
                      <p className="text-gray-600 text-sm">{status.email}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Mail className="text-blue-600 mt-0.5" size={20} />
                          <div>
                            <p className="font-medium text-blue-900">Verifică emailul</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Vom trimite un link de verificare la <strong>{status?.email}</strong>
                            </p>
                          </div>
                        </div>
                      </div>

                      {emailSent ? (
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <Send className="text-green-600 mt-0.5" size={20} />
                              <div>
                                <p className="font-medium text-green-900">Email trimis!</p>
                                <p className="text-sm text-green-700 mt-1">
                                  Verifică inbox-ul (și spam) și apasă pe link.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleCheckEmailVerification}
                            disabled={checkingEmail}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {checkingEmail ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Verificăm...
                              </>
                            ) : (
                              <>
                                <RefreshCw size={18} />
                                Am verificat emailul
                              </>
                            )}
                          </button>
                          
                          <button
                            onClick={handleSendEmailVerification}
                            className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Retrimite emailul
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleSendEmailVerification}
                          disabled={loading}
                          className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Send size={18} />
                          )}
                          Trimite email de verificare
                        </button>
                      )}

                      {emailError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                          <AlertCircle size={16} />
                          {emailError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Phone Verification Tab */}
              {activeTab === 'phone' && (
                <div className="space-y-4">
                  {status?.phoneVerified ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Telefon verificat!</h3>
                      <p className="text-gray-600 text-sm">{status.phone}</p>
                    </div>
                  ) : (
                    <>
                      {!codeSent ? (
                        <>
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <Phone className="text-blue-600 mt-0.5" size={20} />
                              <div>
                                <p className="font-medium text-blue-900">Verifică telefonul</p>
                                <p className="text-sm text-blue-700 mt-1">
                                  Vom trimite un cod SMS pentru verificare.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Număr de telefon
                            </label>
                            <div className="flex gap-2">
                              <div className="w-20 px-3 py-3 bg-gray-100 border border-gray-300 rounded-xl text-center font-medium text-gray-700">
                                +40
                              </div>
                              <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                placeholder="7XX XXX XXX"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                maxLength={10}
                              />
                            </div>
                          </div>

                          <button
                            onClick={handleSendPhoneCode}
                            disabled={sendingCode || phoneNumber.length < 9}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {sendingCode ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Se trimite...
                              </>
                            ) : (
                              <>
                                <Send size={18} />
                                Trimite cod SMS
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <Send className="text-green-600 mt-0.5" size={20} />
                              <div>
                                <p className="font-medium text-green-900">Cod trimis!</p>
                                <p className="text-sm text-green-700 mt-1">
                                  Am trimis un cod de 6 cifre la +40{phoneNumber}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cod de verificare
                            </label>
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-bold tracking-[0.5em]"
                              maxLength={6}
                            />
                          </div>

                          <button
                            onClick={handleVerifyPhoneCode}
                            disabled={verifyingCode || verificationCode.length !== 6}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {verifyingCode ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Verificăm...
                              </>
                            ) : (
                              <>
                                <CheckCircle size={18} />
                                Verifică codul
                              </>
                            )}
                          </button>

                          <div className="flex items-center justify-between text-sm">
                            <button
                              onClick={() => {
                                setCodeSent(false);
                                setVerificationCode('');
                              }}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              ← Schimbă numărul
                            </button>
                            
                            {countdown > 0 ? (
                              <span className="text-gray-500">
                                Retrimite în {countdown}s
                              </span>
                            ) : (
                              <button
                                onClick={handleSendPhoneCode}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Retrimite codul
                              </button>
                            )}
                          </div>
                        </>
                      )}

                      {phoneError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                          <AlertCircle size={16} />
                          {phoneError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* reCAPTCHA container (invisible) */}
          <div id="recaptcha-container"></div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            Închide
          </button>
        </div>

        {/* Status Summary */}
        {status && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Status verificare:</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                {status.emailVerified ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <XCircle size={14} className="text-gray-400" />
                )}
                <span className={status.emailVerified ? 'text-green-700' : 'text-gray-500'}>
                  Email
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                {status.phoneVerified ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <XCircle size={14} className="text-gray-400" />
                )}
                <span className={status.phoneVerified ? 'text-green-700' : 'text-gray-500'}>
                  Telefon
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
