'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Camera, Tag, MessageSquare, CreditCard, CheckCircle, TrendingUp, Shield, Star, ArrowRight, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function ComoVenderPage() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Camera,
      number: '01',
      title: 'Fă fotografii atractive',
      description: 'Fotografiile bune fac diferența. Folosește lumină naturală, un fundal curat și fă mai multe fotografii din diferite unghiuri.',
      tips: [
        'Folosește lumina naturală a zilei',
        'Fundal neutru și curat',
        'Arată toate detaliile produsului',
        'Minimum 3-5 fotografii pe anunț'
      ]
    },
    {
      icon: Tag,
      number: '02',
      title: 'Stabilește un preț competitiv',
      description: 'Cercetează piața pentru a stabili un preț atractiv. Un preț corect te ajută să vinzi mai rapid.',
      tips: [
        'Caută produse similare pe VINDEL',
        'Ia în considerare starea produsului',
        'Fii deschis la negocieri',
        'Prețurile rotunde funcționează mai bine'
      ]
    },
    {
      icon: MessageSquare,
      number: '03',
      title: 'Scrie o descriere detaliată',
      description: 'Cu cât oferi mai multe informații, cu atât vei primi mai puține întrebări și vei genera mai multă încredere.',
      tips: [
        'Menționează marca și modelul',
        'Descrie starea reală',
        'Include măsuri sau specificații',
        'Fii sincer cu defectele'
      ]
    },
    {
      icon: CreditCard,
      number: '04',
      title: 'Finalizează vânzarea',
      description: 'Răspunde rapid la mesaje și oferă flexibilitate pentru întâlniri. O bună comunicare închide vânzări.',
      tips: [
        'Răspunde în mai puțin de 1 oră',
        'Fii flexibil cu orele de întâlnire',
        'Alege locuri publice sigure',
        'Pregătește produsul pentru livrare'
      ]
    }
  ];

  const proTips = [
    {
      icon: TrendingUp,
      title: 'Publică la ore de vârf',
      description: 'Cele mai bune ore pentru a publica sunt dimineața devreme (8-10h) și seara (19-21h), când mai mulți utilizatori navighează.'
    },
    {
      icon: Star,
      title: 'Promovează-ți anunțurile',
      description: 'Anunțurile promovate obțin de până la 10x mai multe vizualizări. Investește în vizibilitate pentru a vinde mai rapid.'
    },
    {
      icon: Shield,
      title: 'Construiește-ți reputația',
      description: 'Răspunde rapid, fii amabil și împlinește-ți promisiunile. O bună reputație generează mai multe vânzări.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                Ghid de vânzare
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Cum să vinzi pe VINDEL
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Învață cele mai bune practici pentru a-ți vinde produsele rapid și în siguranță. Mii de vânzători au succes în fiecare zi.
              </p>
              <Link href="/publish" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Publică acum gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-white/20 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-bold">+1M</p>
                    <p className="text-white/80">produse vândute</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl font-semibold">
                  100% Gratis
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">4 pași pentru a vinde cu succes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Urmează acest ghid pas cu pas și vei vedea cum produsele tale se vând mai rapid decât te aștepți.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number} className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm text-green-600 font-medium">Pasul {step.number}</span>
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{step.description}</p>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Sfaturi
                  </p>
                  <ul className="grid grid-cols-2 gap-2">
                    {step.tips.map((tip) => (
                      <li key={tip} className="text-sm text-green-700 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {step.number}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-yellow-500 text-gray-900 rounded-full text-sm font-bold mb-4">
              SFATURI PRO
            </span>
            <h2 className="text-3xl font-bold">Secretele vânzătorilor de succes</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {proTips.map((tip) => (
              <div key={tip.title} className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4">
                  <tip.icon className="w-6 h-6 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{tip.title}</h3>
                <p className="text-gray-300">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Pregătit să vinzi?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Publică primul tău anunț gratuit în mai puțin de 2 minute. Este ușor, rapid și sigur.
          </p>
          <Link href="/publish" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Publică anunț gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
