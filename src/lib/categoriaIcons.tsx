import React from 'react';
import { Categoria } from '@/types';
import {
  MdDirectionsCar,
  MdCheckroom,
  MdLaptop,
  MdHome,
  MdSportsSoccer,
  MdApps,
  MdApartment,
  MdWork,
  MdBuild,
  MdCardTravel,
  MdPets,
  MdChildCare,
  MdFemale,
  MdSportsEsports,
} from 'react-icons/md';

const iconClass = 'w-5 h-5';
const iconStyle = { width: '20px', height: '20px' };

// Icon for "All categories"
export const AllCategoriesIcon: React.FC<{ className?: string }> = ({ className = iconClass }) => (
  <MdApps className={className} style={iconStyle} aria-hidden />
);

export const getCategoriaIcon = (categoria: Categoria): React.ReactElement => {
  switch (categoria) {
    case Categoria.AUTO_MOTO:
      return <MdDirectionsCar className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.MODA_ACCESORII:
      return <MdCheckroom className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.ELECTRONICE:
      return <MdLaptop className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.CASA_GRADINA:
      return <MdHome className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.TIMP_LIBER_SPORT:
      return <MdSportsSoccer className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.IMOBILIARE:
      return <MdApartment className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.LOCURI_DE_MUNCA:
      return <MdWork className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.SERVICII:
      return <MdBuild className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.CAZARE_TURISM:
      return <MdCardTravel className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.ANIMALE:
      return <MdPets className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.MAMA_COPIL:
      return <MdChildCare className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.MATRIMONIALE:
      return <MdFemale className={iconClass} size={20} style={iconStyle} aria-hidden />;
    case Categoria.VIDEOJOCURI:
      return <MdSportsEsports className={iconClass} size={20} style={iconStyle} aria-hidden />;
    default:
      return <MdApps className={iconClass} size={20} style={iconStyle} aria-hidden />;
  }
};

export default getCategoriaIcon;
