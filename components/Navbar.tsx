'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-sky-100">
      <div className="container-max">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-sky-500 transition-colors">
              TripKey
            </span>
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
            <button className="btn-outline px-5 py-2 text-sm">
              Login
            </button>
            <button className="btn-primary px-5 py-2 text-sm">
              Sign Up
            </button>
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
              <button className="btn-outline flex-1 text-sm py-2">
                Login
              </button>
              <button className="btn-primary flex-1 text-sm py-2">
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
