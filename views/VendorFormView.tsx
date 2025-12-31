import React, { useState, useRef } from "react";
import { User, VendorJob } from "../types";
import { JOB_TYPES, BUILDINGS, BUILDING_FLOORS } from "../constants";
import { supabase } from "../lib/supabase";
import {
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Send,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface VendorFormViewProps {
  user: User;
  onSubmit: (job: any) => void;
}

const VendorFormView: React.FC<VendorFormViewProps> = ({ user, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    picName: user.name,
    picPhone: "",
    jobType: "",
    building: "",
    floor: "",
    room: "",
    description: "",
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Refs untuk membedakan input galeri dan kamera
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "building") {
      setFormData((prev) => ({ ...prev, [name]: value, floor: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAIAssistant = async () => {
    if (!formData.description || formData.description.length < 5) return;
    setIsThinking(true);
    try {
      const genAI = new GoogleGenerativeAI(
        import.meta.env.VITE_GEMINI_KEY || ""
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Perbaiki deskripsi pekerjaan teknis berikut agar profesional untuk laporan building management Pemkot Bekasi. Padat dan jelas. Pekerjaan: ${formData.description}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) setFormData((prev) => ({ ...prev, description: text }));
    } catch (error) {
      console.error("AI Assistant Error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const uploadedPhotos = [];
      for (const file of photos) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const { data, error: uploadError } = await supabase.storage
          .from("job-photos")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        uploadedPhotos.push({ url: data.path });
      }

      const jobPayload = {
        user_id: user.id,
        vendor_name: user.name,
        company_name: formData.companyName,
        pic_name: formData.picName,
        pic_phone: formData.picPhone,
        job_type: formData.jobType,
        building: formData.building,
        floor: formData.floor,
        room: formData.room,
        description: formData.description,
        start_time: formData.startTime,
        end_time: formData.endTime,
        photos: uploadedPhotos,
      };

      await onSubmit(jobPayload);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Submit Error:", error);
      alert(
        `Gagal mengirim laporan: ${error.message || "Periksa koneksi Anda"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center animate-in fade-in zoom-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
            <CheckCircle2 size={48} />
          </div>
        </div>
        <h1 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">
          Laporan Terkirim!
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Data telah tersimpan di sistem manajemen gedung PT. Airkon Pratama.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
        >
          Buat Laporan Baru
        </button>
      </div>
    );
  }

  const availableFloors = formData.building
    ? BUILDING_FLOORS[formData.building] || []
    : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Form Laporan Pekerjaan
        </h1>
        <p className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-wider">
          Monitoring Vendor Pemkot Bekasi
        </p>

        <div className="flex items-center mt-6">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded ${
                    step > s ? "bg-blue-600" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-gray-100"
      >
        {step === 1 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Perusahaan Vendor
              </label>
              <input
                type="text"
                required
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="PT. Mekanik Jaya"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Nama PIC
              </label>
              <input
                type="text"
                required
                name="picName"
                value={formData.picName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                No. HP PIC
              </label>
              <input
                type="tel"
                required
                name="picPhone"
                value={formData.picPhone}
                onChange={handleInputChange}
                placeholder="0812xxxxxxxx"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.companyName || !formData.picPhone}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold disabled:opacity-50 shadow-lg shadow-blue-100 transition-all"
              >
                Lanjut <ChevronRight size={18} />
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Jenis Pekerjaan
                </label>
                <select
                  name="jobType"
                  required
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Kategori</option>
                  {JOB_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Gedung
                </label>
                <select
                  name="building"
                  required
                  value={formData.building}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Gedung</option>
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                  Lantai
                </label>
                <select
                  name="floor"
                  required
                  value={formData.floor}
                  onChange={handleInputChange}
                  disabled={!formData.building}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none text-sm disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih Lantai</option>
                  {availableFloors.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center justify-between text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                Deskripsi
                <button
                  type="button"
                  onClick={handleAIAssistant}
                  disabled={isThinking || !formData.description}
                  className="text-[10px] flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-all font-bold tracking-normal"
                >
                  <Sparkles
                    size={12}
                    className={isThinking ? "animate-spin" : ""}
                  />
                  {isThinking ? "Berpikir..." : "Bantu Rapikan (AI)"}
                </button>
              </label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Detail pekerjaan..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none outline-none text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-400 font-bold text-sm"
              >
                <ChevronLeft size={18} /> Kembali
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all"
              >
                Lanjut <ChevronRight size={18} />
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="space-y-4">
              <div className="flex flex-col items-center p-6 border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50/50">
                <p className="text-xs text-gray-400 mb-4 font-medium italic">
                  Pilih metode dokumentasi lapangan:
                </p>

                {/* Hidden Inputs */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                  ref={fileInputRef}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  ref={cameraInputRef}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-600 rounded-3xl border border-blue-100 hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
                  >
                    <Camera size={32} />
                    <span className="text-[10px] font-black uppercase mt-2">
                      Kamera
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-4 bg-white text-slate-500 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    <Upload size={32} />
                    <span className="text-[10px] font-black uppercase mt-2">
                      Galeri
                    </span>
                  </button>
                </div>
              </div>

              {/* Preview Grid */}
              <div className="grid grid-cols-3 gap-3">
                {previews.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm"
                  >
                    <img
                      src={src}
                      alt="Pekerjaan"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 flex justify-between items-center border-t border-gray-50">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-gray-400 font-bold text-sm"
              >
                <ChevronLeft size={18} /> Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting || previews.length === 0}
                className="flex items-center gap-3 bg-green-600 text-white px-10 py-3.5 rounded-2xl font-bold disabled:opacity-50 shadow-xl shadow-green-100 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
                {isSubmitting ? "Mengirim..." : "Submit Laporan"}
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
  );
};

export default VendorFormView;
