import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import PostProblem from './pages/PostProblem';
import CustomerDashboard from './pages/CustomerDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import Leaderboard from './pages/Leaderboard';
import CertificateVerify from './pages/CertificateVerify';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:id" element={<ProblemDetail />} />
              <Route path="/post-problem" element={<PostProblem />} />
              <Route path="/dashboard/customer" element={<CustomerDashboard />} />
              <Route path="/dashboard/developer" element={<DeveloperDashboard />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/verify" element={<CertificateVerify />} />
              <Route path="/verify/:code" element={<CertificateVerify />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
