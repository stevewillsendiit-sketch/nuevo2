'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Search, MessageSquare, MapPin, CreditCard, CheckCircle, Shield, AlertTriangle, Star, ArrowRight, Eye, ThumbsUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ComoComprarPage() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: Search,
      number: '01',
      title: 'Caută ce ai nevoie',
      description: 'Folosește căutarea sau explorează categoriile pentru a găsi exact ce cauți. Filtrele te ajută să găsești mai rapid.',
      tips: [
        'Folosește cuvinte cheie specifice',
        'Filtrează după preț și locație',
        'Salvează căutările favorite',
        'Activează alertele pentru produse noi'
      ]
    },
    {
      icon: Eye,
      number: '02',
      title: 'Revizuiește anunțul cu atenție',
      description: 'Citește descrierea complet, uită-te la toate fotografiile și verifică profilul vânzătorului înainte de a contacta.',
      tips: [
        'Verifică toate fotografiile',
        'Citește descrierea complet',
        'Verifică reputația vânzătorului',
        'Compară cu alte anunțuri similare'
      ]
    },
    {
      icon: MessageSquare,
      number: '03',
      title: 'Contactează vânzătorul',
      description: 'Folosește chat-ul pentru a pune întrebări, a negocia prețul și a stabili detaliile întâlnirii sau livrării.',
      tips: [
        'Pune toate întrebările înainte de a te întâlni',
        'Cere mai multe fotografii dacă ai nevoie',
        'Negociază cu respect',
        'Confirmă disponibilitatea produsului'
      ]
    },
    {
      icon: MapPin,
      number: '04',
      title: 'Finalizează cumpărătura',
      description: 'Întâlnește-te cu vânzătorul într-un loc public sigur, verifică produsul și finalizează tranzacția.',
      tips: [
        'Alege întotdeauna locuri publice',
        'Verifică produsul înainte de a plăti',
        'Nu trimite bani în avans',
        'Salvează chitanța sau dovada'
      ]
    }
  ];

  const safetyTips = [
    {
      icon: Shield,
      title: 'Locuri publice',
      description: 'Întâlnește-te întotdeauna în locuri publice și aglomerate. Cafenele, centre comerciale sau comisariate sunt opțiuni bune.'
    },
    {
      icon: CreditCard,
      title: 'Plată în persoană',
      description: 'Plătește doar când ai produsul în mâini și l-ai verificat. Evită plățile în avans către necunoscuți.'
    },
    {
      icon: AlertTriangle,
      title: 'Prețuri suspecte',
      description: 'Dacă un preț pare prea bun pentru a fi adevărat, probabil că este o înșelătorie. Fii precaut și investighează.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-4">
                Ghid de cumpărare
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Cum să cumperi pe VINDEL
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Descoperă mii de produse la prețuri incredibile. Învață să cumperi în siguranță și să găsești cele mai bune oferte.
              </p>
              <Link href="/explore" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Explorează anunțuri
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-white/20 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-6xl font-bold">+50K</p>
                    <p className="text-white/80">anunțuri active</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-green-400 text-gray-900 px-4 py-2 rounded-xl font-semibold">
                  Verificate zilnic
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">4 pași pentru a cumpăra în siguranță</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Urmează aceste recomandări pentru a avea o experiență de cumpărare excelentă și sigură.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={step.number} className={`flex flex-col md:flex-row gap-8 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm text-blue-600 font-medium">Pasul {step.number}</span>
                    <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">{step.description}</p>
                <ul className="grid grid-cols-2 gap-2">
                  {step.tips.map((tip) => (
                    <li key={tip} className="text-sm text-gray-600 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {step.number}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Section */}
      <div className="bg-red-50 py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold mb-4">
              IMPORTANT
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sfaturi de securitate</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Securitatea ta este prioritatea noastră. Urmează aceste sfaturi pentru a evita problemele.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {safetyTips.map((tip) => (
              <div key={tip.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <tip.icon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-screen-xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Vânzători verificați</h3>
            <p className="text-gray-600">Verificăm profilurile și reputația vânzătorilor pentru siguranța ta.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Mii de opțiuni</h3>
            <p className="text-gray-600">Găsește de toate: de la electronice până la vehicule, modă și multe altele.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Actualizat zilnic</h3>
            <p className="text-gray-600">Mii de anunțuri noi în fiecare zi. Activează alertele pentru a nu pierde nimic.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-screen-xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Pregătit să găsești oferte?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Explorează mii de produse la cele mai bune prețuri. Descoperă-ți noua achiziție perfectă.
          </p>
          <Link href="/explore" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Începe să explorezi
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
