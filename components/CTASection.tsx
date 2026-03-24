export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-sky-500 via-sky-400 to-sky-600 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-10 w-40 h-40 bg-sky-400 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-60 h-60 bg-sky-700 rounded-full opacity-20 blur-3xl"></div>

      <div className="container-max relative z-10">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Start Your Journey with TripKey
          </h2>
          <p className="text-lg sm:text-xl text-sky-50 mb-12 leading-relaxed">
            Join thousands of travelers who have already simplified their journey.
            Create your TripKey account today and experience the future of travel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-sky-500 font-bold rounded-lg hover:bg-sky-50 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl text-lg">
              Create Account
            </button>
            <button className="px-8 py-4 bg-transparent text-white font-bold rounded-lg border-2 border-white hover:bg-white/10 transition-all duration-300 active:scale-95 text-lg">
              Login to Existing Account
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Free tier available</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L7.414 9l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Get started in 2 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
