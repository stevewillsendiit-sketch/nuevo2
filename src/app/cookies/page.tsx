'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Cookie, Settings, BarChart, Target, Shield, ToggleLeft, ToggleRight, Info, Check } from 'lucide-react';
import { useState } from 'react';

export default function CookiesPage() {
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: true
  });

  const cookieTypes = [
    {
      id: 'necessary',
      icon: Shield,
      title: 'Cookie-uri necesare',
      description: 'Esențiale pentru funcționarea site-ului. Nu pot fi dezactivate.',
      required: true,
      examples: ['Sesiune de utilizator', 'Preferințe de securitate', 'Funcționalitate de bază'],
      retention: 'Sesiune - 1 an'
    },
    {
      id: 'analytics',
      icon: BarChart,
      title: 'Cookie-uri analitice',
      description: 'Ne ajută să înțelegem cum folosești site-ul pentru a-l îmbunătăți.',
      required: false,
      examples: ['Google Analytics', 'Hotjar', 'Statistici de utilizare'],
      retention: '2 ani'
    },
    {
      id: 'marketing',
      icon: Target,
      title: 'Cookie-uri de marketing',
      description: 'Folosite pentru a-ți arăta publicitate relevantă.',
      required: false,
      examples: ['Google Ads', 'Facebook Pixel', 'Redirecționare'],
      retention: '90 zile - 2 ani'
    },
    {
      id: 'preferences',
      icon: Settings,
      title: 'Cookie-uri de preferințe',
      description: 'Rețin preferințele tale pentru o experiență personalizată.',
      required: false,
      examples: ['Limba selectată', 'Preferințe de afișare', 'Căutări recente'],
      retention: '1 an'
    }
  ];

  const handleToggle = (id: string) => {
    if (id === 'necessary') return; // Nu se poate dezactiva
    setPreferences(prev => ({ ...prev, [id]: !prev[id as keyof typeof prev] }));
  };

  const handleSavePreferences = () => {
    // Salvează preferințele în cookie
    document.cookie = `cookie_preferences=${JSON.stringify(preferences)};path=/;max-age=31536000`;
    alert('Preferințele au fost salvate!');
  };

  const handleAcceptAll = () => {
    setPreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    });
    document.cookie = `cookie_preferences=${JSON.stringify({necessary: true, analytics: true, marketing: true, preferences: true})};path=/;max-age=31536000`;
    alert('Toate cookie-urile au fost acceptate!');
  };

  const handleRejectAll = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    });
    document.cookie = `cookie_preferences=${JSON.stringify({necessary: true, analytics: false, marketing: false, preferences: false})};path=/;max-age=31536000`;
    alert('Doar cookie-urile necesare au fost acceptate!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Cookie className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Politica de Cookie-uri</h1>
              <p className="text-amber-100">Ultima actualizare: 24 decembrie 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ce sunt cookie-urile?</h2>
          <p className="text-gray-600 mb-4">
            Cookie-urile sunt fișiere mici de text care se stochează pe dispozitivul tău când vizitezi un site web. Ele permit site-ului să-și amintească informații despre vizita ta, făcând următoarele vizite mai ușoare și site-ul mai util pentru tine.
          </p>
          <p className="text-gray-600 mb-4">
            La VINDEL folosim cookie-uri pentru a-ți oferi cea mai bună experiență posibilă, pentru a analiza cum utilizezi site-ul nostru și, cu consimțământul tău, pentru a-ți arăta publicitate relevantă.
          </p>
          <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Poți schimba preferințele de cookie-uri în orice moment folosind panoul de mai jos sau din setările browserului tău.
            </p>
          </div>
        </div>
      </div>

      {/* Cookie Preferences Panel */}
      <div className="bg-white py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestionează preferințele tale</h2>
          
          <div className="grid gap-4 mb-8">
            {cookieTypes.map((cookie) => (
              <div 
                key={cookie.id} 
                className={`rounded-2xl border-2 p-6 transition-colors ${
                  preferences[cookie.id as keyof typeof preferences] 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      preferences[cookie.id as keyof typeof preferences]
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      <cookie.icon className={`w-6 h-6 ${
                        preferences[cookie.id as keyof typeof preferences]
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{cookie.title}</h3>
                        {cookie.required && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full font-medium">
                            Obligatoriu
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{cookie.description}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {cookie.examples.map((example) => (
                          <span key={example} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                            {example}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">Durată: {cookie.retention}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(cookie.id)}
                    disabled={cookie.required}
                    className={`flex-shrink-0 ${cookie.required ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                  >
                    {preferences[cookie.id as keyof typeof preferences] ? (
                      <div className="w-14 h-8 bg-green-500 rounded-full flex items-center justify-end px-1">
                        <div className="w-6 h-6 bg-white rounded-full shadow flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-14 h-8 bg-gray-300 rounded-full flex items-center px-1">
                        <div className="w-6 h-6 bg-white rounded-full shadow"></div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={handleRejectAll}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Refuză opționalele
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Salvează preferințele
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Acceptă toate
            </button>
          </div>
        </div>
      </div>

      {/* More Information */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Informații suplimentare</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cum să gestionezi cookie-urile din browser</h3>
              <p className="text-gray-600 mb-3">
                Majoritatea browserelor îți permit să controlezi cookie-urile prin setări. Aici găsești link-uri către instrucțiunile pentru browserele populare:
              </p>
              <ul className="space-y-2">
                {[
                  { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                  { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/ro/kb/sterge-cookie-uri' },
                  { name: 'Safari', url: 'https://support.apple.com/ro-ro/guide/safari/sfri11471/mac' },
                  { name: 'Microsoft Edge', url: 'https://support.microsoft.com/ro-ro/microsoft-edge/ștergerea-cookie-urilor-în-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' }
                ].map((browser) => (
                  <li key={browser.name}>
                    <a 
                      href={browser.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {browser.name} →
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Consecințele dezactivării cookie-urilor</h3>
              <p className="text-gray-600">
                Dacă dezactivezi cookie-urile, anumite funcții ale site-ului pot să nu funcționeze corect. De exemplu, nu vei putea rămâne conectat sau preferințele tale nu vor fi salvate între sesiuni.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Actualizări ale acestei politici</h3>
              <p className="text-gray-600">
                Putem actualiza această politică periodic. Îți recomandăm să o verifici regulat. Modificările semnificative vor fi notificate pe site sau prin email.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Întrebări?</h3>
              <p className="text-gray-600 mb-3">
                Dacă ai întrebări despre utilizarea cookie-urilor, contactează-ne:
              </p>
              <a href="mailto:privacy@vindel.ro" className="text-blue-600 font-medium hover:text-blue-700">
                privacy@vindel.ro
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
