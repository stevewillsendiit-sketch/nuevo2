"use client";

// Página de error global para Next.js App Router
// No usar contextos ni hooks personalizados aquí
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ro">
      <body style={{ fontFamily: 'sans-serif', background: '#f8fafc', color: '#222', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: 32, maxWidth: 400, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Ups! Ceva nu a funcționat</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>{error?.message || 'A apărut o eroare neașteptată.'}</p>
          <button onClick={reset} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
            Încearcă din nou
          </button>
        </div>
      </body>
    </html>
  );
}
