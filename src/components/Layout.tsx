import React from "react";
import { User, UserRole } from "../../types";
import { LogOut } from "lucide-react";
import { Toaster } from "react-hot-toast"; // Import Toaster untuk notifikasi
// path import: biasanya ../assets/ jika di dalam folder components
import LogoAirkon from "../src/assets/AP2.png";

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col relative bg-slate-50/30">
      {/* Wadah Notifikasi Global */}
      <Toaster position="top-center" reverseOrder={false} />

      <header className="glass-nav sticky top-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* SISI KIRI: Logo & Identitas */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 transform hover:rotate-2 transition-transform cursor-pointer">
              <img
                src={LogoAirkon}
                alt="Logo Airkon Pratama"
                className="h-10 sm:h-12 w-auto object-contain" // Ukuran logo lebih tegas
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            <div className="flex flex-col justify-center">
              {/* Nama Perusahaan: Responsif agar tidak menabrak profil di HP */}
              <h1 className="text-sm sm:text-lg font-black text-gray-900 leading-none tracking-tight uppercase">
                AIRKON PRATAMA
              </h1>
              {/* Sub-judul: Sedikit diperbesar agar terbaca di mobile */}
              <p className="text-[9px] sm:text-[10px] text-blue-600 uppercase tracking-[0.15em] font-black mt-1">
                Vendor Portal
              </p>
            </div>
          </div>

          {/* SISI KANAN: Profil & Logout */}
          {user && (
            <div className="flex items-center gap-3 ml-2">
              {/* Nama & Role: Disembunyikan di HP (hidden) agar Navbar tidak penuh */}
              <div className="hidden md:flex flex-col items-end text-right">
                <p className="text-xs font-black text-gray-900">{user.name}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                  {user.role === UserRole.ADMIN ? "Administrator" : "Vendor"}
                </p>
              </div>

              <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
                <div className="relative">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border-2 border-white shadow-sm object-cover"
                  />
                  {/* Indikator Online Sederhana */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow relative">{children}</main>

      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} PT. AIRKON PRATAMA - Building
            Management Pemkot Bekasi.
          </p>
          <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">
            Developed by <span className="text-blue-600">Lukman Hakim</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
