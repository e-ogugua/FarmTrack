import { ComponentType } from 'react';

interface IconWrapperProps {
  icon: ComponentType<{ className?: string }>;
  className?: string;
}

export function IconWrapper({ icon: Icon, className = '' }: IconWrapperProps) {
  return <Icon className={`h-5 w-5 ${className}`} />;
}
