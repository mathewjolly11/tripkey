export default function PrivacyPolicyPage() {
  return (
    <main className="section-padding bg-white">
      <div className="container-max max-w-4xl">
        <p className="text-sm uppercase tracking-widest text-sky-600 font-semibold">Privacy Policy</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-6">
          Your data, handled with care
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          This policy explains how TripKey collects, uses, and protects your
          information. We only collect what we need to deliver verification,
          and we never sell your data.
        </p>

        <section id="data" className="card-base border border-sky-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Data we collect</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Account details such as name, email, and role</li>
            <li>Booking metadata needed to generate your QR pass</li>
            <li>Verification activity for auditing and security</li>
          </ul>
        </section>

        <section id="security" className="card-base border border-sky-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How we protect it</h2>
          <p className="text-sm text-gray-600">
            We use encryption, role-based access controls, and audit trails to
            keep your data safe. Access to sensitive data is restricted to
            approved personnel and automated processes.
          </p>
        </section>

        <section id="rights" className="card-base border border-sky-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Your rights</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Request a copy of your data</li>
            <li>Correct inaccurate profile details</li>
            <li>Delete your account and associated records</li>
          </ul>
        </section>

        <section id="contact" className="card-base border border-sky-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact us</h2>
          <p className="text-sm text-gray-600">
            Email privacy requests to support@tripkey.app. We respond within
            two business days.
          </p>
        </section>
      </div>
    </main>
  );
}
