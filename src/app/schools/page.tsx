import Link from "next/link";

/**
 * Temporary page while the real teacher portal is finished.
 * It reads no student data at all.
 */
export default function SchoolsComingSoonPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-6 font-['Montserrat']">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny static image */}
        <img src="/kuppu/face-128.webp" width={80} height={80} alt="" className="mx-auto rounded-full ring-2 ring-[#ea580c]" />
        <h1 className="text-2xl font-black text-[#143867]">Teacher portal coming soon</h1>
        <p className="text-sm text-gray-600">
          Teachers will soon be able to see their class here. For now, please contact the Agastya team.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-2xl bg-[#143867] text-white font-black"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
