import { UserCircle, Car, List, Heart, Settings, LogOut, MapPin, CreditCard, Sliders, Gift, Scale } from 'lucide-react';
import Link from 'next/link';

const menu = [
  { name: 'AUTODOC PLUS', icon: <Gift size={20} />, path: '#' },
  { name: 'Mis vehículos', icon: <Car size={20} />, path: '#' },
  { name: 'Mis pedidos', icon: <List size={20} />, path: '#' },
  { name: 'AUTODOC CLUB', icon: <UserCircle size={20} />, path: '#' },
  { name: 'Mis direcciones', icon: <MapPin size={20} />, path: '#' },
  { name: 'Datos bancarios', icon: <CreditCard size={20} />, path: '#' },
  { name: 'Configuraciones', icon: <Sliders size={20} />, path: '#' },
  { name: 'Mi cuenta de depósito', icon: <CreditCard size={20} />, path: '#' },
  { name: 'Mi lista de deseos', icon: <Heart size={20} />, path: '#' },
  { name: 'Comparación', icon: <Scale size={20} />, path: '#' },
];

export default function ProfileSidebar() {
  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="text-lg font-bold px-8 py-6 border-b border-gray-100">Mi AUTODOC</div>
      <nav className="flex-1">
        <ul className="py-2">
          {menu.map((item) => (
            <li key={item.name}>
              <Link href={item.path} className="flex items-center gap-3 px-8 py-3 text-base text-gray-800 hover:bg-orange-500 hover:text-white transition rounded-lg">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button className="flex items-center gap-2 px-8 py-4 text-gray-500 hover:text-orange-500 transition text-base border-t border-gray-100">
        <LogOut size={20} />
        Cerrar sesión
      </button>
    </aside>
  );
}
