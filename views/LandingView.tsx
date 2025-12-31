import React from "react";
import { supabase } from "../lib/supabase";

interface LandingViewProps {
  onLoginClick: (pref: "admin" | "vendor") => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onLoginClick }) => {
  const handleGoogleLogin = async (pref: "admin" | "vendor") => {
    onLoginClick(pref);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Gagal login Google:", error.message);
      alert("Terjadi kesalahan saat mencoba login.");
    }
  };

  return (
    // Mengurangi pt (padding-top) agar lebih dekat ke navbar
    <div className="max-w-4xl mx-auto px-4 pt-4 md:pt-10 pb-8 md:pb-20 text-center min-h-[80vh] flex flex-col justify-start md:justify-center">
      {/* Logo AP Box - Mengurangi mb (margin-bottom) agar teks judul lebih dekat */}
      <div className="mb-4 flex justify-center animate-bounce">
        <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl md:rounded-3xl flex items-center justify-center text-white text-2xl md:text-4xl font-extrabold shadow-xl shadow-blue-100">
          AP
        </div>
      </div>

      {/* Header Section - Menggunakan space-y-1 agar teks antar baris lebih rapat */}
      <div className="space-y-1 mb-10 animate-fade-in-up">
        <h1 className="text-2xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Sistem Pelaporan Vendor <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Pemkot Bekasi
          </span>
        </h1>
        <p className="text-sm md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed px-4 pt-2">
          Jembatan digital dokumentasi teknis antara PT. Airkon Pratama dan
          Pemerintah Kota Bekasi.
        </p>
      </div>

      {/* Login Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto px-2">
        <button
          onClick={() => handleGoogleLogin("vendor")}
          className="group relative bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 text-left overflow-hidden animate-shake"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Akses Vendor
            </span>
          </div>
          <h3 className="text-lg font-bold mb-1">Masuk Google</h3>
          <p className="text-xs text-gray-500">
            Laporkan aktivitas engineering harian.
          </p>
        </button>

        <button
          onClick={() => handleGoogleLogin("admin")}
          className="group relative bg-blue-600 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300 text-left text-white overflow-hidden"
        >
          <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center mb-3 backdrop-blur-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1 text-white">Dashboard Admin</h3>
          <p className="text-xs text-blue-100">
            Pantau & ekspor data engineering.
          </p>
        </button>
      </div>

      <p className="mt-12 text-[12px] text-red-600 font-bold italic animate-pulse">
        Pengawasan oleh Tim Engineering PT. Airkon Pratama.
      </p>
    </div>
  );
};

export default LandingView;
