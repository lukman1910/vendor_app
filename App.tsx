import React, { useState, useEffect, useCallback } from "react";
import { User, UserRole, VendorJob } from "./types";
import { ADMIN_WHITELIST } from "./constants";
import { supabase } from "./lib/supabase";
import LandingView from "./views/LandingView";
import VendorFormView from "./views/VendorFormView";
import AdminDashboardView from "./views/AdminDashboardView";
import { Layout } from "./src/components/Layout";
import { ShieldAlert, LogOut } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<VendorJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk mencatat apakah user mengklik tombol Admin atau Vendor

  const [viewPreference, setViewPreference] = useState<
    "admin" | "vendor" | null
  >(localStorage.getItem("login_pref") as any);

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setJobs(data as any);
  }, []);

  const handleMapUser = (sbUser: any) => {
    const userEmail = sbUser.email?.toLowerCase().trim() || "";
    const isAdmin = ADMIN_WHITELIST.map((e) => e.toLowerCase().trim()).includes(
      userEmail
    );

    setUser({
      id: sbUser.id,
      name:
        sbUser.user_metadata.full_name ||
        (isAdmin ? "Administrator" : "Vendor"),
      email: userEmail,
      image: sbUser.user_metadata.avatar_url || "",
      role: isAdmin ? UserRole.ADMIN : UserRole.VENDOR,
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) handleMapUser(session.user);
      setIsLoading(false);
    };
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        handleMapUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setViewPreference(null);
        localStorage.removeItem("login_pref");
      }
      setIsLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) fetchJobs();
  }, [user, fetchJobs]);

  // Fungsi untuk menangani klik tombol di LandingView
  const handleLoginClick = (pref: "admin" | "vendor") => {
    setViewPreference(pref);
    localStorage.setItem("login_pref", pref);
    // Trigger login Supabase di sini jika belum login
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center font-bold text-slate-400">
        Memverifikasi...
      </div>
    );

  // LOGIKA PROTEKSI: Jika Vendor mencoba akses jalur Admin
  const isWrongRoom =
    user?.role === UserRole.VENDOR && viewPreference === "admin";

  if (isWrongRoom) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl text-center max-w-md border border-slate-100">
          <ShieldAlert className="text-red-500 mx-auto mb-6" size={60} />
          <h1 className="text-2xl font-black text-slate-900">Akses Ditolak</h1>
          <p className="text-slate-500 text-sm mt-4">
            Maaf, akun Anda terdeteksi sebagai <strong>Vendor</strong>. Anda
            tidak diizinkan mengakses Dashboard Admin.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Keluar & Masuk Jalur Vendor
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={() => supabase.auth.signOut()}>
      <Toaster position="top-center" reverseOrder={false} />
      {!user ? (
        <LandingView onLoginClick={handleLoginClick} />
      ) : user.role === UserRole.ADMIN ? (
        <AdminDashboardView jobs={jobs} />
      ) : (
        <VendorFormView
          user={user}
          onSubmit={async (job) => {
            await supabase.from("jobs").insert([{ ...job, user_id: user.id }]);
            alert("Berhasil dikirim");
          }}
        />
      )}
    </Layout>
  );
};

export default App;
