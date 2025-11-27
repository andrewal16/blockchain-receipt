import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Navbar from "../components/common/Navbar";
import Badge from "../components/common/Badge";

// --- CONFIGURATION ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = "gemini-2.5-flash";

const formatThousand = (num) => {
  if (!num) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseNumber = (str) => {
  if (!str) return 0;
  return Number(str.toString().replace(/\./g, ""));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

// --- MOCK ACTIVE AGREEMENTS ---
const MOCK_AGREEMENTS = [
  {
    id: "AGR-2025-001",
    vendor: "PT Supplier ABC",
    category: "Electronics",
    itemName: "Laptop Dell Latitude 5420",
    pricePerUnit: 8000000,
    totalQuantity: 10,
    usedQuantity: 4,
    remainingQty: 6,
    contractPeriod: { start: "2025-01-01", end: "2025-12-31" },
    status: "active",
  },
  {
    id: "AGR-2025-004",
    vendor: "PT Digital Services",
    category: "Services",
    itemName: "IT Support & Maintenance",
    pricePerUnit: 25000000,
    totalQuantity: 12,
    usedQuantity: 2,
    remainingQty: 10,
    contractPeriod: { start: "2025-01-10", end: "2025-12-31" },
    status: "active",
  },
  {
    id: "AGR-2025-005",
    vendor: "PT Tech Solutions",
    category: "Software Subscription",
    itemName: "Cloud Storage Enterprise",
    pricePerUnit: 5000000,
    totalQuantity: 12,
    usedQuantity: 0,
    remainingQty: 12,
    contractPeriod: { start: "2025-02-01", end: "2026-01-31" },
    status: "active",
  },
];

// Daily limits mock
const DAILY_LIMITS = {
  Electronics: 50000000,
  Services: 100000000,
  "Software Subscription": 25000000,
  "Office Supplies": 10000000,
};

const UploadReceipt = () => {
  const navigate = useNavigate();
  const containerRef = useRef();
  const warningRef = useRef();
  const [searchParams] = useSearchParams();

  // State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [scanError, setScanError] = useState(null);

  // Agreement Selection
  const [selectedAgreement, setSelectedAgreement] = useState("");
  const [agreementData, setAgreementData] = useState(null);

  // Validation
  const [aiConfidence, setAiConfidence] = useState({
    score: 1.0,
    reason: null,
  });
  const [validationResults, setValidationResults] = useState({
    priceMatch: { valid: true, message: "" },
    qtyAvailable: { valid: true, message: "" },
    contractValid: { valid: true, message: "" },
    dailyLimit: { valid: true, message: "", needsCFO: false },
  });
  const [isManuallyVerified, setIsManuallyVerified] = useState(false);

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

  // Pre-fill from URL param
  useEffect(() => {
    const agreementId = searchParams.get("agreement");
    if (agreementId) {
      const agreement = MOCK_AGREEMENTS.find((a) => a.id === agreementId);
      if (agreement) {
        setSelectedAgreement(agreementId);
        handleAgreementSelect(agreementId);
      }
    }
  }, [searchParams]);

  // GSAP Animations
  useGSAP(
    () => {
      gsap.fromTo(
        ".fade-in-entry",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      );
    },
    { scope: containerRef }
  );

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

  // Agreement Selection Handler
  const handleAgreementSelect = (agreementId) => {
    const agreement = MOCK_AGREEMENTS.find((a) => a.id === agreementId);
    if (!agreement) return;

    setAgreementData(agreement);
    setFormData((prev) => ({
      ...prev,
      vendor: agreement.vendor,
      category: agreement.category,
      items: [
        {
          id: 1,
          description: agreement.itemName,
          quantity: 1,
          unitPrice: agreement.pricePerUnit,
          total: agreement.pricePerUnit,
        },
      ],
    }));
  };

  // Smart Contract Validation
  const performValidation = () => {
    if (!agreementData) return;

    const results = {
      priceMatch: { valid: true, message: "" },
      qtyAvailable: { valid: true, message: "" },
      contractValid: { valid: true, message: "" },
      dailyLimit: { valid: true, message: "", needsCFO: false },
    };

    // Check 1: Price Match
    const submittedPrice = formData.items[0]?.unitPrice || 0;
    if (submittedPrice !== agreementData.pricePerUnit) {
      results.priceMatch = {
        valid: false,
        message: `Price mismatch! Expected ${formatCurrency(
          agreementData.pricePerUnit
        )}, got ${formatCurrency(submittedPrice)}`,
      };
    }

    // Check 2: Quantity Available
    const requestedQty = formData.items.reduce((acc, i) => acc + i.quantity, 0);
    if (requestedQty > agreementData.remainingQty) {
      results.qtyAvailable = {
        valid: false,
        message: `Insufficient quantity! Remaining: ${agreementData.remainingQty}, Requested: ${requestedQty}`,
      };
    }

    // Check 3: Contract Period
    const today = new Date();
    const startDate = new Date(agreementData.contractPeriod.start);
    const endDate = new Date(agreementData.contractPeriod.end);
    if (today < startDate || today > endDate) {
      results.contractValid = {
        valid: false,
        message: `Contract not active! Valid period: ${agreementData.contractPeriod.start} to ${agreementData.contractPeriod.end}`,
      };
    }

    // Check 4: Daily Limit (Simulate)
    const categoryLimit = DAILY_LIMITS[agreementData.category] || 0;
    const todaySpending = 30000000; // Mock
    const invoiceAmount = calculateGrandTotal();
    const totalAfter = todaySpending + invoiceAmount;

    if (totalAfter > categoryLimit) {
      results.dailyLimit = {
        valid: true, // Still valid but needs CFO
        needsCFO: true,
        message: `Exceeds daily limit! Today: ${formatCurrency(
          todaySpending
        )} + This: ${formatCurrency(invoiceAmount)} = ${formatCurrency(
          totalAfter
        )} > Limit: ${formatCurrency(categoryLimit)}`,
      };
    }

    setValidationResults(results);
  };

  useEffect(() => {
    if (agreementData) {
      performValidation();
    }
  }, [formData.items, agreementData]);

  // AI Scan
  const scanReceiptWithAI = async (imageFile) => {
    setIsScanning(true);
    setScanStatus("Securing Connection...");
    setScanError(null);
    setAiConfidence({ score: 1, reason: null });
    setIsManuallyVerified(false);

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

      const prompt = `Extract receipt data as JSON: { vendor, invoiceNumber, date (YYYY-MM-DD), items: [{description, quantity, unitPrice}], taxAmount, extractedTotal, confidenceScore (0-1), confidenceReason }`;

      const result = await model.generateContent([prompt, imagePart]);
      const data = JSON.parse(result.response.text());

      setTimeout(() => {
        const mappedItems =
          data.items?.map((item, idx) => ({
            id: Date.now() + idx,
            description: item.description || "Item",
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
          })) || [];

        setAiConfidence({
          score: data.confidenceScore ?? 1,
          reason: data.confidenceReason || null,
        });

        setFormData((prev) => ({
          ...prev,
          vendor: data.vendor || prev.vendor,
          invoiceNumber: data.invoiceNumber || "",
          date: data.date || prev.date,
          items: mappedItems.length ? mappedItems : prev.items,
          taxAmount: Number(data.taxAmount) || 0,
          extractedTotal: Number(data.extractedTotal) || 0,
          notes: `AI Extracted`,
        }));

        setIsScanning(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      setScanError(error.message || "Failed to analyze receipt.");
      setIsScanning(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      scanReceiptWithAI(selectedFile);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: agreementData?.itemName || "",
          quantity: 1,
          unitPrice: agreementData?.pricePerUnit || 0,
          total: agreementData?.pricePerUnit || 0,
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

  // 🔥 PERBAIKAN: Tambahkan fungsi handleItemChange yang hilang
  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          let cleanValue = value;
          if (field === "quantity" || field === "unitPrice") {
            cleanValue = parseNumber(value);
          }
          const updated = { ...item, [field]: cleanValue };
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

  const calculateSubtotal = () =>
    formData.items.reduce((acc, item) => acc + item.total, 0);
  const calculateGrandTotal = () =>
    calculateSubtotal() + Number(formData.taxAmount);

  // Submit Logic
  const isLowConfidence = aiConfidence.score < 0.7;
  const hasValidationErrors =
    !validationResults.priceMatch.valid ||
    !validationResults.qtyAvailable.valid ||
    !validationResults.contractValid.valid;

  const isSubmitDisabled =
    hasValidationErrors ||
    (isLowConfidence && !isManuallyVerified) ||
    !selectedAgreement;

  const handleSubmit = () => {
    if (validationResults.dailyLimit.needsCFO) {
      alert(
        `Invoice submitted! Exceeds daily limit - sent to CFO for approval.`
      );
    } else {
      alert(`Invoice auto-approved! Minted to blockchain.`);
    }
    navigate("/auditor/submissions");
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050A14] text-slate-300 p-6 md:p-12 selection:bg-cyan-500/30"
    >
      <Navbar />

      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto pt-24">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 fade-in-entry">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <span className="text-cyan-400 font-bold text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Submit Invoice
              </h1>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
                Agreement-Based Verification
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Selection */}
        <div className="fade-in-entry mb-6 bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
            Select Purchase Agreement
          </h3>
          <select
            value={selectedAgreement}
            onChange={(e) => {
              setSelectedAgreement(e.target.value);
              handleAgreementSelect(e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition-all"
          >
            <option value="">-- Select Active Agreement --</option>
            {MOCK_AGREEMENTS.map((agr) => (
              <option key={agr.id} value={agr.id}>
                {agr.id} - {agr.itemName} ({agr.vendor}) - Remaining:{" "}
                {agr.remainingQty} units
              </option>
            ))}
          </select>

          {agreementData && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-800/30 p-3 rounded-lg">
                <div className="text-slate-500 text-xs mb-1">Price/Unit</div>
                <div className="text-cyan-400 font-mono font-bold">
                  {formatCurrency(agreementData.pricePerUnit)}
                </div>
              </div>
              <div className="bg-slate-800/30 p-3 rounded-lg">
                <div className="text-slate-500 text-xs mb-1">Remaining Qty</div>
                <div className="text-white font-bold">
                  {agreementData.remainingQty} / {agreementData.totalQuantity}
                </div>
              </div>
              <div className="bg-slate-800/30 p-3 rounded-lg">
                <div className="text-slate-500 text-xs mb-1">
                  Contract Period
                </div>
                <div className="text-white text-xs">
                  Until {agreementData.contractPeriod.end}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Validation Results */}
        {agreementData && (
          <div className="fade-in-entry mb-6 space-y-3">
            {/* Price Match */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 ${
                validationResults.priceMatch.valid
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/30"
              }`}
            >
              <span className="text-2xl">
                {validationResults.priceMatch.valid ? "✓" : "✕"}
              </span>
              <div className="flex-1">
                <div
                  className={`font-bold text-sm ${
                    validationResults.priceMatch.valid
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {validationResults.priceMatch.valid
                    ? "Price Match Verified"
                    : "Price Mismatch Detected"}
                </div>
                {!validationResults.priceMatch.valid && (
                  <div className="text-xs text-red-300 mt-1">
                    {validationResults.priceMatch.message}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity Available */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 ${
                validationResults.qtyAvailable.valid
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/30"
              }`}
            >
              <span className="text-2xl">
                {validationResults.qtyAvailable.valid ? "✓" : "✕"}
              </span>
              <div className="flex-1">
                <div
                  className={`font-bold text-sm ${
                    validationResults.qtyAvailable.valid
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {validationResults.qtyAvailable.valid
                    ? "Quantity Available"
                    : "Quantity Exceeded"}
                </div>
                {!validationResults.qtyAvailable.valid && (
                  <div className="text-xs text-red-300 mt-1">
                    {validationResults.qtyAvailable.message}
                  </div>
                )}
              </div>
            </div>

            {/* Daily Limit */}
            {validationResults.dailyLimit.needsCFO && (
              <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/30 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <div className="font-bold text-sm text-amber-400">
                    Requires CFO Approval
                  </div>
                  <div className="text-xs text-amber-300 mt-1">
                    {validationResults.dailyLimit.message}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Low Confidence Warning */}
        <div ref={warningRef} className="overflow-hidden opacity-0 h-0">
          <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl relative overflow-hidden mb-6">
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
                    AI Reliability: {(aiConfidence.score * 100).toFixed(0)}%.{" "}
                    {aiConfidence.reason}
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer bg-amber-500/5 px-4 py-3 rounded-lg border border-amber-500/10">
                <input
                  type="checkbox"
                  checked={isManuallyVerified}
                  onChange={(e) => setIsManuallyVerified(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600"
                />
                <span className="text-xs font-bold uppercase text-amber-400">
                  I Confirm Data is Correct
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Upload */}
          <div className="lg:col-span-5 space-y-6 fade-in-entry">
            <div className="relative group">
              <div
                onClick={() => document.getElementById("fileInput").click()}
                className={`relative border border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-500 overflow-hidden min-h-[360px] flex flex-col justify-center items-center bg-[#0B1120] ${
                  isScanning
                    ? "border-cyan-500/50"
                    : "border-white/10 hover:border-cyan-500/30"
                }`}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent w-full h-full animate-[scan_2s_linear_infinite] z-10"></div>
                )}
                {preview ? (
                  <img
                    src={preview}
                    alt="Receipt"
                    className="absolute inset-0 w-full h-full object-contain p-4 opacity-80"
                  />
                ) : (
                  <div className="text-center space-y-3">
                    <div className="text-2xl opacity-50">📷</div>
                    <div className="text-slate-400 text-sm font-medium">
                      Drop receipt or click to upload
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-[#0B1120] border border-white/5 rounded-xl p-6 space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
                  Invoice Number
                </label>
                <input
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, invoiceNumber: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                  placeholder="#INV-000"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
                  Vendor (from Agreement)
                </label>
                <input
                  value={formData.vendor}
                  readOnly
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">
                  Category (from Agreement)
                </label>
                <input
                  value={formData.category}
                  readOnly
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Right: Items */}
          <div className="lg:col-span-7 fade-in-entry">
            <div className="bg-[#0B1120] border border-white/5 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Line Items</h3>
                <button
                  onClick={addItem}
                  className="text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-3 py-1.5 rounded-lg transition-all"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {formData.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/30 border border-white/5 rounded-lg p-4 group hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-500 font-bold">
                        Item #{idx + 1}
                      </span>
                      {formData.items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, "description", e.target.value)
                      }
                      placeholder="Item description..."
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white font-medium mb-3 outline-none focus:border-cyan-500/50 transition-all"
                    />

                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-3">
                        <label className="text-[9px] text-slate-600 uppercase mb-1 block font-bold">
                          Qty
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatThousand(item.quantity)}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-950 border border-white/10 rounded px-2 py-2 text-xs text-white text-center focus:border-cyan-500/50 outline-none"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[9px] text-slate-600 uppercase mb-1 block font-bold">
                          Unit Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formatThousand(item.unitPrice)}
                            onChange={(e) =>
                              handleItemChange(
                                item.id,
                                "unitPrice",
                                e.target.value
                              )
                            }
                            className="w-full bg-slate-950 border border-white/10 rounded pl-7 pr-2 py-2 text-xs text-white text-right focus:border-cyan-500/50 outline-none"
                            placeholder="0"
                          />
                        </div>
                        {agreementData &&
                          item.unitPrice !== agreementData.pricePerUnit && (
                            <div className="text-[9px] text-amber-400 mt-1">
                              ⚠ Differs from agreement
                            </div>
                          )}
                      </div>
                      <div className="col-span-5 text-right">
                        <label className="text-[9px] text-slate-600 uppercase mb-1 block font-bold">
                          Total
                        </label>
                        <div className="text-sm text-slate-300 font-mono font-bold bg-slate-950 border border-white/10 rounded px-2 py-2">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 pt-6 border-t border-white/10 bg-[#080d1a] -mx-6 -mb-6 px-6 py-6 rounded-b-xl space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white font-mono">
                      {formatCurrency(calculateSubtotal())}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-sm text-slate-400">Tax / VAT</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatThousand(formData.taxAmount)}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            taxAmount: parseNumber(e.target.value),
                          })
                        }
                        className="w-32 bg-slate-900 border border-white/10 rounded px-3 py-2 text-right text-white text-sm focus:border-cyan-500/50 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end bg-slate-900/50 p-4 rounded-lg border border-white/10 relative overflow-hidden">
                  <div className="z-10">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
                      Grand Total
                    </div>
                    {formData.extractedTotal > 0 && (
                      <div className="text-[10px] font-mono mt-1 text-slate-500">
                        AI Extracted: {formatCurrency(formData.extractedTotal)}
                      </div>
                    )}
                  </div>
                  <div className="z-10 text-2xl font-bold tracking-tight text-cyan-400">
                    {formatCurrency(calculateGrandTotal())}
                  </div>

                  {/* Glow effect */}
                  <div className="absolute right-0 top-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none bg-cyan-500"></div>
                </div>

                <button
                  disabled={isSubmitDisabled}
                  onClick={handleSubmit}
                  className={`w-full mt-5 py-4 font-bold rounded-lg text-sm uppercase transition-all ${
                    isSubmitDisabled
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg"
                  }`}
                >
                  {hasValidationErrors
                    ? "⚠️ Validation Failed"
                    : !selectedAgreement
                    ? "Select Agreement First"
                    : isLowConfidence && !isManuallyVerified
                    ? "🔒 Awaiting Verification"
                    : validationResults.dailyLimit.needsCFO
                    ? "📤 Submit for CFO Approval"
                    : "🚀 Auto-Approve & Mint"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReceipt;
