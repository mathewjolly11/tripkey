import Link from 'next/link';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative bg-white pt-20 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 overflow-hidden"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 right-0 w-80 h-80 bg-sky-50 rounded-full opacity-60 blur-3xl"></div>
        <div className="absolute -bottom-40 left-0 w-80 h-80 bg-sky-100 rounded-full opacity-60 blur-3xl"></div>
      </div>

      <div className="container-max relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              TripKey –{' '}
              <span className="text-gradient">One QR for Your Entire Trip</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              A unified digital identity that replaces multiple tickets with a
              single secure QR pass. Simplify your travel experience with instant
              access to all your bookings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup?role=provider" className="btn-primary text-center">Get Started</Link>
              <Link href="#how-it-works" className="btn-secondary text-center">Learn More</Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap gap-6">
              <div>
                <p className="text-2xl font-bold text-sky-500">100+</p>
                <p className="text-sm text-gray-600">Partners Worldwide</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-500">50K+</p>
                <p className="text-sm text-gray-600">Happy Travelers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-sky-500">99.9%</p>
                <p className="text-sm text-gray-600">Uptime Guarantee</p>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative h-96 sm:h-[500px] animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-100 to-sky-50 rounded-2xl shadow-xl overflow-hidden">
              {/* QR Code Illustration */}
              <svg
                className="w-full h-full p-8"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Airplane Icon */}
                <circle cx="200" cy="100" r="40" fill="#0EA5E9" opacity="0.1" />
                <path
                  d="M200 70L190 95L210 95M190 115L210 115"
                  stroke="#0EA5E9"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* QR Code Representation */}
                <rect
                  x="120"
                  y="180"
                  width="160"
                  height="160"
                  rx="12"
                  fill="white"
                  stroke="#0EA5E9"
                  strokeWidth="2"
                />

                {/* QR Pattern */}
                <g fill="#0EA5E9">
                  <rect x="130" y="190" width="20" height="20" />
                  <rect x="160" y="190" width="8" height="8" />
                  <rect x="130" y="220" width="12" height="12" />
                  <rect x="180" y="210" width="10" height="10" />
                  <rect x="150" y="250" width="15" height="15" />
                  <rect x="190" y="250" width="12" height="12" />
                  <rect x="130" y="280" width="20" height="20" />
                  <rect x="250" y="190" width="20" height="20" />
                  <rect x="250" y="280" width="20" height="20" />
                </g>

                {/* Check Mark */}
                <circle cx="200" cy="350" r="25" fill="#10B981" />
                <path
                  d="M192 350L197 355L210 342"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* Floating Card 1 */}
            <div className="absolute -top-8 -left-6 bg-white rounded-xl p-4 shadow-lg w-40 animate-bounce">
              <p className="text-sm font-semibold text-gray-900">Instant Access</p>
              <p className="text-xs text-gray-600 mt-1">Scan & Go in seconds</p>
            </div>

            {/* Floating Card 2 */}
            <div className="absolute -bottom-6 -right-8 bg-white rounded-xl p-4 shadow-lg w-40 animate-bounce" style={{ animationDelay: '0.3s' }}>
              <p className="text-sm font-semibold text-gray-900">Secure & Verified</p>
              <p className="text-xs text-gray-600 mt-1">Bank-level encryption</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
