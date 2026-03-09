import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Signup/Register";

/* Chinese Pages */
import Translators from "./pages/chinese/Translators/Translators";
import TranslatorProfile from "./pages/chinese/TranslatorProfile/TranslatorProfile";
import BookTranslator from "./pages/chinese/BookTranslator/BookTranslator";
import MyRequests from "./pages/chinese/MyRequests/MyRequests";
import Review from "./pages/chinese/Review/Review";
import Dashboard from "./pages/chinese/Dashboard/Dashboard";

/* Translator Pages */
import TranslatorDashboard from "./pages/translator/Dashboard/TranslatorDashboard";
import MyJobs from "./pages/translator/MyJobs/MyJobs";
import Messages from "./pages/translator/Messages/Messages";
import Profile from "./pages/translator/Profile/Profile";

/* Layouts */
import MainLayout from "./components/layout/MainLayout";
import TranslatorLayout from "./components/layout/TranslatorLayout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />

        {/* Chinese Layout */}
        <Route element={<MainLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/translators" element={<Translators />} />

          <Route path="/translator/:id" element={<TranslatorProfile />} />

          <Route path="/book/:id" element={<BookTranslator />} />

          <Route path="/my-requests" element={<MyRequests />} />

          <Route path="/review/:id" element={<Review />} />

        </Route>

        {/* Translator Layout */}
        <Route element={<TranslatorLayout />}>

          <Route path="/translator/dashboard" element={<TranslatorDashboard />} />

          <Route path="/translator/jobs" element={<MyJobs />} />

          <Route path="/translator/messages" element={<Messages />} />

          <Route path="/translator/profile" element={<Profile />} />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;