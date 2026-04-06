import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ResumeBuilder from "./pages/ResumeBuilder.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import TemplateSelection from './pages/TemplateSelection';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/builder" element={<ResumeBuilder />} />
          <Route path="/pages/TemplateSelection" element={<TemplateSelection />} />
          <Route path="/pages/ResumeBuilder" element={<ResumeBuilder />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
