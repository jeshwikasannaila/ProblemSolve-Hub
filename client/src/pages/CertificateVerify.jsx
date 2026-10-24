import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  AlertCircle, 
  ArrowLeft,
  Download,
  Loader2,
  ShieldAlert,
  LogIn
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CertificateVerify() {
  const { code: urlCode } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [inputCode, setInputCode] = useState(urlCode || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const fetchCertificate = async (codeToFetch) => {
    if (!codeToFetch) return;
    try {
      setLoading(true);
      setError('');
      setDownloadError('');
      setCertificate(null);
      const res = await api.get(`/certificates/${codeToFetch.trim()}`);
      setCertificate(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Certificate not found. Please check the verification code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlCode) {
      setInputCode(urlCode);
      fetchCertificate(urlCode);
    }
  }, [urlCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchCertificate(inputCode);
  };

  const handleDownload = async () => {
    if (!certificate) return;
    try {
      setDownloading(true);
      setDownloadError('');

      const response = await api.get(
        `/certificates/${certificate.certificate_code}/pdf`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: 'application/pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ProblemSolveHub-Certificate-${certificate.certificate_code}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download certificate error:', err);
      let errorMsg = 'Unable to download certificate. Please ensure you are logged in as the awarded developer.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.error) errorMsg = parsed.error;
        } catch (_) {}
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      setDownloadError(errorMsg);
    } finally {
      setDownloading(false);
    }
  };

  const isOwner = isAuthenticated && user && (user.id === certificate?.developer_id || user.role === 'ADMIN' || user.id === certificate?.customer_id);
  const isOtherDeveloper = isAuthenticated && user && user.role === 'DEVELOPER' && user.id !== certificate?.developer_id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Tamper-Proof Verification Engine
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Verify Solution Certificate
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Enter any ProblemSolve Hub Certificate ID to verify the authenticity of an engineering achievement directly against our database.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="gradient-card rounded-2xl p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            placeholder="Enter Certificate Code (e.g. PSH-2026-KT8891)"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Verified Certificate Display Card */}
      {certificate && (
        <div className="relative rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-8 sm:p-12 shadow-2xl shadow-emerald-950/40 overflow-hidden space-y-8 animate-in fade-in duration-300">
          
          {/* Watermark / Seal */}
          <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
            <CheckCircle2 className="w-4 h-4" />
            AUTHENTIC & VERIFIED
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b border-slate-800 pb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
              <Award className="w-9 h-9 text-slate-950" />
            </div>
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-bold">
              ProblemSolve Hub • Certificate of Achievement
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {certificate.award_title || '1st Place Winner & Best Solution'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Certificate Code: <span className="text-emerald-300 font-bold">{certificate.certificate_code}</span>
            </p>
          </div>

          {/* Certificate Body */}
          <div className="text-center space-y-4 max-w-2xl mx-auto py-2">
            <p className="text-sm text-slate-400">This official certificate is proudly awarded to</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
              {certificate.developer_name}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              for architecting and submitting the winning technical solution to the challenge:
            </p>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-bold text-lg">
              "{certificate.problem_title}"
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="block text-slate-500 uppercase font-mono mb-1">Issuing Organization</span>
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" />
                {certificate.company_name || certificate.customer_name}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="block text-slate-500 uppercase font-mono mb-1">Issue Date</span>
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-400" />
                {new Date(certificate.issue_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="block text-slate-500 uppercase font-mono mb-1">Award Bounty</span>
              <span className="font-bold text-emerald-400 text-sm font-mono flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                ${certificate.reward_amount?.toLocaleString()} (Disbursed)
              </span>
            </div>
          </div>
          {/* Download Certificate PDF Section */}
          <div className="flex flex-col items-center justify-center pt-2 space-y-3">
            {downloadError && (
              <div className="w-full max-w-md p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            {isOwner ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Official PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Certificate PDF
                    </>
                  )}
                </button>
                <span className="text-[11px] text-slate-400 font-mono">
                  ✓ High-resolution, print-ready document with cryptographic verification seal
                </span>
              </div>
            ) : isOtherDeveloper ? (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2 max-w-md">
                <span className="text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Official PDF download is reserved for the winning developer (<strong className="text-white">{certificate.developer_name}</strong>).
                </span>
              </div>
            ) : isAuthenticated ? (
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Official PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Certificate PDF
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link
                  to={`/login?redirect=/verify/${certificate.certificate_code}`}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold text-xs flex items-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Download Official PDF
                </Link>
                <span className="text-[11px] text-slate-500">
                  Winning developers must sign in to download their official certificate file.
                </span>
              </div>
            )}
          </div>

          {/* Client Testimonial if exists */}
          {certificate.customer_review && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                Client Review & Feedback
              </span>
              <p className="text-xs text-slate-300 italic">
                "{certificate.customer_review}"
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
