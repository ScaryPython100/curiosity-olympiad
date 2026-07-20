import Link from "next/link";

export default function MockSuccessPage() {
  return (
    <div className="bg-[#f7f9fb] dark:bg-gray-900 text-[#191c1e] dark:text-gray-100 min-h-screen flex flex-col font-['Montserrat'] items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="bg-[#ffe16d]/20 text-[#221b00] dark:text-[#ffe16d] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_25px_rgba(255,215,0,0.3)]">
          <span className="material-symbols-outlined text-4xl">verified</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-[#143867] dark:text-blue-400 tracking-tight mb-2">
          Test Completed!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Your curiosity levels have been assessed. Your score has been securely saved and will be revealed on the official results release date.
        </p>
        
        <Link 
          href="/tournaments"
          className="bg-[#143867] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#143867]/30 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 inline-block w-full"
        >
          Return to Tournaments
        </Link>
      </div>
    </div>
  );
}
