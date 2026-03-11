import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { ChineseRoute, TranslatorRoute, PublicRoute } from "./components/ProtectedRoute";

// Loading component
const PageLoader = () => (
  <div className="page-loader">
    <div className="spinner"></div>
  </div>
);

// Lazy load pages
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Signup/Register"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));

/* Chinese Pages */
const Translators = lazy(() => import("./pages/chinese/Translators/Translators"));
const TranslatorProfile = lazy(() => import("./pages/chinese/TranslatorProfile/TranslatorProfile"));
const BookTranslator = lazy(() => import("./pages/chinese/BookTranslator/BookTranslator"));
const MyRequests = lazy(() => import("./pages/chinese/MyRequests/MyRequests"));
const Review = lazy(() => import("./pages/chinese/Review/Review"));
const Dashboard = lazy(() => import("./pages/chinese/Dashboard/Dashboard"));

/* Translator Pages */
const TranslatorDashboard = lazy(() => import("./pages/translator/Dashboard/TranslatorDashboard"));
const MyJobs = lazy(() => import("./pages/translator/MyJobs/MyJobs"));
const Messages = lazy(() => import("./pages/translator/Messages/Messages"));
const Profile = lazy(() => import("./pages/translator/Profile/Profile"));

/* Layouts */
import MainLayout from "./components/layout/MainLayout";
import TranslatorLayout from "./components/layout/TranslatorLayout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>

            {/* Auth - Public Routes */}
            <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Chinese Layout - Protected for Chinese users only */}
            <Route element={<ChineseRoute><MainLayout /></ChineseRoute>}>

              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/translators" element={<Translators />} />

              <Route path="/translator/:id" element={<TranslatorProfile />} />

              <Route path="/book/:id" element={<BookTranslator />} />

              <Route path="/my-requests" element={<MyRequests />} />

              <Route path="/review/:id" element={<Review />} />

            </Route>

            {/* Translator Layout - Protected for Translators only */}
            <Route element={<TranslatorRoute><TranslatorLayout /></TranslatorRoute>}>

              <Route path="/translator/dashboard" element={<TranslatorDashboard />} />

              <Route path="/translator/jobs" element={<MyJobs />} />

              <Route path="/translator/messages" element={<Messages />} />

              <Route path="/translator/profile" element={<Profile />} />

            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </Suspense>
      </LanguageProvider>
    </AuthProvider>
  </BrowserRouter>
  );
}

export default App;