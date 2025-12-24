'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Lock, Eye, Database, UserCheck, Globe, Clock, Mail, Settings, AlertCircle } from 'lucide-react';

export default function PrivacidadPage() {
  const { t } = useLanguage();

  const dataTypes = [
    {
      icon: UserCheck,
      title: 'Date de identificare',
      items: ['Nume și prenume', 'Adresă de email', 'Număr de telefon', 'Fotografie de profil']
    },
    {
      icon: Globe,
      title: 'Date de navigare',
      items: ['Adresă IP', 'Tipul de browser', 'Pagini vizitate', 'Ora și durata vizitelor']
    },
    {
      icon: Database,
      title: 'Date tranzacționale',
      items: ['Istoricul anunțurilor', 'Conversații cu alți utilizatori', 'Căutări realizate', 'Favorite salvate']
    }
  ];

  const rights = [
    { title: 'Dreptul de acces', desc: 'Poți solicita o copie a tuturor datelor tale personale pe care le deținem.' },
    { title: 'Dreptul de rectificare', desc: 'Poți corecta datele inexacte sau incomplete din contul tău.' },
    { title: 'Dreptul de ștergere', desc: 'Poți solicita ștergerea datelor tale personale în anumite condiții.' },
    { title: 'Dreptul la portabilitate', desc: 'Poți primi datele tale într-un format structurat și transferabil.' },
    { title: 'Dreptul de opoziție', desc: 'Poți te opune procesării datelor tale în scopuri specifice.' },
    { title: 'Dreptul la restricție', desc: 'Poți solicita limitarea procesării datelor tale în anumite situații.' }
  ];

  const sections = [
    {
      id: 'intro',
      title: '1. Introducere',
      content: `
        <p>La VINDEL, protecția datelor tale personale este o prioritate fundamentală. Această Politică de Confidențialitate descrie cum colectăm, utilizăm, stocăm și protejăm informațiile tale atunci când utilizezi platforma noastră.</p>
        <p>Această politică respectă Regulamentul General de Protecție a Datelor (GDPR) și legislația română aplicabilă în materie de protecție a datelor personale.</p>
      `
    },
    {
      id: 'responsible',
      title: '2. Operatorul de date',
      content: `
        <p><strong>Operator:</strong> VINDEL S.R.L.</p>
        <p><strong>Adresă:</strong> Strada Exemplu Nr. 123, București, România</p>
        <p><strong>Email:</strong> privacy@vindel.ro</p>
        <p><strong>Delegat pentru protecția datelor:</strong> dpo@vindel.ro</p>
      `
    },
    {
      id: 'purposes',
      title: '3. Scopurile procesării',
      content: `
        <p>Procesăm datele tale personale pentru următoarele scopuri:</p>
        <ul>
          <li><strong>Furnizarea serviciilor:</strong> Gestionarea contului tău, publicarea anunțurilor și facilitarea comunicării între utilizatori.</li>
          <li><strong>Îmbunătățirea serviciului:</strong> Analiza utilizării platformei pentru a îmbunătăți funcționalitățile și experiența utilizatorului.</li>
          <li><strong>Comunicări:</strong> Trimiterea de notificări importante despre serviciu și, cu consimțământul tău, comunicări comerciale.</li>
          <li><strong>Securitate:</strong> Prevenirea fraudei, protejarea platformei și asigurarea securității utilizatorilor.</li>
          <li><strong>Obligații legale:</strong> Respectarea obligațiilor legale și colaborarea cu autoritățile când este necesar.</li>
        </ul>
      `
    },
    {
      id: 'legal-basis',
      title: '4. Bazele legale ale procesării',
      content: `
        <p>Procesăm datele tale pe baza următoarelor temeiuri juridice:</p>
        <ul>
          <li><strong>Execuția contractului:</strong> Procesarea necesară pentru furnizarea serviciilor pe care le-ai solicitat.</li>
          <li><strong>Consimțământ:</strong> Pentru comunicări comerciale și utilizarea cookie-urilor neesențiale.</li>
          <li><strong>Interes legitim:</strong> Pentru îmbunătățirea serviciilor și prevenirea fraudei.</li>
          <li><strong>Obligație legală:</strong> Când suntem obligați prin lege să procesăm datele tale.</li>
        </ul>
      `
    },
    {
      id: 'sharing',
      title: '5. Partajarea datelor',
      content: `
        <p>Putem partaja datele tale cu:</p>
        <ul>
          <li><strong>Alți utilizatori:</strong> Informațiile din anunțuri și profilul public sunt vizibile pentru alți utilizatori.</li>
          <li><strong>Furnizori de servicii:</strong> Companii care ne ajută cu hosting, analiză, marketing și plăți.</li>
          <li><strong>Autorități:</strong> Când suntem obligați prin lege sau pentru a proteja drepturile noastre.</li>
        </ul>
        <p>Nu vindem niciodată datele tale personale terților.</p>
      `
    },
    {
      id: 'retention',
      title: '6. Perioada de păstrare',
      content: `
        <p>Păstrăm datele tale atât timp cât este necesar pentru a furniza serviciile și a respecta obligațiile legale:</p>
        <ul>
          <li><strong>Datele contului:</strong> Cât timp contul este activ și 3 ani după ștergere.</li>
          <li><strong>Anunțuri și mesaje:</strong> 1 an după expirare sau ștergere.</li>
          <li><strong>Datele de facturare:</strong> 10 ani conform legislației fiscale.</li>
          <li><strong>Cookie-uri:</strong> Variază conform politicii noastre de cookie-uri.</li>
        </ul>
      `
    },
    {
      id: 'security',
      title: '7. Securitatea datelor',
      content: `
        <p>Implementăm măsuri tehnice și organizatorice pentru a proteja datele tale:</p>
        <ul>
          <li>Criptare SSL/TLS pentru toate comunicațiile</li>
          <li>Criptarea datelor sensibile în repaus</li>
          <li>Controale stricte de acces la date</li>
          <li>Audituri regulate de securitate</li>
          <li>Formare continuă a personalului în protecția datelor</li>
        </ul>
        <p>În ciuda acestor măsuri, niciun sistem nu este 100% sigur. Dacă detectăm o încălcare care îți afectează datele, te vom notifica în conformitate cu legea.</p>
      `
    },
    {
      id: 'international',
      title: '8. Transferuri internaționale',
      content: `
        <p>Datele tale pot fi transferate în țări din afara Spațiului Economic European. În astfel de cazuri, ne asigurăm că există garanții adecvate, cum ar fi:</p>
        <ul>
          <li>Decizii de adecvare ale Comisiei Europene</li>
          <li>Clauze contractuale standard</li>
          <li>Alte mecanisme aprobate legal</li>
        </ul>
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Politica de Confidențialitate</h1>
              <p className="text-blue-200">Ultima actualizare: 24 decembrie 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Types */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ce date colectăm?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {dataTypes.map((type) => (
            <div key={type.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <type.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">{type.title}</h3>
              <ul className="space-y-2">
                {type.items.map((item) => (
                  <li key={item} className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Cuprins</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="block text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="prose prose-gray max-w-none">
                {sections.map((section) => (
                  <section key={section.id} id={section.id} className="mb-10 scroll-mt-24">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{section.title}</h2>
                    <div 
                      className="text-gray-600 space-y-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Your Rights */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Drepturile tale</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rights.map((right) => (
            <div key={right.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">{right.title}</h3>
              <p className="text-sm text-gray-600">{right.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Settings className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Exercită-ți drepturile</h3>
              <p className="text-gray-600 mb-2">
                Poți exercita aceste drepturi din setările contului tău sau contactându-ne la:
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
