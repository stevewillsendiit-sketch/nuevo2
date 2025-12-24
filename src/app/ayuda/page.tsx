'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { HelpCircle, MessageCircle, Phone, Mail, FileText, Shield, CreditCard, Package, User, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AyudaPage() {
  const { t } = useLanguage();

  const categories = [
    {
      icon: User,
      title: 'Contul meu',
      description: 'Gestionează-ți contul, parola și setările',
      items: [
        'Cum îmi creez un cont?',
        'Cum îmi schimb parola?',
        'Cum îmi șterg contul?',
        'Cum îmi verific emailul?'
      ]
    },
    {
      icon: Package,
      title: 'Cumpărare și vânzare',
      description: 'Tot ce trebuie să știi despre tranzacții',
      items: [
        'Cum cumpăr un produs?',
        'Cum public un anunț?',
        'Cum editez sau șterg un anunț?',
        'De ce a fost șters anunțul meu?'
      ]
    },
    {
      icon: CreditCard,
      title: 'Plăți și facturi',
      description: 'Informații despre plăți și facturare',
      items: [
        'Ce metode de plată acceptați?',
        'Cum primesc factura?',
        'Cum solicit o rambursare?',
        'Sunt plățile sigure?'
      ]
    },
    {
      icon: Shield,
      title: 'Securitate',
      description: 'Protejează-ți contul și datele',
      items: [
        'Cum evit escrocheriile?',
        'Ce fac dacă detectez o fraudă?',
        'Cum raportez un utilizator?',
        'Sfaturi pentru tranzacții sigure'
      ]
    }
  ];

  const faqs = [
    {
      question: 'Cum public un anunț?',
      answer: 'Pentru a publica un anunț, conectează-te la contul tău și apasă pe butonul "Publică". Completează formularul cu titlul, descrierea, prețul și fotografiile produsului. Anunțul va fi revizuit și publicat în câteva minute.'
    },
    {
      question: 'Cât costă să public un anunț?',
      answer: 'Publicarea anunțurilor de bază este complet gratuită. Oferim opțiuni premium pentru a-ți evidenția anunțurile și a obține mai multă vizibilitate.'
    },
    {
      question: 'Cum contactez un vânzător?',
      answer: 'Poți contacta orice vânzător prin sistemul nostru de mesagerie intern. Apasă pe butonul "Contactează" din orice anunț pentru a începe o conversație.'
    },
    {
      question: 'Este sigur să cumpăr pe VINDEL?',
      answer: 'Da, implementăm măsuri de securitate avansate. Totuși, îți recomandăm să urmezi sfaturile noastre de securitate: întâlnește-te în locuri publice, verifică produsul înainte de a plăti și nu partaja date personale.'
    },
    {
      question: 'Cum raportez un anunț suspect?',
      answer: 'În fiecare anunț vei găsi opțiunea "Raportează". Selectează motivul și echipa noastră va revizui cazul în cel mult 24 de ore.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">Centru de Ajutor</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Găsește răspunsuri la întrebările tale și învață să folosești VINDEL
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Caută ajutor..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/30 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Categorii de ajutor</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <category.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{category.description}</p>
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li key={item}>
                    <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <ChevronRight className="w-4 h-4" />
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Întrebări frecvente</h2>
          <div className="space-y-4 max-w-3xl">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-gray-50 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Ai nevoie de mai mult ajutor?</h2>
              <p className="text-gray-300 mb-6">
                Echipa noastră de suport este disponibilă 24/7 pentru a te ajuta cu orice întrebare.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contacto" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  Chat live
                </Link>
                <a href="mailto:support@vindel.ro" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 rounded-xl font-medium hover:bg-white/10 transition-colors">
                  <Mail className="w-5 h-5" />
                  support@vindel.ro
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Phone className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="font-medium">Telefon</p>
                <p className="text-sm text-gray-300">+40 21 123 4567</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Mail className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-300">24h răspuns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
