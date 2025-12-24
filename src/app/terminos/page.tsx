'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Scale, Users, AlertTriangle, CheckCircle, Mail } from 'lucide-react';

export default function TerminosPage() {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'general',
      title: '1. Condiții generale',
      content: `
        <p>Bine ai venit pe VINDEL. Acești termeni și condiții (denumiți în continuare "Termeni") reglementează utilizarea platformei noastre de anunțuri online (denumită în continuare "Platforma" sau "VINDEL").</p>
        <p>Accesând sau utilizând VINDEL, accepți să fii obligat prin acești Termeni. Dacă nu ești de acord cu vreunul dintre Termeni, te rugăm să nu folosești Platforma.</p>
        <p>Ne rezervăm dreptul de a modifica acești Termeni în orice moment. Modificările vor intra în vigoare la publicare. Continuarea utilizării Platformei după publicarea modificărilor constituie acceptarea Termenilor modificați.</p>
      `
    },
    {
      id: 'users',
      title: '2. Utilizatori și conturi',
      content: `
        <p><strong>2.1 Eligibilitate:</strong> Pentru a utiliza VINDEL, trebuie să ai cel puțin 18 ani sau vârsta legală în jurisdicția ta. Dacă ești minor, poți utiliza Platforma doar sub supravegherea unui adult.</p>
        <p><strong>2.2 Înregistrare:</strong> Pentru a accesa anumite funcții, este necesară crearea unui cont. Ești responsabil pentru menținerea confidențialității datelor tale de acces și pentru toate activitățile care au loc în contul tău.</p>
        <p><strong>2.3 Informații exacte:</strong> Te angajezi să furnizezi informații veridice, exacte și actualizate. VINDEL își rezervă dreptul de a suspenda sau de a anula conturile care conțin informații false.</p>
        <p><strong>2.4 Un cont per persoană:</strong> Fiecare persoană poate avea un singur cont de utilizator. Crearea de conturi multiple poate duce la suspendarea tuturor conturilor asociate.</p>
      `
    },
    {
      id: 'ads',
      title: '3. Publicarea anunțurilor',
      content: `
        <p><strong>3.1 Conținut permis:</strong> Poți publica anunțuri pentru bunuri și servicii legale. Conținutul trebuie să fie veridic și să nu inducă în eroare potențialii cumpărători.</p>
        <p><strong>3.2 Conținut interzis:</strong> Este strict interzisă publicarea de:</p>
        <ul>
          <li>Produse ilegale sau furate</li>
          <li>Arme, muniții sau explozibil</li>
          <li>Droguri sau substanțe controlate</li>
          <li>Produse contrafăcute</li>
          <li>Conținut pentru adulți sau pornografie</li>
          <li>Servicii sau produse care promovează discriminarea</li>
          <li>Date personale ale terților fără consimțământ</li>
        </ul>
        <p><strong>3.3 Drept de eliminare:</strong> VINDEL își rezervă dreptul de a elimina orice anunț care încalcă acești Termeni sau care este considerat inadecvat, fără notificare prealabilă.</p>
      `
    },
    {
      id: 'transactions',
      title: '4. Tranzacții',
      content: `
        <p><strong>4.1 Rol intermediar:</strong> VINDEL acționează exclusiv ca intermediar între cumpărători și vânzători. Nu suntem parte în tranzacțiile realizate pe Platformă.</p>
        <p><strong>4.2 Responsabilitate:</strong> VINDEL nu garantează calitatea, siguranța sau legalitatea articolelor publicate, nici veridicitatea anunțurilor sau capacitatea vânzătorilor de a vinde.</p>
        <p><strong>4.3 Dispute:</strong> Disputele dintre utilizatori trebuie rezolvate între părțile implicate. VINDEL poate oferi suport de mediere, dar nu este obligat să intervină.</p>
        <p><strong>4.4 Siguranță:</strong> Recomandăm cu tărie să întâlniți potențialii cumpărători/vânzători în locuri publice și să verificați produsele înainte de a efectua orice plată.</p>
      `
    },
    {
      id: 'intellectual',
      title: '5. Proprietate intelectuală',
      content: `
        <p><strong>5.1 Conținut al Platformei:</strong> Tot conținutul VINDEL (design, logo-uri, texte, grafică) este proprietatea noastră sau a licențiatorilor noștri și este protejat de legile privind proprietatea intelectuală.</p>
        <p><strong>5.2 Conținut al utilizatorilor:</strong> Păstrezi drepturile de proprietate intelectuală asupra conținutului pe care îl publici. Cu toate acestea, ne acorzi o licență neexclusivă, gratuită și mondială pentru a-l utiliza, reproduce și afișa în scopul operării Platformei.</p>
        <p><strong>5.3 Raportare de încălcări:</strong> Dacă consideri că vreun conținut de pe Platformă încalcă drepturile tale de proprietate intelectuală, te rugăm să ne contactezi cu informațiile relevante.</p>
      `
    },
    {
      id: 'liability',
      title: '6. Limitarea răspunderii',
      content: `
        <p><strong>6.1 Utilizare pe propriul risc:</strong> Utilizezi VINDEL pe propriul risc. Platforma este furnizată "așa cum este" și "conform disponibilității".</p>
        <p><strong>6.2 Fără garanții:</strong> Nu garantăm că Platforma va fi neîntreruptă, securizată sau fără erori. Nu ne asumăm responsabilitatea pentru pierderile care rezultă din utilizarea sau imposibilitatea de a utiliza Platforma.</p>
        <p><strong>6.3 Conținut al terților:</strong> VINDEL poate conține link-uri către site-uri terțe. Nu suntem responsabili pentru conținutul sau practicile acestor site-uri.</p>
        <p><strong>6.4 Pierderi indirecte:</strong> În nicio circumstanță VINDEL nu va fi responsabil pentru daune indirecte, incidentale, speciale sau consecvențiale.</p>
      `
    },
    {
      id: 'termination',
      title: '7. Reziliere',
      content: `
        <p><strong>7.1 De către utilizator:</strong> Poți închide contul tău în orice moment din setări sau contactându-ne.</p>
        <p><strong>7.2 De către VINDEL:</strong> Ne rezervăm dreptul de a suspenda sau de a rezilia contul tău în orice moment, în special dacă:</p>
        <ul>
          <li>Încalci acești Termeni</li>
          <li>Suspectăm activitate frauduloasă</li>
          <li>Este necesar pentru a proteja alți utilizatori sau Platforma</li>
          <li>Este impus de lege</li>
        </ul>
        <p><strong>7.3 Efecte:</strong> La reziliere, vei pierde accesul la contul și conținutul tău. Anumite prevederi ale acestor Termeni vor rămâne în vigoare după reziliere.</p>
      `
    },
    {
      id: 'law',
      title: '8. Legislație și jurisdicție',
      content: `
        <p><strong>8.1 Legislație aplicabilă:</strong> Acești Termeni sunt guvernați de legislația română.</p>
        <p><strong>8.2 Jurisdicție:</strong> Orice dispută va fi supusă jurisdicției exclusive a instanțelor din București, România.</p>
        <p><strong>8.3 Separabilitate:</strong> Dacă o prevedere a acestor Termeni este declarată nulă sau inaplicabilă, celelalte prevederi vor rămâne în vigoare.</p>
      `
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Termeni și Condiții</h1>
              <p className="text-gray-400">Ultima actualizare: 24 decembrie 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
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

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
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

              {/* Contact */}
              <div className="mt-10 p-6 bg-blue-50 rounded-2xl">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Întrebări despre acești termeni?</h3>
                    <p className="text-gray-600 mb-2">
                      Dacă ai întrebări despre acești Termeni și Condiții, ne poți contacta la:
                    </p>
                    <a href="mailto:legal@vindel.ro" className="text-blue-600 font-medium hover:text-blue-700">
                      legal@vindel.ro
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
