import React from 'react';
import { getAssetUrl } from '../utils/assetUrl';
import {
  Mic,
  Network,
  FileSearch,
  SearchCheck,
  Brain,
  Clapperboard,
  ShieldCheck,
  MapPin,
  Coffee,
  Utensils,
  LucideProps,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Mic,
  Network,
  FileSearch,
  SearchCheck,
  Brain,
  Clapperboard,
  ShieldCheck,
  MapPin,
  Coffee,
  Utensils,
};

interface AppIconProps extends LucideProps {
  name: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name] || Mic;
  return <IconComponent aria-hidden="true" {...props} />;
};

export const TayqanLogo: React.FC = () => {
  return (
    <img
      className="logo"
      src={getAssetUrl('brand/tayqan.png')}
      alt="شعار منصة تَيَقَّن الأصلي"
      width={110}
      height={67}
    />
  );
};
