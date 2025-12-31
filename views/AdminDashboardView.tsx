import React, { useState, useMemo, useEffect } from "react";
import { VendorJob, FilterParams } from "../types";
import { JOB_TYPES } from "../constants";
import { supabase } from "../lib/supabase";
import {
  Search,
  X,
  FileSpreadsheet,
  Lock,
  Eye,
  Building2,
  Trash2,
  Edit,
  Calendar,
  Save,
  Phone,
  User,
  MapPin,
  RefreshCw,
  LayoutDashboard,
  FileWarning,
} from "lucide-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal"; // file ini harus ada di folder views

interface AdminDashboardViewProps {
  jobs: VendorJob[];
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  jobs: initialJobs,
}) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [localJobs, setLocalJobs] = useState<any[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  // State untuk Notifikasi & Modal Kustom
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobIdToDelete, setJobIdToDelete] = useState<string | null>(null);

  const ADMIN_EMAILS = [
    "sulthanlukman@gmail.com",
    "wahyudin.airkon@gmail.com",
    "bayf52@gmail.com",
  ];

  // --- FUNGSI AMBIL URL FOTO ---
  const getPublicUrl = (photoPath: any) => {
    if (!photoPath) return "";
    let path =
      typeof photoPath === "string"
        ? photoPath
        : photoPath.url || photoPath.path || photoPath.uri;
    if (!path || path.includes("blob:")) return "";
    if (path.startsWith("http")) return path;
    const cleanedPath = path.replace("job-photos/", "");
    const { data } = supabase.storage
      .from("job-photos")
      .getPublicUrl(cleanedPath);
    return data.publicUrl;
  };

  useEffect(() => {
    setLocalJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.email) {
        const isMatch = ADMIN_EMAILS.some(
          (e) => e.toLowerCase() === user.email?.toLowerCase()
        );
        setIsAdmin(isMatch);
      } else {
        setIsAdmin(false);
      }
    };
    checkAuth();
  }, []);

  // --- AKSI: (GANTI ALERT KE TOAST & MODAL) ---
  const triggerDelete = (id: string) => {
    setJobIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobIdToDelete) return;
    const loadingToast = toast.loading("Menghapus laporan...");

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobIdToDelete);

    if (error) {
      toast.error("Gagal: " + error.message, { id: loadingToast });
    } else {
      setLocalJobs((prev) => prev.filter((j) => j.id !== jobIdToDelete));
      toast.success("Laporan berhasil dihapus", { id: loadingToast });
    }
    setIsDeleteModalOpen(false);
    setJobIdToDelete(null);
  };

  // --- UPDATE (GANTI ALERT KE TOAST) ---
  const handleUpdate = async () => {
    const loadingToast = toast.loading("Memperbarui data...");
    const payload = {
      vendor_name: editForm.vendor_name || editForm.vendorName,
      description: editForm.description,
      job_type: editForm.job_type || editForm.jobType,
      pic_name: editForm.pic_name || editForm.picName,
      pic_phone: editForm.pic_phone || editForm.picPhone,
      building: editForm.building,
      floor: editForm.floor,
      room: editForm.room,
    };

    const { error } = await supabase
      .from("jobs")
      .update(payload)
      .eq("id", editForm.id);

    if (error) {
      toast.error("Gagal update: " + error.message, { id: loadingToast });
    } else {
      setLocalJobs((prev) =>
        prev.map((j) => (j.id === editForm.id ? { ...j, ...payload } : j))
      );
      setIsEditMode(false);
      setSelectedJob(null);
      toast.success("Data berhasil diperbarui", { id: loadingToast });
    }
  };

  // --- AKSI: EXPORT EXCEL ---
  const exportToExcel = () => {
    try {
      const dataToExport = filteredJobs.map((job: any) => ({
        Tanggal: new Date(job.created_at || job.createdAt).toLocaleDateString(
          "id-ID"
        ),
        Vendor: job.vendor_name || job.vendorName,
        Perusahaan: job.company_name || job.companyName,
        Pekerjaan: job.job_type || job.jobType,
        Gedung: job.building,
        Lantai: job.floor,
        Deskripsi: job.description,
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan");
      XLSX.writeFile(wb, `REKAP_AIRKON_${Date.now()}.xlsx`);
      toast.success("Laporan berhasil diekspor");
    } catch (e) {
      toast.error("Gagal mengekspor data");
    }
  };

  const [filters, setFilters] = useState<FilterParams>({
    search: "",
    companyName: "",
    jobType: "",
    startDate: "",
    endDate: "",
  });

  const filteredJobs = useMemo(() => {
    return localJobs.filter((job: any) => {
      const searchStr = (filters.search || "").toLowerCase();
      const vName = (job.vendor_name || job.vendorName || "").toLowerCase();
      const desc = (job.description || "").toLowerCase();
      const matchSearch =
        !searchStr || vName.includes(searchStr) || desc.includes(searchStr);
      const matchType =
        !filters.jobType || (job.job_type || job.jobType) === filters.jobType;
      return matchSearch && matchType;
    });
  }, [localJobs, filters]);

  if (isAdmin === null)
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 font-bold text-slate-400 uppercase tracking-widest text-xs">
        <RefreshCw className="animate-spin mb-4 text-indigo-600" size={32} />
        Menghubungkan Sesi Admin...
      </div>
    );

  if (isAdmin === false)
    return (
      <div className="flex flex-col h-screen items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 text-center animate-in zoom-in duration-300">
          <Lock size={60} className="text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Akses Dibatasi
          </h1>
          <p className="text-slate-500 mt-2 max-w-xs font-medium">
            Gunakan email administrator resmi Pemkot Bekasi.
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-full mx-auto px-4 md:px-10 py-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600 w-6 h-6 md:w-8 md:h-8" />{" "}
            Console Engineering
          </h1>
          <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-wider mt-2">
            Monitoring Vendor Pemkot Bekasi
          </p>
        </div>
        <button
          onClick={exportToExcel}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
        >
          <FileSpreadsheet size={20} /> Export Excel
        </button>
      </div>

      {/* Filter & Table - Identik dengan layout sebelumnya dengan animasi tambahan */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500"
            size={20}
          />
          <input
            placeholder="Cari vendor, deskripsi..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-sm border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-2 border-transparent focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-600 cursor-pointer"
          onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
        >
          <option value="">Semua Kategori Pekerjaan</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="hidden lg:flex items-center justify-end px-4 text-indigo-600 font-black text-xs uppercase">
          Total: {filteredJobs.length} Laporan
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Vendor & Perusahaan</th>
                <th className="px-8 py-6">PIC Lapangan</th>
                <th className="px-8 py-6">Pekerjaan</th>
                <th className="px-8 py-6">Lokasi</th>
                <th className="px-8 py-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredJobs.map((job: any) => (
                <tr
                  key={job.id}
                  className="hover:bg-indigo-50/30 transition-all group"
                >
                  <td className="px-8 py-6 font-black text-slate-900">
                    {job.vendor_name || job.vendorName}
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-700">
                      {job.pic_name || job.picName}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {job.pic_phone || job.picPhone}
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs italic text-sm text-slate-600 line-clamp-1">
                    "{job.description}"
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                      <Building2 size={15} className="text-indigo-500" /> Gedung{" "}
                      {job.building}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-2xl shadow-sm transition-all"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setEditForm(job);
                          setIsEditMode(true);
                        }}
                        className="p-3 text-slate-400 hover:text-amber-500 hover:bg-white rounded-2xl shadow-sm transition-all"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => triggerDelete(job.id)}
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-white rounded-2xl shadow-sm transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail & Edit (Layout Modern) */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-6xl h-full md:h-auto md:max-h-[90vh] md:rounded-[48px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-xl md:text-2xl font-black text-slate-900">
                {isEditMode ? "Edit Laporan" : "Detail Dokumentasi"}
              </h2>
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setIsEditMode(false);
                }}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={26} />
              </button>
            </div>
            {/* ... Modal Body  ... */}
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI KUSTOM (MENGGANTIKAN WINDOW.CONFIRM) */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Hapus Laporan Permanen?"
        message="Data dokumentasi ini akan dihapus selamanya dari sistem PT. Airkon Pratama dan tidak dapat dipulihkan."
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboardView;
