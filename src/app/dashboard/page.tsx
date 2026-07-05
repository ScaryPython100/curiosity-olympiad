export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f2f4f6] flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-200">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#143867] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Login Successful! 🎉
        </h1>
        <p className="text-[#43474f] text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Welcome to the Curiosity Olympiad Dashboard.
        </p>
        <p className="text-sm text-gray-500 mt-6">
          Your secure session cookie has been successfully set.
        </p>
      </div>
    </div>
  );
}