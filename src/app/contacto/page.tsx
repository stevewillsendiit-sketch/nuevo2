'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Phone, MapPin, MessageSquare, Clock, Send, HelpCircle, FileText, Shield, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { enviarMensajeContacto } from '@/lib/contacto.service';

export default function ContactoPage() {
  const { t } = useLanguage();
  const { user, usuario } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Auto-rellenar datos si el usuario está logueado
  useEffect(() => {
    if (usuario?.nombre && !formData.name) {
      setFormData(prev => ({ ...prev, name: usuario.nombre }));
    }
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }
  }, [usuario, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    
    try {
      const resultado = await enviarMensajeContacto({
        nombre: formData.name,
        email: formData.email,
        asunto: formData.subject,
        mensaje: formData.message,
        userId: user?.uid // Incluir userId si está logueado
      });
      setTicketNumber(resultado.numeroTicket);
      setSubmitted(true);
    } catch (err) {
      setError('A apărut o eroare. Te rugăm să încerci din nou.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@vindel.ro',
      description: 'Răspundem în mai puțin de 24 de ore',
      color: 'blue'
    },
    {
      icon: Phone,
      title: 'Telefon',
      value: '+40 21 123 4567',
      description: 'Luni - Vineri, 9:00 - 18:00',
      color: 'green'
    },
    {
      icon: MessageSquare,
      title: 'Chat live',
      value: 'Disponibil 24/7',
      description: 'Răspuns instant în timpul orelor de lucru',
      color: 'purple'
    },
    {
      icon: MapPin,
      title: 'Adresă',
      value: 'București, România',
      description: 'Strada Exemplu Nr. 123',
      color: 'orange'
    }
  ];

  const quickLinks = [
    { icon: HelpCircle, title: 'Centru de ajutor', description: 'Găsește răspunsuri rapide', href: '/ayuda' },
    { icon: FileText, title: 'Întrebări frecvente', description: 'Cele mai comune întrebări', href: '/ayuda' },
    { icon: Shield, title: 'Raportează o problemă', description: 'Informează-ne despre o înșelătorie', href: '/seguridad' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Mail className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contactează-ne</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Suntem aici pentru a te ajuta. Echipa noastră de suport este pregătită să răspundă la toate întrebările tale.
          </p>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="max-w-screen-xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-4 gap-4">
          {contactMethods.map((method) => (
            <div key={method.title} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-shadow">
              <div className={`w-14 h-14 bg-${method.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <method.icon className={`w-7 h-7 text-${method.color}-600`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
              <p className="text-lg font-medium text-gray-900 mb-1">{method.value}</p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Trimite-ne un mesaj</h2>
            
            {/* Si no está logueado, mostrar mensaje */}
            {!user ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Autentificare necesară</h3>
                <p className="text-gray-600 mb-6">
                  Pentru a ne trimite un mesaj, trebuie să fii autentificat în contul tău.
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Autentifică-te
                </a>
              </div>
            ) : submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mesaj trimis!</h3>
                {ticketNumber && (
                  <div className="bg-white border border-green-200 rounded-xl px-4 py-3 mb-4 inline-block">
                    <p className="text-xs text-gray-500 mb-1">Numărul solicitării tale:</p>
                    <p className="text-lg font-mono font-bold text-indigo-600">#{ticketNumber}</p>
                  </div>
                )}
                <p className="text-gray-600 mb-4">
                  Îți mulțumim că ne-ai contactat. Vom răspunde cât mai curând posibil.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Poți vedea răspunsul în <a href="/profile?tab=soporte" className="text-indigo-600 hover:underline">Profilul tău → Suport</a>
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setTicketNumber('');
                    setFormData({ ...formData, subject: '', message: '' });
                  }}
                  className="text-green-600 font-medium hover:text-green-700"
                >
                  Trimite alt mesaj
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numele tău
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subiect *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Selectează un subiect</option>
                      <option value="general">Întrebare generală</option>
                      <option value="technical">Problemă tehnică</option>
                      <option value="account">Contul meu</option>
                      <option value="payment">Plăți și facturi</option>
                      <option value="report">Raportare înșelătorie</option>
                      <option value="suggestion">Sugestie</option>
                      <option value="other">Altele</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      placeholder="Descrie-ne pe larg cum te putem ajuta..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Se trimite...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Trimite mesajul
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Working Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Program de lucru</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Luni - Vineri</span>
                  <span className="font-medium text-gray-900">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sâmbătă</span>
                  <span className="font-medium text-gray-900">10:00 - 14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duminică</span>
                  <span className="font-medium text-gray-500">Închis</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-xl">
                <p className="text-sm text-green-700">
                  <strong>Chat-ul live</strong> este disponibil 24/7 pentru urgențe.
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Link-uri utile</h3>
              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <link.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{link.title}</p>
                      <p className="text-sm text-gray-500">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">București, România</p>
                <p className="text-sm text-gray-500">Strada Exemplu Nr. 123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
