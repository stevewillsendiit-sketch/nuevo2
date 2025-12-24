'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, UserX, CreditCard, MessageSquare, MapPin, Phone, FileWarning, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

export default function SeguridadPage() {
  const { t } = useLanguage();

  const mainTips = [
    {
      icon: MapPin,
      title: 'Întâlnește-te în locuri publice',
      description: 'Alege întotdeauna locuri aglomerate și bine iluminate pentru întâlniri. Cafenele, centre comerciale sau zone centrale sunt opțiuni excelente.',
      color: 'blue'
    },
    {
      icon: CreditCard,
      title: 'Plată în persoană',
      description: 'Nu trimite niciodată bani în avans. Plătește doar când ai produsul în mâini și ai verificat că totul este în regulă.',
      color: 'green'
    },
    {
      icon: Eye,
      title: 'Verifică produsul',
      description: 'Inspectează cu atenție articolul înainte de a plăti. Verifică că funcționează corect și că se potrivește cu descrierea din anunț.',
      color: 'purple'
    },
    {
      icon: MessageSquare,
      title: 'Comunică prin platformă',
      description: 'Folosește chat-ul VINDEL pentru toate conversațiile. Așa vom avea înregistrări în caz de dispute.',
      color: 'orange'
    }
  ];

  const warningSignals = [
    'Prețuri mult sub valoarea de piață',
    'Vânzători care cer plată în avans',
    'Presiune pentru a decide rapid',
    'Refuz să se întâlnească în persoană',
    'Povești complicate sau contradictorii',
    'Solicitare de date bancare complete',
    'Link-uri către site-uri externe',
    'Gramatică proastă sau mesaje copiate'
  ];

  const fraudTypes = [
    {
      title: 'Phishing',
      description: 'Încearcă să-ți obțină datele personale sau bancare prin link-uri sau formulare false.',
      prevention: 'Nu accesa niciodată link-uri externe și nu furniza date sensibile prin chat.'
    },
    {
      title: 'Produse inexistente',
      description: 'Anunțuri cu fotografii furate de pe internet pentru produse pe care vânzătorul nu le are.',
      prevention: 'Cere fotografii suplimentare cu detalii specifice sau cu data zilei.'
    },
    {
      title: 'Supraprețuire falsă',
      description: 'Se oferă mai mulți bani decât ceri în schimbul unor "comisioane" pe care trebuie să le plătești mai întâi.',
      prevention: 'Nimeni nu plătește mai mult decât ceri. Orice situație de acest tip este o înșelătorie.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Centrul de Securitate</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Siguranța ta este prioritatea noastră. Învață cum să te protejezi și să faci tranzacții sigure.
          </p>
        </div>
      </div>

      {/* Main Tips */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Reguli de aur pentru siguranța ta</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Urmează aceste sfaturi de bază în fiecare tranzacție pentru a te proteja.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {mainTips.map((tip) => (
            <div key={tip.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4">
              <div className={`w-14 h-14 bg-${tip.color}-100 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <tip.icon className={`w-7 h-7 text-${tip.color}-600`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning Signs */}
      <div className="bg-red-50 py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
                <AlertTriangle className="w-4 h-4" />
                ATENȚIE
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Semnale de alarmă</h2>
              <p className="text-gray-600 mb-6">
                Dacă detectezi oricare dintre aceste semnale, fii foarte precaut. Probabil este o înșelătorie.
              </p>
              <Link href="/contacto" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                <FileWarning className="w-5 h-5" />
                Raportează o înșelătorie
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <ul className="space-y-3">
                {warningSignals.map((signal) => (
                  <li key={signal} className="flex items-start gap-3 text-gray-700">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    {signal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Fraud Types */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Tipuri de înșelătorii comune</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cunoaște cele mai frecvente tactici ale escrocilor pentru a te proteja.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {fraudTypes.map((fraud) => (
            <div key={fraud.title} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="bg-gray-900 text-white p-4">
                <h3 className="text-lg font-semibold">{fraud.title}</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">{fraud.description}</p>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-green-800 mb-1">Cum să te protejezi:</p>
                  <p className="text-sm text-green-700">{fraud.prevention}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What We Do */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Cum te protejăm noi</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Investim în tehnologie și echipe dedicate pentru a menține platforma sigură.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: BadgeCheck, title: 'Verificare de anunțuri', desc: 'Revizuim fiecare anunț înainte de publicare' },
              { icon: UserX, title: 'Detectare de fraude', desc: 'Sistem AI care detectează comportamente suspecte' },
              { icon: Lock, title: 'Date securizate', desc: 'Criptare SSL și protecție a datelor' },
              { icon: Phone, title: 'Suport 24/7', desc: 'Echipa pregătită să te ajute oricând' }
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Ai detectat o înșelătorie?</h2>
              <p className="text-white/80 mb-6">
                Ajută-ne să menținem comunitatea sigură. Raportează orice comportament suspect și echipa noastră va investiga imediat.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contacto" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                  Raportează acum
                </Link>
                <a href="mailto:security@vindel.ro" className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 rounded-xl font-medium hover:bg-white/10 transition-colors">
                  security@vindel.ro
                </a>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-48 h-48 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-24 h-24 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
