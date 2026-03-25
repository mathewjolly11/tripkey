export default function ContactPage() {
  return (
    <main className="section-padding bg-white">
      <div className="container-max max-w-4xl">
        <p className="text-sm uppercase tracking-widest text-sky-600 font-semibold">Contact</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-6">
          We are here to help
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-10">
          Reach out for support, partnership requests, or general questions.
          Our team responds within two business days.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card-base border border-sky-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Email</h2>
            <p className="text-sm text-gray-600">support@tripkey.app</p>
          </div>
          <div className="card-base border border-sky-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Phone</h2>
            <p className="text-sm text-gray-600">+1 (555) 013-0248</p>
          </div>
          <div className="card-base border border-sky-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Hours</h2>
            <p className="text-sm text-gray-600">Mon-Fri, 9:00 AM to 6:00 PM</p>
          </div>
        </div>

        <form className="card-base border border-sky-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Send a message</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contact-name">
                Full name
              </label>
              <input
                id="contact-name"
                type="text"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contact-email">
                Email address
              </label>
              <input
                id="contact-email"
                type="email"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contact-message">
              Message
            </label>
            <textarea
              id="contact-message"
              rows={5}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/20 focus:outline-none"
              placeholder="Tell us how we can help"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-sky-500 text-white px-6 py-3 font-semibold hover:bg-sky-600 transition"
          >
            Send message
          </button>
        </form>
      </div>
    </main>
  );
}
