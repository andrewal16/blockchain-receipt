import { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// --- CONFIGURATION ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash"; // Updated to correct model name
const formatThousand = (num) => {
  if (!num) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseNumber = (str) => {
  if (!str) return 0;
  // Hapus semua karakter yang BUKAN angka
  return Number(str.toString().replace(/\./g, ""));
};
// --- HELPERS ---
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// --- COMPONENT: CATEGORY SELECT (Styled) ---
const CategorySelect = ({ value, onChange, options, onAddCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative font-sans" ref={containerRef}>
      <div
        className={`w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border rounded-lg text-sm flex justify-between items-center cursor-pointer transition-all duration-300 ${
          isOpen
            ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            : "border-white/10 hover:border-white/20"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-slate-200" : "text-slate-500"}>
          {value || "Select category..."}
        </span>
        <span
          className="text-slate-500 text-[10px] transform transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <input
              autoFocus
              type="text"
              placeholder="Filter..."
              className="w-full bg-slate-900/50 border border-transparent rounded px-3 py-2 text-xs text-white focus:border-cyan-500/50 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                className="px-3 py-2 rounded text-xs cursor-pointer text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
              >
                {option}
              </div>
            ))}
            {search && (
              <div
                onClick={() => {
                  onAddCategory(search);
                  handleSelect(search);
                }}
                className="px-3 py-2 text-cyan-400 cursor-pointer hover:bg-cyan-500/10 rounded text-xs border border-dashed border-cyan-500/30 mt-1"
              >
                + Add "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
const UploadReceipt = () => {
  const containerRef = useRef();
  const warningRef = useRef();

  // State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [scanError, setScanError] = useState(null);

  // Validation
  const [aiConfidence, setAiConfidence] = useState({
    score: 1.0,
    reason: null,
  });
  const [mathValidation, setMathValidation] = useState({
    isValid: true,
    diff: 0,
  });
  const [isManuallyVerified, setIsManuallyVerified] = useState(false);

  const [availableCategories, setAvailableCategories] = useState([
    "Meals & Entertainment",
    "Transport & Travel",
    "Office Supplies",
    "Software Subscription",
    "Hardware Equipment",
    "Utilities",
    "Professional Services",
  ]);

  const [formData, setFormData] = useState({
    vendor: "",
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    items: [{ id: 1, description: "", quantity: 1, unitPrice: 0, total: 0 }],
    taxAmount: 0,
    extractedTotal: 0,
    notes: "",
  });

  // --- GSAP ANIMATIONS ---
  useGSAP(
    () => {
      // Initial Fade In
      gsap.fromTo(
        ".fade-in-entry",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    },
    { scope: containerRef }
  );

  // Animate Warning Box when it appears
  useGSAP(() => {
    if (aiConfidence.score < 0.7 && !isScanning) {
      gsap.fromTo(
        warningRef.current,
        { height: 0, opacity: 0, marginTop: 0 },
        {
          height: "auto",
          opacity: 1,
          marginTop: 16,
          duration: 0.4,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [aiConfidence.score, isScanning]);

  // --- CALCULATIONS ---
  const calculateSubtotal = () =>
    formData.items.reduce((acc, item) => acc + item.total, 0);
  const calculateGrandTotal = () =>
    calculateSubtotal() + Number(formData.taxAmount);

  useEffect(() => {
    const calculated = calculateGrandTotal();
    const extracted = formData.extractedTotal;

    if (extracted > 0) {
      const diff = Math.abs(calculated - extracted);
      const isValid = diff <= 100;
      setMathValidation({ isValid, diff });
    } else {
      setMathValidation({ isValid: true, diff: 0 }); // Default valid if no comparison data
    }
  }, [formData.items, formData.taxAmount, formData.extractedTotal]);

  // --- AI ENGINE ---
  const scanReceiptWithAI = async (imageFile) => {
    setIsScanning(true);
    setScanStatus("Securing Connection...");
    setScanError(null);
    setAiConfidence({ score: 1, reason: null });
    setIsManuallyVerified(false);
    setFormData((prev) => ({ ...prev, extractedTotal: 0 }));

    try {
      if (!API_KEY) throw new Error("API Key Missing");

      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: { responseMimeType: "application/json" },
      });

      setScanStatus("OCR & Pattern Recognition...");
      const base64Data = await fileToBase64(imageFile);
      const imagePart = {
        inlineData: { data: base64Data, mimeType: imageFile.type },
      };

      // --- PERBAIKAN 1: Definisikan categoryListString ---
      const categoryListString = availableCategories.join(", "); 

      // --- PERBAIKAN 2: Tambahkan Backticks (`) di awal dan akhir prompt ---
      const prompt = `
      Anda adalah AI akuntan spesialis ekstraksi data struk / invoice ke dalam JSON terstruktur.
      
      🎯 TUJUAN
      Tugas Anda adalah:
      1. Membaca isi struk/invoice (teks hasil OCR atau gambar yang sudah di-convert ke teks).
      2. Mengekstrak informasi penting ke dalam format JSON sesuai skema.
      3. Memberi penilaian confidence (0.0–1.0) beserta alasannya.
      
      ⚙️ ATURAN OUTPUT (SANGAT PENTING)
      - Output HANYA berupa JSON valid.
      - JANGAN berikan teks penjelasan di luar JSON.
      - Gunakan double quotes (") untuk semua key dan string.
      - Semua field pada schema WAJIB ada. Jika tidak diketahui, isi dengan null (bukan string "null").
      
      📂 KATEGORI
      Pilih SATU kategori yang PALING COCOK dari daftar berikut:
      [${categoryListString}]
      
      Aturan kategori:
      - Field "category" HARUS persis sama (case-sensitive) dengan salah satu string di daftar di atas.
      - Jangan menciptakan kategori baru di luar daftar.
      - Jika beberapa kategori mungkin cocok, pilih yang paling spesifik dan logis berdasarkan jenis transaksi.
      
      📑 SCHEMA OUTPUT
      Kembalikan JSON dengan struktur persis seperti ini (isi nilainya sesuai hasil ekstraksi):
      
      {
        "confidenceScore": 0.95,
        "confidenceReason": "Alasan singkat penilaian confidence.",
        "vendor": "Nama toko/vendor utama di struk",
        "invoiceNumber": "Nomor invoice / nota jika ada, jika tidak ada: null",
        "date": "YYYY-MM-DD",
        "category": "Salah satu dari list kategori di atas",
        "items": [
          {
            "description": "Nama atau deskripsi item",
            "quantity": 1,
            "unitPrice": 0
          }
        ],
        "taxAmount": 0,
        "extractedTotal": 0
      }
      
      🧮 ATURAN ANGKA (IDR)
      - Semua nilai uang dalam IDR.
      - Tipe data angka (number), BUKAN string.
      - Hapus simbol seperti "Rp", ".", "," atau format lokal lainnya.
        - Contoh:
          - "Rp 12.500" -> 12500
          - "12,500" -> 12500
      - "unitPrice", "taxAmount", dan "extractedTotal" harus berupa number (bukan string).
      
      📆 ATURAN TANGGAL
      - Format Wajib: "YYYY-MM-DD".
      - Jika ada beberapa tanggal:
        - Prioritas 1: tanggal pembayaran / transaksi.
        - Prioritas 2: tanggal invoice.
      - Jika tanggal tidak dapat dipastikan, isi "date" dengan null dan turunkan "confidenceScore".
      
      🧾 ATURAN TOTAL & ITEM
      1. Cari frasa seperti:
         - "Total Bayar", "Total Pembayaran", "Total", "Jumlah Dibayar", atau padanan yang sangat mirip.
      2. Field "extractedTotal":
         - ISI dengan angka IDR dari total akhir yang dibayar.
         - Jika tidak ditemukan dengan yakin, isi null dan turunkan "confidenceScore".
      3. Field "items":
         - Isi minimal 1 item jika memungkinkan.
         - Jika tidak ada rincian item yang jelas, buat satu item generic:
           - description: "Total pembelian"
           - quantity: 1
           - unitPrice: sama dengan "extractedTotal".
         - Jika ada beberapa baris item:
           - "description": teks nama barang/jasa di baris tersebut.
           - "quantity": gunakan angka yang tertulis (default 1 jika tidak terlihat jelas).
           - "unitPrice": harga per unit dalam IDR (tanpa Rp, tanpa pemisah ribuan).
      
      🏪 ATURAN VENDOR
      - "vendor": nama toko/perusahaan yang tercetak paling menonjol di bagian atas struk atau yang menyatakan identitas usaha.
      - Jangan gunakan nama bank, metode pembayaran (misal: BCA, Mandiri, Visa) sebagai vendor kecuali memang itu nama merchant utamanya.
      
      📉 ATURAN CONFIDENCE
      - "confidenceScore" nilai float antara 0.0 dan 1.0.
      - Beri nilai RENDAH (< 0.7) jika:
        - Gambar buram,
        - Struk terpotong,
        - Banyak teks tidak terbaca,
        - Tanggal/total/vendor tidak jelas,
        - Mengandung tulisan tangan yang susah dibaca.
      - "confidenceReason" jelaskan secara singkat dan spesifik:
        - Contoh: 
          - "Struk jelas dan lengkap, semua field utama terbaca."
          - "Total bayar tidak terlihat, hanya ada subtotal."
          - "Tanggal buram dan tidak terbaca."
      
      🧠 PERILAKU SAAT DATA TIDAK LENGKAP
      - Jangan mengarang nilai.
      - Jika suatu field benar-benar tidak bisa diidentifikasi:
        - Isi dengan null.
        - Jelaskan di "confidenceReason" field apa saja yang tidak pasti.
        - Sesuaikan "confidenceScore" lebih rendah.
      
      🔚 RINGKASAN RULE PENTING
      - Output: HANYA JSON valid.
      - "category" HARUS salah satu dari [${categoryListString}].
      - "extractedTotal": angka total bayar akhir (IDR) tanpa simbol.
      - Angka uang: number, bukan string, tanpa "Rp" dan pemisah ribuan.
      - Field tidak diketahui -> null, bukan tebak-tebakan.
      
      Sekarang, baca struk/invoice yang diberikan dan kembalikan SATU objek JSON yang mengikuti semua aturan di atas.
      `;

      const result = await model.generateContent([prompt, imagePart]);
      const data = JSON.parse(result.response.text());

      // Simulate a slight delay for better UX (feels like "processing")
      setTimeout(() => {
        // --- DATA MAPPING ---
        const mappedItems =
          data.items?.map((item, idx) => ({
            id: Date.now() + idx,
            description: item.description || "Item",
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
          })) || [];

        let finalCategory =
          availableCategories.find(
            (c) => c.toLowerCase() === (data.category || "").toLowerCase()
          ) || "";

        setAiConfidence({
          score: data.confidenceScore ?? 1,
          reason: data.confidenceReason || "Low visibility or ambiguous text.",
        });

        setFormData({
          vendor: data.vendor || "",
          invoiceNumber: data.invoiceNumber || "",
          date: data.date || new Date().toISOString().split("T")[0],
          category: finalCategory,
          items: mappedItems.length
            ? mappedItems
            : [{ id: 1, description: "", quantity: 1, unitPrice: 0, total: 0 }],
          taxAmount: Number(data.taxAmount) || 0,
          extractedTotal: Number(data.extractedTotal) || 0,
          notes: `Verified by Gemini`,
        });

        setIsScanning(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setScanError(error.message || "Failed to analyze receipt.");
      setIsScanning(false);
    }
  };

  // --- HANDLERS ---
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      scanReceiptWithAI(selectedFile);
    }
  };

  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          let cleanValue = value;

          // Jika field adalah harga atau qty, kita bersihkan titiknya dulu sebelum disimpan
          if (field === "quantity" || field === "unitPrice") {
            cleanValue = parseNumber(value);
          }

          const updated = { ...item, [field]: cleanValue };

          // Kalkulasi ulang total per baris
          if (field === "quantity" || field === "unitPrice") {
            updated.total =
              Number(updated.quantity) * Number(updated.unitPrice);
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    }));
  };

  const removeItem = (id) => {
    if (formData.items.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // --- LOGIC: IS SUBMIT DISABLED? ---
  const isLowConfidence = aiConfidence.score < 0.7;
  // Disable logic:
  // 1. Math is Wrong OR
  // 2. (Low Confidence AND Not Checked Manually) OR
  // 3. No Vendor Name (Basic required field)
  const isSubmitDisabled =
    !mathValidation.isValid ||
    (isLowConfidence && !isManuallyVerified) ||
    !formData.vendor;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050A14] text-slate-300 font-sans p-6 md:p-12 selection:bg-cyan-500/30"
    >
      {/* BACKGROUND ACCENTS */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 fade-in-entry">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <span className="text-cyan-400 font-bold text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Receipt Verification
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
                  System Operational
                </p>
              </div>
            </div>
          </div>

          {/* BADGE: Hanya muncul jika ada data comparison */}
          {formData.extractedTotal > 0 && (
            <div
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all duration-500 ${
                mathValidation.isValid
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                  : "border-orange-500/30 bg-orange-500/10 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
              }`}
            >
              <span className="text-lg">
                {mathValidation.isValid ? "🛡️" : "⚠️"}
              </span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Audit Check
                </span>
                <span className="text-xs font-bold">
                  {mathValidation.isValid
                    ? "Math Verified"
                    : "Discrepancy Found"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* --- NOTIFICATION AREA --- */}
        <div className="space-y-4 mb-8">
          {scanError && (
            <div className="fade-in-entry p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <span className="text-red-400">🚫</span>
              <div className="text-red-400 text-sm">{scanError}</div>
            </div>
          )}

          {/* LOW CONFIDENCE WARNING (Hidden by GSAP initially) */}
          <div ref={warningRef} className="overflow-hidden opacity-0 h-0">
            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-amber-500"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">
                      Low Confidence Detected
                    </h4>
                    <p className="text-sm text-slate-400 mt-1 max-w-xl">
                      AI Reliability Score:{" "}
                      <span className="text-amber-400 font-mono">
                        {(aiConfidence.score * 100).toFixed(0)}%
                      </span>
                      .{aiConfidence.reason}. System requires manual review
                      before submission.
                    </p>
                  </div>
                </div>

                {/* Explicit Consent Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer group bg-amber-500/5 px-4 py-3 rounded-lg border border-amber-500/10 hover:border-amber-500/30 transition-all">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                      isManuallyVerified
                        ? "bg-amber-500 border-amber-500 text-black"
                        : "border-slate-600 group-hover:border-amber-500"
                    }`}
                  >
                    {isManuallyVerified && "✓"}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isManuallyVerified}
                    onChange={(e) => setIsManuallyVerified(e.target.checked)}
                  />
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${
                      isManuallyVerified
                        ? "text-amber-400"
                        : "text-slate-500 group-hover:text-amber-500"
                    }`}
                  >
                    I Confirm Data is Correct
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* LEFT: UPLOAD & METADATA */}
          <div className="lg:col-span-5 space-y-6 fade-in-entry">
            <div className="relative group perspective-1000">
              <div
                onClick={() => document.getElementById("fileInput").click()}
                className={`
                  relative border border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-500 overflow-hidden min-h-[360px] flex flex-col justify-center items-center bg-[#0B1120]
                  ${
                    isScanning
                      ? "border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                      : "border-white/10 hover:border-cyan-500/30 hover:bg-[#0F1629]"
                  }
                `}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />

                {isScanning && (
                  <>
                    {/* Scanning Beam Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent w-full h-full animate-[scan_2s_linear_infinite] z-10 border-b border-cyan-500/50"></div>
                    <div className="z-20 flex flex-col items-center gap-3">
                      <div className="text-cyan-400 font-mono text-xs tracking-widest uppercase animate-pulse">
                        {scanStatus}
                      </div>
                    </div>
                  </>
                )}

                {preview ? (
                  <img
                    src={preview}
                    alt="Receipt"
                    className="absolute inset-0 w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                      <span className="text-2xl opacity-50">📷</span>
                    </div>
                    <div className="text-slate-400 text-sm font-medium">
                      Drop receipt or click to upload
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FORM CARD */}
            <div className="bg-[#0B1120] border border-white/5 rounded-xl p-6 space-y-5 shadow-xl">
              <div className="pb-4 border-b border-white/5 mb-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                  Receipt Details
                </h3>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-500 transition-colors">
                  Vendor Name
                </label>
                <input
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder-slate-700"
                  placeholder="e.g. Starbucks, AWS, Google..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-500 transition-colors">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-cyan-500/50 outline-none transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-500 transition-colors">
                    Invoice Ref
                  </label>
                  <input
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceNumber: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-3 text-sm text-white focus:border-cyan-500/50 outline-none font-mono transition-all placeholder-slate-700"
                    placeholder="#INV-000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Expense Category
                </label>
                <CategorySelect
                  options={availableCategories}
                  value={formData.category}
                  onChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                  onAddCategory={(newCat) =>
                    setAvailableCategories((prev) => [...prev, newCat])
                  }
                />
              </div>
            </div>
          </div>

          {/* RIGHT: ITEMS & TOTALS */}
          <div
            className="lg:col-span-7 fade-in-entry"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="bg-[#0B1120] border border-white/5 rounded-xl p-6 h-full flex flex-col shadow-xl">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                  Line Items breakdown
                </h3>
                <button
                  onClick={addItem}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors"
                >
                  + Add Line
                </button>
              </div>

              {/* LIST ITEMS */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 min-h-[300px]">
                {formData.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/30 border border-white/5 rounded-lg p-3 hover:border-white/10 transition-all group"
                  >
                    <div className="flex gap-3 mb-3">
                      <input
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Item description..."
                        className="flex-1 bg-transparent text-sm text-white font-medium placeholder-slate-600 outline-none border-b border-transparent focus:border-cyan-500/30 pb-1 transition-colors"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-600 hover:text-red-400 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
                      >
                        ×
                      </button>
                    </div>
                    {/* --- BAGIAN ITEM LIST --- */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      {/* KOLOM QUANTITY */}
                      <div className="col-span-3">
                        <label className="text-[9px] text-slate-600 uppercase block mb-1">
                          Qty
                        </label>
                        <input
                          type="text" // Ubah ke text agar bisa render titik
                          inputMode="numeric" // Memunculkan keyboard angka di HP
                          value={formatThousand(item.quantity)} // Tampilkan user: 1.000
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-950 border border-white/5 rounded px-2 py-1.5 text-xs text-white text-center focus:border-cyan-500/50 outline-none transition-colors"
                          placeholder="0"
                        />
                      </div>

                      {/* KOLOM UNIT PRICE */}
                      <div className="col-span-4">
                        <label className="text-[9px] text-slate-600 uppercase block mb-1">
                          Unit Price
                        </label>
                        <div className="relative">
                          {/* Prefix Rp kecil (Opsional, untuk estetika) */}
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatThousand(item.unitPrice)} // Tampilkan user: 100.000
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "unitPrice",
                                e.target.value
                              )
                            }
                            className="w-full bg-slate-950 border border-white/5 rounded pl-7 pr-2 py-1.5 text-xs text-white text-right focus:border-cyan-500/50 outline-none transition-colors"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      {/* KOLOM TOTAL */}
                      <div className="col-span-5 text-right">
                        <label className="text-[9px] text-slate-600 uppercase block mb-1">
                          Total
                        </label>
                        <div className="text-sm font-mono text-slate-300">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER TOTALS */}
              <div className="mt-6 pt-6 border-t border-white/10 bg-[#080d1a] -mx-6 -mb-6 px-6 py-6 rounded-b-xl">
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-400">
                      {formatCurrency(calculateSubtotal())}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 items-center">
                    <span>Tax / VAT</span>
                    <input
                      type="text" // Ganti number ke text
                      inputMode="numeric"
                      value={formatThousand(formData.taxAmount)} // Format tampilan
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          taxAmount: parseNumber(e.target.value), // Bersihkan saat simpan
                        })
                      }
                      className="w-28 bg-slate-900 border border-white/10 rounded px-2 py-1 text-right text-white text-xs focus:border-cyan-500/50 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end bg-slate-900 p-4 rounded-lg border border-white/5 relative overflow-hidden">
                  <div className="z-10">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                      Grand Total
                    </div>
                    {formData.extractedTotal > 0 && (
                      <div
                        className={`text-[10px] font-mono mt-1 ${
                          mathValidation.isValid
                            ? "text-slate-500"
                            : "text-orange-400"
                        }`}
                      >
                        Ref (OCR): {formatCurrency(formData.extractedTotal)}
                      </div>
                    )}
                  </div>
                  <div
                    className={`z-10 text-2xl font-bold tracking-tight ${
                      mathValidation.isValid
                        ? "text-cyan-400"
                        : "text-orange-400"
                    }`}
                  >
                    {formatCurrency(calculateGrandTotal())}
                  </div>

                  {/* Subtle Glow based on status */}
                  <div
                    className={`absolute right-0 top-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none ${
                      mathValidation.isValid ? "bg-cyan-500" : "bg-orange-500"
                    }`}
                  ></div>
                </div>

                {/* SUBMIT BUTTON WITH STRICT LOGIC */}
                <button
                  disabled={isSubmitDisabled}
                  onClick={() => alert("Submitted to Blockchain Node!")}
                  className={`
                    w-full mt-5 py-4 font-bold rounded-lg text-sm tracking-wide uppercase transition-all duration-300 flex justify-center items-center gap-2
                    ${
                      isSubmitDisabled
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                        : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40 hover:shadow-cyan-500/20 hover:scale-[1.01]"
                    }
                  `}
                >
                  {isLowConfidence && !isManuallyVerified ? (
                    <>
                      <span>🔒</span> Awaiting Manual Verification
                    </>
                  ) : !mathValidation.isValid ? (
                    <>
                      <span>⚠</span> Resolve Math Discrepancy
                    </>
                  ) : !formData.vendor ? (
                    <>
                      <span>✏️</span> Enter Vendor Name
                    </>
                  ) : (
                    <>
                      <span>🚀</span> Mint Receipt to Chain
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Animation */}
      <style>{`
        @keyframes scan {
          0% { top: -100%; }
          100% { top: 200%; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};

export default UploadReceipt;
