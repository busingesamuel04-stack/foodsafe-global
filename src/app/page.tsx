export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md w-full space-y-5 p-8 bg-white rounded-3xl border border-gray-200 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl shadow-xs">
          ✦
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Clean Slate Ready
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Hosting on Cloudflare Pages, Supabase database, and GitHub deployment pipeline are active and connected.
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Standing by for your instructions
          </span>
        </div>
      </div>
    </main>
  );
}
