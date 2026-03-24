import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, href = '/', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const logoContent = (
    <div className={`flex items-center gap-2 group ${className}`}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <Image
          src="/tripkeylogo.png"
          alt="TripKey Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-gray-900 group-hover:text-sky-500 transition-colors`}>
          TripKey
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
