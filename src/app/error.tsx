"use client";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
	return (
		<html lang="ro">
			<body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial', background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<div style={{ background: '#fff', padding: 28, borderRadius: 12, boxShadow: '0 6px 30px rgba(0,0,0,0.08)', textAlign: 'center' }}>
					<h1 style={{ margin: 0, fontSize: 22 }}>Eroare</h1>
					<p style={{ color: '#555' }}>{error?.message || 'A apărut o eroare.'}</p>
					<button onClick={reset} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>Încearcă din nou</button>
				</div>
			</body>
		</html>
	);
}
