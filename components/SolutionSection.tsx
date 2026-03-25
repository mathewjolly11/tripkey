export default function SolutionSection() {
  const steps = [
    {
      number: '1',
      icon: (
        <svg className="w-12 h-12 text-sky-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 11l18-8-8 18-2-7-8-3z" />
        </svg>
      ),
      title: 'Add Travel Bookings',
      description:
        'Connect your hotel, transport, and attraction bookings to create your travel profile.',
    },
    {
      number: '2',
      icon: (
        <svg className="w-12 h-12 text-sky-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 18h2" />
        </svg>
      ),
      title: 'Generate TripKey',
      description:
        'Our system creates your secure, unique QR pass containing all your verified bookings.',
    },
    {
      number: '3',
      icon: (
        <svg className="w-12 h-12 text-sky-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3 3 7-7" />
        </svg>
      ),
      title: 'Instant Verification',
      description:
        'Scan your QR at any partner service and verify your booking in seconds.',
    },
  ];

  return (
    <section id="how-it-works" className="section-padding bg-white">
      <div className="container-max">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            How TripKey Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to simplify your entire travel experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div
                className="card-base text-center animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Number Badge */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {step.number}
                  </div>
                </div>

                <div className="pt-8">
                  <div className="mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Process Timeline Visual */}
        <div className="mt-16 bg-gradient-sky-light rounded-2xl p-8 lg:p-12 animate-fade-in">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            The TripKey Experience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="py-4">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-9 h-9 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v14m0-14a4 4 0 014-4h4v14h-4a4 4 0 00-4 4zm0-14a4 4 0 00-4-4H4v14h4a4 4 0 014 4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">Register Account</p>
            </div>
            <div className="flex items-center justify-center text-sky-500 text-2xl">→</div>
            <div className="py-4">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-9 h-9 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m3-12H9a2 2 0 00-2 2v14l4-3 4 3 4-3 4 3V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">Add Bookings</p>
            </div>
            <div className="flex items-center justify-center text-sky-500 text-2xl">→</div>
            <div className="py-4">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-9 h-9 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v2m0 4v2m0 4v1" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">Generate QR</p>
            </div>
            <div className="flex items-center justify-center text-sky-500 text-2xl">→</div>
            <div className="py-4">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-9 h-9 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4L12 3z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">Travel Freely</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
