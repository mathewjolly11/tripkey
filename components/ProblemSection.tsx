export default function ProblemSection() {
  const problems = [
    {
      icon: '📋',
      title: 'Managing Multiple Tickets',
      description:
        'Juggling dozens of bookings across different platforms and formats is chaotic and error-prone.',
    },
    {
      icon: '🔐',
      title: 'Repeated Identity Verification',
      description:
        'Prove your identity multiple times at different service points, wasting time and creating friction.',
    },
    {
      icon: '⏱️',
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
              <div className="text-5xl mb-4">{problem.icon}</div>
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
