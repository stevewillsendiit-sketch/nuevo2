'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Mail, Phone, MapPin, Globe, FileText, Scale, AlertCircle } from 'lucide-react';

export default function AvisoLegalPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Aviz Legal</h1>
              <p className="text-gray-300">Informații legale despre VINDEL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Company Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">VINDEL S.R.L.</h2>
                  <p className="text-sm text-gray-500">Platformă de anunțuri</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Adresă</p>
                    <p className="text-sm text-gray-600">Strada Exemplu Nr. 123<br />București, 010101, România</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date fiscale</p>
                    <p className="text-sm text-gray-600">CUI: RO12345678<br />Nr. Reg. Com.: J40/1234/2020</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a href="mailto:legal@vindel.ro" className="text-sm text-blue-600 hover:text-blue-700">legal@vindel.ro</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Telefon</p>
                    <a href="tel:+40211234567" className="text-sm text-blue-600 hover:text-blue-700">+40 21 123 4567</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Website</p>
                    <a href="https://www.vindel.ro" className="text-sm text-blue-600 hover:text-blue-700">www.vindel.ro</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="prose prose-gray max-w-none">
                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">1. Identificarea titularului</h2>
                  <p className="text-gray-600 mb-4">
                    În conformitate cu obligația de informare prevăzută în Legea nr. 365/2002 privind comerțul electronic și Legea nr. 677/2001 pentru protecția persoanelor cu privire la prelucrarea datelor cu caracter personal, vă informăm că:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Denumirea societății: VINDEL S.R.L.</li>
                    <li>Sediul social: Strada Exemplu Nr. 123, București, România</li>
                    <li>Cod unic de înregistrare (CUI): RO12345678</li>
                    <li>Număr de înregistrare în Registrul Comerțului: J40/1234/2020</li>
                    <li>Capital social: 10.000 RON</li>
                    <li>Email de contact: legal@vindel.ro</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">2. Obiectul și scopul</h2>
                  <p className="text-gray-600 mb-4">
                    VINDEL este o platformă online care permite utilizatorilor să publice și să vizualizeze anunțuri pentru vânzarea sau cumpărarea de bunuri și servicii. Platforma acționează ca intermediar, facilitând contactul între cumpărători și vânzători.
                  </p>
                  <p className="text-gray-600">
                    VINDEL nu participă în tranzacțiile realizate între utilizatori și nu garantează calitatea, siguranța, legalitatea sau disponibilitatea articolelor publicate.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">3. Proprietate intelectuală</h2>
                  <p className="text-gray-600 mb-4">
                    Toate drepturile de proprietate intelectuală asupra conținutului acestui site web (inclusiv, dar fără a se limita la: texte, imagini, logo-uri, design, coduri sursă și software) aparțin VINDEL S.R.L. sau licențiatorilor săi.
                  </p>
                  <p className="text-gray-600">
                    Este strict interzisă reproducerea, distribuirea, transformarea sau comunicarea publică a conținutului fără autorizarea expresă prealabilă a VINDEL S.R.L.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">4. Condiții de utilizare</h2>
                  <p className="text-gray-600 mb-4">
                    Utilizarea acestui site web implică acceptarea deplină a Termenilor și Condițiilor noastre. Consultați documentul complet în secțiunea <a href="/terminos" className="text-blue-600 hover:text-blue-700">Termeni și Condiții</a>.
                  </p>
                  <p className="text-gray-600">
                    Utilizatorii se angajează să utilizeze platforma în conformitate cu legea, morala și ordinea publică, abstinându-se de la orice utilizare care poate fi prejudicabilă pentru terți sau pentru funcționarea corectă a platformei.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">5. Protecția datelor</h2>
                  <p className="text-gray-600 mb-4">
                    VINDEL S.R.L. respectă legislația în vigoare privind protecția datelor personale, în special Regulamentul (UE) 2016/679 (GDPR).
                  </p>
                  <p className="text-gray-600">
                    Pentru informații complete despre cum colectăm, utilizăm și protejăm datele dvs. personale, consultați <a href="/privacidad" className="text-blue-600 hover:text-blue-700">Politica de Confidențialitate</a>.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">6. Excluderea răspunderii</h2>
                  <p className="text-gray-600 mb-4">
                    VINDEL S.R.L. nu este responsabilă pentru:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Conținutul anunțurilor publicate de utilizatori</li>
                    <li>Tranzacțiile realizate între utilizatori</li>
                    <li>Veridicitatea informațiilor furnizate de utilizatori</li>
                    <li>Întreruperile sau erorile în funcționarea platformei</li>
                    <li>Daunele directe sau indirecte rezultate din utilizarea platformei</li>
                    <li>Conținutul site-urilor externe la care se poate face referire</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">7. Legislație și jurisdicție</h2>
                  <p className="text-gray-600 mb-4">
                    Acest site web și utilizarea sa sunt guvernate de legislația română. Pentru orice controversă derivată din utilizarea acestui site, părțile se supun jurisdicției instanțelor din București, România, renunțând în mod expres la orice altă jurisdicție care le-ar putea corespunde.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">8. Contact</h2>
                  <p className="text-gray-600 mb-4">
                    Pentru orice întrebare sau clarificare cu privire la acest Aviz Legal, ne puteți contacta la:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Email: <a href="mailto:legal@vindel.ro" className="text-blue-600 hover:text-blue-700">legal@vindel.ro</a></li>
                    <li>Telefon: +40 21 123 4567</li>
                    <li>Adresă: Strada Exemplu Nr. 123, București, România</li>
                  </ul>
                </section>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Declinarea răspunderii</h3>
                  <p className="text-sm text-amber-700">
                    Acest document este furnizat doar în scop informativ. Pentru sfaturi juridice specifice, vă recomandăm să consultați un avocat calificat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
