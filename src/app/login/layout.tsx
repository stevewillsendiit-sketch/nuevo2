// Forzar renderizado dinámico para login
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
