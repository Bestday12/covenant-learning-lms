import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/features/auth/ProtectedRoute.jsx";
import MainLayout from "@/components/ui/MainLayout.jsx";
import MarketingLayout from "@/components/ui/MarketingLayout.jsx";
import { AdminGuard, AdminShellRoute, adminChildren } from "@/features/admin/routes/AdminRoutes.jsx";

const Login = lazy(() => import("@/pages/Login.jsx"));
const Signup = lazy(() => import("@/pages/Signup.jsx"));
const Course = lazy(() => import("@/pages/Course.jsx"));
const Module = lazy(() => import("@/pages/Module.jsx"));
const Dashboard = lazy(() => import("@/pages/Dashboard.jsx"));
const Certificate = lazy(() => import("@/pages/Certificate.jsx"));
const NotFound = lazy(() => import("@/pages/NotFound.jsx"));
const JoinPartner = lazy(() => import("@/pages/JoinPartner.jsx"));
const Settings = lazy(() => import("@/pages/Settings.jsx"));

const MarketingHome = lazy(() => import("@/pages/marketing/MarketingHome.jsx"));
const MarketingCatalog = lazy(() => import("@/pages/marketing/MarketingCatalog.jsx"));
const CourseCatalog = lazy(() => import("@/pages/CourseCatalog.jsx"));
const CourseSalesPage = lazy(() => import("@/pages/marketing/CourseSalesPage.jsx"));
const Checkout = lazy(() => import("@/pages/marketing/Checkout.jsx"));
const ThankYou = lazy(() => import("@/pages/marketing/ThankYou.jsx"));
const About = lazy(() => import("@/pages/marketing/About.jsx"));
const Testimonials = lazy(() => import("@/pages/marketing/Testimonials.jsx"));
const FAQ = lazy(() => import("@/pages/marketing/FAQ.jsx"));
const Contact = lazy(() => import("@/pages/marketing/Contact.jsx"));
const Blog = lazy(() => import("@/pages/marketing/Blog.jsx"));
const UpdatePassword = lazy(() => import("@/pages/UpdatePassword.jsx"));
const CertificateVerify = lazy(() => import("@/pages/CertificateVerify.jsx"));
const Privacy = lazy(() =>
  import("@/pages/marketing/Legal.jsx").then((m) => ({ default: m.Privacy }))
);
const Terms = lazy(() =>
  import("@/pages/marketing/Legal.jsx").then((m) => ({ default: m.Terms }))
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<MarketingHome />} />
        <Route path="/courses-catalog" element={<CourseCatalog />} />
        <Route path="/courses/:courseId" element={<CourseSalesPage />} />
        <Route path="/checkout/:courseId" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/about" element={<About />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
		<Route path="/update-password" element={<UpdatePassword />} />
		<Route path="/verify/:certificateNumber" element={<CertificateVerify />} />
		<Route path="/verify" element={<Navigate to="/" replace />} />

      </Route>

      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn/:courseId" element={<Course />} />
          <Route path="/learn/:courseId/modules/:moduleId" element={<Module />} />
          <Route path="/learn/:courseId/certificate" element={<Certificate />} />
          <Route path="/join-partner" element={<JoinPartner />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route element={<AdminGuard />}>
          <Route path="/admin/*" element={<AdminShellRoute />}>
            {adminChildren.map((route) => (
              <Route
                key={route.path || "admin-index"}
                index={route.index}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}