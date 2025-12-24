import ClientEdit from './ClientEdit';

// SSR compatible for Vercel - Next.js 15+ params is a Promise

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientEdit id={id} />;
}
