export default function ProblemSection() {
  const problems = [
    {
      icon: (
        <svg className="w-12 h-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="7" y="3" width="10" height="18" rx="2" ry="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m-6 4h6m-6 4h6" />
        </svg>
      ),
      title: 'Managing Multiple Tickets',
      description:
        'Juggling dozens of bookings across different platforms and formats is chaotic and error-prone.',
    },
    {
      icon: (
        <svg className="w-12 h-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="5" y="10" width="14" height="10" rx="2" ry="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 018 0v3" />
        </svg>
      ),
      title: 'Repeated Identity Verification',
      description:
        'Prove your identity multiple times at different service points, wasting time and creating friction.',
    },
    {
      icon: (
        <svg className="w-12 h-12 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="13" r="8" strokeLinecap="round" strokeLinejoin="round" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4l2 2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6" />
        </svg>
      ),
      title: 'Long Queues at Service Points',
      description:
        'Manual verification processes create bottlenecks, leading to frustrating waits and delays.',
    },
  ];

  return (
    <section id="about" className="section-padding bg-gradient-sky-light">
      <div className="container-max">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            The Problem Tourists Face
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Traveling involves juggling multiple bookings, verifications, and
            service points. TripKey eliminates this complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="card-base animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex items-center justify-center">{problem.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
