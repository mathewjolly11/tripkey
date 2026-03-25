export default function AboutPage() {
  return (
    <main className="section-padding bg-white">
      <div className="container-max">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-widest text-sky-600 font-semibold">About TripKey</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-6">
            Building a unified travel identity for everyone
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            TripKey connects tourists, service providers, and tourism authorities
            through a single, secure QR identity. We simplify verification,
            reduce friction at check-in, and help travelers move faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="card-base border border-sky-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Mission</h2>
            <p className="text-sm text-gray-600">
              Make travel verification simple, secure, and instant for every trip.
            </p>
          </div>
          <div className="card-base border border-sky-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Vision</h2>
            <p className="text-sm text-gray-600">
              A world where every booking works together through one trusted key.
            </p>
          </div>
          <div className="card-base border border-sky-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Values</h2>
            <p className="text-sm text-gray-600">
              Privacy-first, transparent verification, and traveler-first design.
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card-base border border-sky-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">What we deliver</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>Unified QR identity for all bookings</li>
              <li>Instant verification for providers</li>
              <li>Secure, auditable approval workflow</li>
              <li>Analytics that help tourism operators plan smarter</li>
            </ul>
          </div>
          <div className="card-base border border-sky-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Who we serve</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>Travelers who need a single pass for every booking</li>
              <li>Providers who need fast, reliable verification</li>
              <li>Authorities who need trusted insights and visibility</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
