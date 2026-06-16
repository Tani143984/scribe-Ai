import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900">ScribeAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 transition">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          Now with team workspaces
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
          Write better content,
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            10x faster with AI
          </span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          ScribeAI helps teams generate blog posts, emails, and social content
          in seconds — with custom brand voice, usage tracking, and seamless
          team collaboration.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/signup" className="bg-blue-600 text-white px-7 py-3.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            Start writing for free
          </Link>
          <Link href="/login" className="text-gray-700 px-7 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition border border-gray-200">
            Sign in
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          No credit card required &middot; Free plan available
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 mb-24">
        <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 text-center text-xs text-gray-400">
              scribeai.app/write
            </div>
          </div>
          <div className="bg-white p-8 grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-3">Content type</div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg mb-1">��</div>
                  <div className="text-[10px] font-medium text-blue-700">Blog</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg mb-1">📧</div>
                  <div className="text-[10px] text-gray-500">Email</div>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg mb-1">💼</div>
                  <div className="text-[10px] text-gray-500">LinkedIn</div>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-3 h-20 text-xs text-gray-400">
                Write a blog post about...
              </div>
              <div className="bg-blue-600 text-white text-xs font-medium rounded-lg py-2.5 text-center mt-4">
                ✦ Generate
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="text-[10px] font-medium text-gray-500 mb-2">Output</div>
              <div className="space-y-1.5">
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-blue-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Everything your team needs
          </h2>
          <p className="text-gray-500">
            Built for teams who write content every day
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <Feature icon="⚡" title="Real-time streaming" description="Watch your content generate word-by-word, just like chatting with an expert writer." />
          <Feature icon="👥" title="Team workspaces" description="Invite your team, manage roles, and keep everyone's content in one organized place." />
          <Feature icon="🎨" title="Custom brand voice" description="Train the AI on your tone — professional, casual, or anything in between." />
          <Feature icon="📊" title="Usage analytics" description="Track exactly how much your team is generating with clear, simple dashboards." />
          <Feature icon="🔒" title="Role-based access" description="Owners, admins, and members each get exactly the right level of control." />
          <Feature icon="💳" title="Flexible billing" description="Start free, upgrade as you grow. Simple per-workspace pricing with no surprises." />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-gray-900 rounded-3xl px-10 py-14 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>

          <h2 className="text-3xl font-bold text-white mb-3 relative">
            Start free. Upgrade anytime.
          </h2>
          <p className="text-gray-400 mb-8 relative">
            50 free AI credits every month — no card required
          </p>
          <Link href="/signup" className="inline-block bg-white text-gray-900 px-8 py-3.5 rounded-xl font-medium hover:bg-gray-100 transition relative">
            Create your free account
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <span>&copy; 2026 ScribeAI. Built with Next.js.</span>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-gray-600 transition">Sign in</Link>
            <Link href="/signup" className="hover:text-gray-600 transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="text-left">
      <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
