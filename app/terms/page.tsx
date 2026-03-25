export default function TermsPage() {
  return (
    <main className="section-padding bg-white">
      <div className="container-max max-w-4xl">
        <p className="text-sm uppercase tracking-widest text-sky-600 font-semibold">Terms of Service</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-6">
          Please read these terms carefully
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          By using TripKey, you agree to these terms. They outline acceptable
          use, account responsibilities, and service limitations.
        </p>

        <section id="accounts" className="card-base border border-sky-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Account responsibilities</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Provide accurate information during signup</li>
            <li>Keep your login credentials secure</li>
            <li>Notify us of any unauthorized access</li>
          </ul>
        </section>

        <section id="acceptable-use" className="card-base border border-sky-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Acceptable use</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Do not attempt to bypass verification steps</li>
            <li>Do not upload fraudulent or misleading documents</li>
            <li>Respect other users and providers on the platform</li>
          </ul>
        </section>

        <section id="limitations" className="card-base border border-sky-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Service limitations</h2>
          <p className="text-sm text-gray-600">
            TripKey is provided as-is. We make every effort to keep the service
            reliable, but we do not guarantee uninterrupted availability.
          </p>
        </section>

        <section id="changes" className="card-base border border-sky-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to terms</h2>
          <p className="text-sm text-gray-600">
            We may update these terms from time to time. Material changes will
            be communicated through the app or email.
          </p>
        </section>
      </div>
    </main>
  );
}
