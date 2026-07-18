// src/app/thank-you/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ThankYou() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError("No session ID found");
      return;
    }

    // Optional: Verify payment (light check)
    const verifySession = async () => {
      try {
        const res = await fetch(`/api/check-payment?session_id=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status === 'complete' ? 'success' : 'pending');
        } else {
          setStatus('success'); // Default to success since webhook already handled it
        }
      } catch (err) {
        console.error(err);
        setStatus('success'); // Still show success - webhook is the source of truth
      }
    };

    verifySession();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold">Confirming your payment...</h1>
          <p className="mt-3 text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-lg mx-auto text-center px-6">
        <div className="text-7xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Thank You!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your payment was successful. Your course is being prepared and will be available in your dashboard shortly.
        </p>

        <div className="bg-white rounded-2xl shadow p-8 mb-8">
          <p className="text-gray-700">
            You can now access your course materials from your dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard"
            className="bg-accent-600 hover:bg-accent-700 text-white px-8 py-4 rounded-xl font-semibold transition"
          >
            Go to My Dashboard
          </Link>
          <Link 
            href="/courses"
            className="border border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold transition"
          >
            Browse More Courses
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-10">
          A receipt has been sent to your email.
        </p>
      </div>
    </div>
  );
}