export default function StakeholdersSection() {
  const stakeholders = [
    {
      icon: (
        <svg className="w-12 h-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6a3 3 0 016 0v1h3a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6" />
        </svg>
      ),
      title: 'Tourists',
      description:
        'Enjoy seamless travel with unified access to all your bookings via a single QR code. No more juggling multiple tickets or apps.',
      benefits: ['Unified Access', 'Quick Scanning', 'Secure Verification'],
    },
    {
      icon: (
        <svg className="w-12 h-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h2m-2 4h2m4-4h2m-2 4h2" />
        </svg>
      ),
      title: 'Service Providers',
      description:
        'Streamline operations with instant verification. Process guests faster, reduce verification time, and improve customer satisfaction.',
      benefits: ['Fast Verification', 'Reduced Queues', 'Better Analytics'],
    },
    {
      icon: (
        <svg className="w-12 h-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 21V9l7-4 7 4v12" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 21v-6h6v6" />
        </svg>
      ),
      title: 'Tourism Authorities',
      description:
        'Gain insights into visitor patterns and optimize tourism infrastructure planning with real-time data analytics.',
      benefits: ['Data Insights', 'Better Planning', 'Enhanced Safety'],
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Who Uses TripKey
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            TripKey creates value for all stakeholders in the tourism ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stakeholders.map((stakeholder, index) => (
            <div
              key={index}
              className="card-base hover:border-sky-500 border-2 border-transparent transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex items-center justify-center">{stakeholder.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {stakeholder.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{stakeholder.description}</p>

              {/* Benefits */}
              <div className="space-y-2">
                {stakeholder.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-sky-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-sm text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
