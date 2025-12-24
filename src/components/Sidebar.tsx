
import Link from 'next/link';

import { LayoutDashboard, Star, ShoppingBag, Bell, Settings, HelpCircle, ListOrdered } from 'lucide-react';

const menu = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'Mis Anuncios', path: '/profile?tab=mis-anuncios', icon: <ListOrdered size={20} /> },
  { name: 'Favoritos', path: '/profile?tab=favoritos', icon: <Star size={20} /> },
  { name: 'Mis Ventas', path: '/mis-ventas', icon: <ShoppingBag size={20} /> },
  { name: 'Notificaciones', path: '/notificaciones', icon: <Bell size={20} /> },
  { name: 'Ajustes', path: '/profile/settings', icon: <Settings size={20} /> },
  { name: 'Ayuda', path: '#', icon: <HelpCircle size={20} /> },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-gray-100 to-blue-50 text-gray-800 flex flex-col min-h-screen p-4 sticky top-0 h-screen shadow-xl border-r border-gray-200">
      <div className="text-2xl font-extrabold mb-8 text-blue-700 tracking-tight select-none">Remunix</div>
      <nav className="flex-1">
        <ul className="space-y-1">
          {menu.map((item) => (
            <li key={item.name}>
              <Link href={item.path} className="flex items-center gap-3 rounded-lg px-4 py-2 font-medium hover:bg-blue-100 hover:text-blue-700 transition group">
                <span className="text-lg group-hover:text-blue-600">{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-8 p-4 bg-blue-100 rounded-xl text-center shadow">
        <div className="mb-2 font-semibold text-blue-700">Funciones Pro para potenciar tu cuenta</div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Upgrade Pro</button>
      </div>
      <div className="mt-4 text-xs text-gray-400 text-center">© 2025 Remunix</div>
    </aside>
  );
}
