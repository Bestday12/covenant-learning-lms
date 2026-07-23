import { Suspense, useEffect } from "react"; 
import AppRoutes from "@/app/routes.jsx";
import { AuthProvider } from "@/features/auth/AuthProvider.jsx";
import ErrorBoundary from "@/components/ui/ErrorBoundary.jsx";
import LoadingScreen from "@/components/ui/LoadingScreen.jsx";
import ToastProvider from "@/components/ui/ToastProvider.jsx";
import { seedCoursesToSupabase } from "@/services/courseService.js";
import { captureReferral } from "@/hooks/useReferral.js";


export default function App() {
  useEffect(() => { 
    seedCoursesToSupabase();
    captureReferral(); // ← just call it here
  }, []);
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<LoadingScreen />}>
            <AppRoutes />
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}


