'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { tripKeyAlert } from '@/lib/alerts';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await tripKeyAlert.signOutConfirm();

    if (result.isConfirmed) {
      await signOut();
      router.push('/');
      setIsOpen(false);
      await tripKeyAlert.success('Signed Out', 'You have been successfully signed out.');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-sky-100">
      <div className="container-max">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center">
            <div className="relative h-12 w-36">
              <Image
                src="/tripkeylogobg.png"
                alt="TripKey"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#home"
              className="text-gray-700 hover:text-sky-500 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="#about"
              className="text-gray-700 hover:text-sky-500 transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-700 hover:text-sky-500 transition-colors font-medium"
            >
              How It Works
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && !loading ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-sky-500 transition-colors font-medium">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="btn-outline px-5 py-2 text-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline px-5 py-2 text-sm">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary px-5 py-2 text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-sky-50 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-slide-down">
            <Link
              href="#home"
              className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link
              href="#about"
              className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded-lg transition-colors"
            >
              About
            </Link>
            <Link
              href="#how-it-works"
              className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded-lg transition-colors"
            >
              How It Works
            </Link>
            <div className="flex gap-2 pt-2">
              {isAuthenticated && !loading ? (
                <>
                  <Link href="/dashboard" className="btn-outline flex-1 text-sm py-2">
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="btn-primary flex-1 text-sm py-2">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-outline flex-1 text-sm py-2">
                    Login
                  </Link>
                  <Link href="/signup" className="btn-primary flex-1 text-sm py-2">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
