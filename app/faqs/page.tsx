const faqs = [
  {
    question: 'What is TripKey?',
    answer:
      'TripKey is a unified travel identity that combines bookings into one secure QR pass for fast verification.',
  },
  {
    question: 'How do I get verified as a provider?',
    answer:
      'Sign up as a provider, upload your verification document, and wait for admin approval.',
  },
  {
    question: 'Is my booking data secure?',
    answer:
      'Yes. We use encryption and role-based access controls to keep your data protected.',
  },
  {
    question: 'Can I delete my account?',
    answer:
      'Yes. You can delete your account from your dashboard settings at any time.',
  },
  {
    question: 'Who can scan my QR pass?',
    answer:
      'Only verified service providers can scan and verify TripKey QR passes.',
  },
];

export default function FaqsPage() {
  return (
    <main className="section-padding bg-white">
      <div className="container-max max-w-4xl">
        <p className="text-sm uppercase tracking-widest text-sky-600 font-semibold">FAQs</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mt-3 mb-6">
          Answers to common questions
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-10">
          Find quick answers about TripKey, provider verification, and security.
        </p>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="card-base border border-sky-100">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900">
                {faq.question}
              </summary>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
