import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fair Street-Butler High Schools
          </h1>
          <h2 className="text-2xl md:text-3xl font-light mb-8">
            Alumni Association
          </h2>
          <p className="text-xl text-red-100 max-w-3xl mx-auto mb-10">
            Preserving the heritage of Fair Street and E.E. Butler High Schools,
            which educated African Americans in Gainesville/Hall County, Georgia
            during the era of racial segregation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-white text-red-900 hover:bg-red-100 px-8 py-4 rounded-lg font-semibold text-lg transition shadow-lg"
            >
              Member Login
            </Link>
            <Link
              href="/register"
              className="bg-transparent border-2 border-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              Join Us
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Member-Only Access To Our Heritage
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Yearbooks */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Yearbooks</h3>
              <p className="text-gray-600">
                Access digitized yearbooks from 1948 to 1969. Relive your school days
                and reconnect with classmates.
              </p>
            </div>

            {/* Photos */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Photos & Memories</h3>
              <p className="text-gray-600">
                Browse reunion photos, event galleries, and shared memories from
                our vibrant alumni community.
              </p>
            </div>

            {/* History */}
            <div className="bg-gray-50 rounded-xl p-8 text-center hover:shadow-lg transition">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community History</h3>
              <p className="text-gray-600">
                Explore our rich history including Black History archives, sports
                achievements, and community stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-red-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">11</div>
              <div className="text-red-200">Yearbooks</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">198</div>
              <div className="text-red-200">Archive Posts</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">27</div>
              <div className="text-red-200">Photo Galleries</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1991</div>
              <div className="text-red-200">Established</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            The Fair Street-Butler High Schools Alumni Association is a 501(c)(3)
            non-profit organization dedicated to preserving the heritage of Fair Street
            and E.E. Butler High Schools. We provide scholarships to deserving students,
            support our Sunshine Seniors program, and maintain the historical legacy of
            our beloved institutions.
          </p>
          <div className="mt-8">
            <Link
              href="/about"
              className="text-red-900 hover:text-red-700 font-semibold"
            >
              Learn More About Us →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Connect?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our alumni community to access exclusive content, connect with
            classmates, and help preserve our legacy.
          </p>
          <Link
            href="/register"
            className="bg-red-900 hover:bg-red-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition inline-block"
          >
            Become a Member Today
          </Link>
        </div>
      </section>
    </div>
  );
}
