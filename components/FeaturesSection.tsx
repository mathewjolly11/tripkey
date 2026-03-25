export default function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="w-10 h-10 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v2m0 4v2m0 4v1" />
        </svg>
      ),
      title: 'Unified Travel Identity',
      description: 'One QR code for all your travel needs - hotels, transport, attractions, and more.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="5" y="10" width="14" height="10" rx="2" ry="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 018 0v3" />
        </svg>
      ),
      title: 'Secure QR Verification',
      description:
        'Bank-level encryption ensures your data is protected at every step of verification.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" />
        </svg>
      ),
      title: 'Fast Entry at Services',
      description:
        'Skip long queues with instant scan-and-verify system at all partner locations.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 18h2" />
        </svg>
      ),
      title: 'Simple Booking Management',
      description:
        'Easily manage all your bookings from a single intuitive dashboard.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
        </svg>
      ),
      title: 'Global Service Network',
      description:
        'Works seamlessly across 100+ partner hotels, transport, and attractions worldwide.',
    },
    {
      icon: (
        <svg className="w-10 h-10 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 16V8m6 8V5m6 11v-6" />
        </svg>
      ),
      title: 'Travel Analytics',
      description:
        'Track your spending, visits, and travel patterns with beautiful visualizations.',
    },
  ];

  return (
    <section id="features" className="section-padding bg-gradient-sky-light">
      <div className="container-max">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need for a seamless travel experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-base group animate-slide-up hover:scale-105 transform"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>

              {/* Accent Line */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-sky-500 to-sky-400 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-sky-500 animate-fade-in">
            <p className="text-3xl font-bold text-sky-500 mb-2">24/7</p>
            <p className="text-gray-700 font-semibold">Always Available</p>
            <p className="text-sm text-gray-600 mt-1">Access your TripKey anytime, anywhere</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-sky-500 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <p className="text-3xl font-bold text-sky-500 mb-2">&lt;1s</p>
            <p className="text-gray-700 font-semibold">Lightning Fast</p>
            <p className="text-sm text-gray-600 mt-1">Verification completes in less than 1 second</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-sky-500 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <p className="text-3xl font-bold text-sky-500 mb-2">∞</p>
            <p className="text-gray-700 font-semibold">No Limits</p>
            <p className="text-sm text-gray-600 mt-1">Add unlimited bookings to your profile</p>
          </div>
        </div>
      </div>
    </section>
  );
}
