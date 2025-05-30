import React from 'react';
import { Bot } from 'lucide-react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-r from-primary-600 to-secondary-500 rounded-lg p-1`}>
      <Bot className="h-6 w-6 text-white" />
    </div>
  );
};

export default Logo;