import Link from "next/link";

export default function Success() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-xl text-center">
        <h1 className="text-3xl font-bold text-green-400 mb-4">Payment Successful!</h1>
        <p className="text-gray-200 mb-6">
          Thank you for your payment. You can now analyze your contract instantly.
        </p>
        <Link href="/?paid=true">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-colors">
            Go to Analyze
          </button>
        </Link>
      </div>
    </main>
  );
}
