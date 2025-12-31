import { createClient } from "@supabase/supabase-js";

// Mengambil data dari variabel environment (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validasi sederhana agar kamu tahu jika .env belum terbaca
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "PERINGATAN: Supabase URL/Key belum dikonfigurasi di file .env.local. Aplikasi mungkin tidak berjalan semestinya."
  );
}

// INI BAGIAN YANG PENTING: Membuat koneksi dan mengekspornya
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
