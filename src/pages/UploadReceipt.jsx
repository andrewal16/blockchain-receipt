import { useEffect, useRef, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// 🔑 CONFIGURATION - Make sure this is set in your .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyAeBiOdrYI4ziv5OFfmUvTqo9fRo7GACXM";
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

// --- MOCK DATA ---
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
];

const DAILY_LIMITS = {
  Electronics: 50000000,
  Services: 100000000,
};

const UploadReceipt = () => {
  const containerRef = useRef();
  const warningRef = useRef();
  const extractionRef = useRef();

  // State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [scanError, setScanError] = useState(null);

  // 🔥 NEW: Extracted data from AI
  const [extractedData, setExtractedData] = useState(null);
  const [isInvoiceUploaded, setIsInvoiceUploaded] = useState(false);

  // Agreement Selection
  const [selectedAgreement, setSelectedAgreement] = useState("");
  const [agreementData, setAgreementData] = useState(null);

  // Validation
  const [aiConfidence, setAiConfidence] = useState({
    score: 1.0,
    reason: null,
  });
  const [validationResults, setValidationResults] = useState(null);
  const [isManuallyVerified, setIsManuallyVerified] = useState(false);

  const [formData, setFormData] = useState({
    vendor: "",
    invoiceNumber: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
    items: [{ id: 1, description: "", quantity: 1, unitPrice: 0, total: 0 }],
    taxAmount: 0,
    extractedTotal: 0,
  });

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
    if (extractedData && extractionRef.current) {
      gsap.fromTo(
        extractionRef.current,
        { height: 0, opacity: 0, marginTop: 0 },
        {
          height: "auto",
          opacity: 1,
          marginTop: 16,
          duration: 0.6,
          ease: "back.out(1.4)",
        }
      );
    }
  }, [extractedData]);

  useGSAP(() => {
    if (aiConfidence.score < 0.7 && !isScanning && isInvoiceUploaded) {
      gsap.fromTo(
        warningRef.current,
        { height: 0, opacity: 0 },
        {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        }
      );
    }
  }, [aiConfidence.score, isScanning, isInvoiceUploaded]);

  // Agreement Selection Handler
  const handleAgreementSelect = (agreementId) => {
    const agreement = MOCK_AGREEMENTS.find((a) => a.id === agreementId);
    if (!agreement) return;

    setAgreementData(agreement);

    // 🔥 RESET everything when agreement changes
    setValidationResults(null);
    setExtractedData(null);
    setIsInvoiceUploaded(false);
    setPreview(null);
    setFile(null);
    setFormData({
      vendor: "",
      invoiceNumber: "",
      date: new Date().toISOString().split("T")[0],
      category: "",
      items: [{ id: 1, description: "", quantity: 1, unitPrice: 0, total: 0 }],
      taxAmount: 0,
      extractedTotal: 0,
    });
  };

  // 🔥 FIXED: Smart Contract Validation - only run when AI extraction is done
  const performValidation = () => {
    if (!agreementData || !extractedData) {
      setValidationResults(null);
      return;
    }

    const results = {
      priceMatch: { valid: true, message: "" },
      qtyAvailable: { valid: true, message: "" },
      contractValid: { valid: true, message: "" },
      dailyLimit: { valid: true, message: "", needsCFO: false },
    };

    // Check 1: Price Match - Compare extracted price with agreement
    const extractedPrice = extractedData.items[0]?.unitPrice || 0;
    const agreementPrice = agreementData.pricePerUnit;

    if (Math.abs(extractedPrice - agreementPrice) > 100) {
      // Allow small variance
      results.priceMatch = {
        valid: false,
        message: `Price mismatch! Agreement: ${formatCurrency(
          agreementPrice
        )}, Extracted: ${formatCurrency(
          extractedPrice
        )} (Difference: ${formatCurrency(
          Math.abs(extractedPrice - agreementPrice)
        )})`,
      };
    }

    // Check 2: Quantity Available
    const requestedQty = extractedData.items.reduce(
      (acc, i) => acc + i.quantity,
      0
    );
    if (requestedQty > agreementData.remainingQty) {
      results.qtyAvailable = {
        valid: false,
        message: `Insufficient quantity! Remaining: ${agreementData.remainingQty}, Requested: ${requestedQty}`,
      };
    }

    // Check 3: Contract Period
    const invoiceDate = new Date(extractedData.date);
    const startDate = new Date(agreementData.contractPeriod.start);
    const endDate = new Date(agreementData.contractPeriod.end);

    if (invoiceDate < startDate || invoiceDate > endDate) {
      results.contractValid = {
        valid: false,
        message: `Invoice date (${extractedData.date}) is outside contract period: ${agreementData.contractPeriod.start} to ${agreementData.contractPeriod.end}`,
      };
    }

    // Check 4: Daily Limit
    const categoryLimit = DAILY_LIMITS[agreementData.category] || 0;
    const todaySpending = 30000000; // Mock
    const invoiceAmount = extractedData.extractedTotal || 0;
    const totalAfter = todaySpending + invoiceAmount;

    if (totalAfter > categoryLimit) {
      results.dailyLimit = {
        valid: true,
        needsCFO: true,
        message: `Exceeds daily limit! Today's spending: ${formatCurrency(
          todaySpending
        )} + This invoice: ${formatCurrency(invoiceAmount)} = ${formatCurrency(
          totalAfter
        )} > Daily limit: ${formatCurrency(categoryLimit)}`,
      };
    }

    setValidationResults(results);
  };

  // 🔥 Trigger validation when extracted data is available
  useEffect(() => {
    if (extractedData && agreementData) {
      performValidation();
    }
  }, [extractedData, agreementData]);

  // 🔥 REAL AI Scan with Google Gemini
  const scanReceiptWithAI = async (imageFile) => {
    setIsScanning(true);
    setScanStatus("🔒 Securing Connection...");
    setScanError(null);
    setExtractedData(null);
    setValidationResults(null);
    setAiConfidence({ score: 1, reason: null });
    setIsManuallyVerified(false);

    try {
      // Validate API Key
      if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
        throw new Error(
          "⚠️ API Key is missing! Please set VITE_GEMINI_API_KEY in your .env file"
        );
      }

      setScanStatus("🤖 Initializing AI Model...");
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2, // Lower temperature for more consistent extraction
        },
      });

      setScanStatus("📸 Converting image to base64...");
      const base64Data = await fileToBase64(imageFile);
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: imageFile.type,
        },
      };

      setScanStatus("🔍 OCR & Pattern Recognition...");

      // 🔥 Enhanced prompt for better extraction
      const prompt = `You are an expert invoice data extraction AI. Analyze this invoice/receipt image and extract ALL information accurately.

IMPORTANT INSTRUCTIONS:
1. Extract ALL line items found in the invoice
2. For prices, remove currency symbols and convert to plain numbers (e.g., "Rp 8.000.000" becomes 8000000)
3. Calculate total amount if not explicitly shown
4. If date format is unclear, use YYYY-MM-DD format
5. Be precise with quantities and unit prices
6. If confidence is low due to image quality, set confidenceScore below 0.7

Return ONLY valid JSON in this EXACT format (no additional text):
{
  "vendor": "Company Name from invoice",
  "invoiceNumber": "Invoice number (e.g., INV-001)",
  "date": "YYYY-MM-DD format",
  "items": [
    {
      "description": "Item name/description",
      "quantity": 1,
      "unitPrice": 8000000
    }
  ],
  "taxAmount": 1600000,
  "extractedTotal": 17600000,
  "confidenceScore": 0.95,
  "confidenceReason": "Clear image quality" or "Low quality/blurry text"
}`;

      const result = await model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();

      setScanStatus("✨ Processing AI response...");

      // Parse AI response
      let data;
      try {
        // Remove markdown code blocks if present
        const cleanedText = responseText
          .replace(/```json\n?|\n?```/g, "")
          .trim();
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Raw Response:", responseText);
        throw new Error("AI returned invalid JSON format. Please try again.");
      }

      // Validate extracted data
      if (!data.vendor || !data.items || data.items.length === 0) {
        throw new Error(
          "AI could not extract complete invoice data. Please ensure the image is clear."
        );
      }

      setScanStatus("✅ Extraction Complete!");

      // Map items with proper IDs
      const mappedItems = data.items.map((item, idx) => ({
        id: Date.now() + idx,
        description: item.description || "Item",
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
      }));

      // Store extracted data
      const extractedInfo = {
        vendor: data.vendor,
        invoiceNumber: data.invoiceNumber || "",
        date: data.date || new Date().toISOString().split("T")[0],
        items: mappedItems,
        taxAmount: Number(data.taxAmount) || 0,
        extractedTotal:
          Number(data.extractedTotal) ||
          mappedItems.reduce((sum, item) => sum + item.total, 0),
        confidenceScore: data.confidenceScore ?? 0.9,
        confidenceReason: data.confidenceReason || null,
      };

      setExtractedData(extractedInfo);
      setAiConfidence({
        score: extractedInfo.confidenceScore,
        reason: extractedInfo.confidenceReason,
      });

      // Update form data
      setFormData({
        vendor: extractedInfo.vendor,
        invoiceNumber: extractedInfo.invoiceNumber,
        date: extractedInfo.date,
        category: agreementData?.category || "",
        items: mappedItems,
        taxAmount: extractedInfo.taxAmount,
        extractedTotal: extractedInfo.extractedTotal,
      });

      setIsInvoiceUploaded(true);
      setIsScanning(false);
    } catch (error) {
      console.error("❌ AI Extraction Error:", error);
      setScanError(
        error.message ||
          "Failed to analyze receipt. Please check your API key and try again."
      );
      setIsScanning(false);
      setExtractedData(null);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedAgreement) {
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

    // Re-trigger validation when user manually edits
    if (extractedData) {
      const updatedExtractedData = {
        ...extractedData,
        items: formData.items,
      };
      setExtractedData(updatedExtractedData);
    }
  };

  const calculateSubtotal = () =>
    formData.items.reduce((acc, item) => acc + item.total, 0);
  const calculateGrandTotal = () =>
    calculateSubtotal() + Number(formData.taxAmount);

  // Submit Logic
  const isLowConfidence = aiConfidence.score < 0.7;
  const hasValidationErrors =
    validationResults &&
    (!validationResults.priceMatch.valid ||
      !validationResults.qtyAvailable.valid ||
      !validationResults.contractValid.valid);

  const isSubmitDisabled =
    !selectedAgreement ||
    !isInvoiceUploaded ||
    hasValidationErrors ||
    (isLowConfidence && !isManuallyVerified);

  const handleSubmit = () => {
    if (validationResults?.dailyLimit.needsCFO) {
      alert(
        "✅ Invoice submitted successfully!\n\n⚠️ This invoice exceeds the daily spending limit and has been sent to CFO for approval."
      );
    } else {
      alert(
        "🚀 Invoice auto-approved!\n\n✓ All validations passed\n✓ Minted to blockchain\n✓ Transaction recorded"
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#050A14] text-slate-300 p-6 md:p-12 selection:bg-cyan-500/30"
    >
      {/* Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4 fade-in-entry">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center backdrop-blur-md">
            <span className="text-cyan-400 font-bold text-xl">⚡</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Submit Invoice
            </h1>
            <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
              AI-Powered Agreement Verification
            </p>
          </div>
        </div>

        {/* 🔥 Step Indicator */}
        <div className="fade-in-entry mb-8 flex items-center justify-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              selectedAgreement
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-slate-800/30 border-slate-700"
            }`}
          >
            <span className="text-xl">{selectedAgreement ? "✓" : "1"}</span>
            <span className="text-sm font-medium">Select Agreement</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-700"></div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              extractedData
                ? "bg-emerald-500/10 border-emerald-500/30"
                : selectedAgreement
                ? "bg-cyan-500/10 border-cyan-500/30"
                : "bg-slate-800/30 border-slate-700"
            }`}
          >
            <span className="text-xl">{extractedData ? "✓" : "2"}</span>
            <span className="text-sm font-medium">AI Extraction</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-700"></div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              validationResults
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-slate-800/30 border-slate-700"
            }`}
          >
            <span className="text-xl">{validationResults ? "✓" : "3"}</span>
            <span className="text-sm font-medium">Validation</span>
          </div>
        </div>

        {/* Step 1: Agreement Selection */}
        <div className="fade-in-entry mb-6 bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
            Step 1: Select Purchase Agreement
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

        {/* Step 2: Upload Invoice */}
        <div className="fade-in-entry mb-6 bg-slate-900/50 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-cyan-500 rounded-full"></span>
            Step 2: Upload Invoice for AI Extraction
          </h3>

          <div className="relative group">
            <div
              onClick={() =>
                selectedAgreement &&
                !isScanning &&
                document.getElementById("fileInput").click()
              }
              className={`relative border border-dashed rounded-2xl p-8 transition-all duration-500 overflow-hidden min-h-[300px] flex flex-col justify-center items-center bg-[#0B1120] ${
                !selectedAgreement
                  ? "opacity-50 cursor-not-allowed border-slate-700"
                  : isScanning
                  ? "border-cyan-500/50 cursor-wait"
                  : "border-white/10 hover:border-cyan-500/30 cursor-pointer"
              }`}
            >
              <input
                id="fileInput"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={!selectedAgreement || isScanning}
              />

              {isScanning && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent w-full h-full animate-[scan_2s_linear_infinite] z-10"></div>
                  <div className="relative z-20 text-center space-y-3">
                    <div className="text-5xl mb-4 animate-pulse">🤖</div>
                    <div className="text-cyan-400 font-bold text-lg">
                      {scanStatus}
                    </div>
                    <div className="text-xs text-slate-500 max-w-sm">
                      Google Gemini AI is analyzing your invoice...
                    </div>
                    <div className="flex gap-1 justify-center mt-4">
                      <div
                        className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </>
              )}

              {!isScanning && preview ? (
                <img
                  src={preview}
                  alt="Invoice"
                  className="absolute inset-0 w-full h-full object-contain p-4 opacity-80"
                />
              ) : (
                !isScanning && (
                  <div className="text-center space-y-3">
                    <div className="text-5xl opacity-50">📄</div>
                    <div className="text-slate-400 text-sm font-medium">
                      {!selectedAgreement
                        ? "Please select an agreement first"
                        : "Drop invoice image or click to upload"}
                    </div>
                    <div className="text-xs text-slate-600">
                      Supports: JPG, PNG, PDF
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {scanError && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <div className="text-red-400 font-bold text-sm mb-1">
                    Extraction Failed
                  </div>
                  <div className="text-red-300 text-xs">{scanError}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🔥 NEW: AI Extraction Results - Show BEFORE Validation */}
        {extractedData && (
          <div
            ref={extractionRef}
            className="mb-6 overflow-hidden opacity-0 h-0"
          >
            <div className="bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border border-emerald-500/30 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-emerald-400 font-bold flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  AI Extraction Results
                  <span className="text-xs bg-emerald-500/20 px-2 py-1 rounded-full">
                    Confidence: {(aiConfidence.score * 100).toFixed(0)}%
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">Vendor</div>
                  <div className="text-white font-medium text-sm">
                    {extractedData.vendor}
                  </div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">Invoice #</div>
                  <div className="text-cyan-400 font-mono text-sm">
                    {extractedData.invoiceNumber}
                  </div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">Date</div>
                  <div className="text-white text-sm">{extractedData.date}</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                  <div className="text-slate-500 text-xs mb-1">
                    Total Amount
                  </div>
                  <div className="text-emerald-400 font-bold text-sm">
                    {formatCurrency(extractedData.extractedTotal)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-slate-500 text-xs mb-3 font-bold uppercase">
                  Extracted Items
                </div>
                <div className="space-y-2">
                  {extractedData.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm border-b border-white/5 pb-2"
                    >
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {item.description}
                        </div>
                        <div className="text-slate-500 text-xs">
                          Qty: {item.quantity} ×{" "}
                          {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <div className="text-emerald-400 font-mono font-bold">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                  {extractedData.taxAmount > 0 && (
                    <div className="flex justify-between text-sm pt-2">
                      <div className="text-slate-500">Tax/VAT</div>
                      <div className="text-white font-mono">
                        {formatCurrency(extractedData.taxAmount)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <div className="text-xs text-cyan-300 flex items-start gap-2">
                  <span>💡</span>
                  <span>
                    AI has extracted invoice data. Now comparing with selected
                    agreement...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔥 Step 3: Validation Results - Only show AFTER extraction */}
        {extractedData && validationResults && (
          <div className="fade-in-entry mb-6 space-y-3">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
              Step 3: Smart Contract Validation
            </h3>

            {/* Price Match */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                validationResults.priceMatch.valid
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/30"
              }`}
            >
              <span className="text-3xl">
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
                    ? "✅ Price Match Verified"
                    : "❌ Price Mismatch Detected"}
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
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                validationResults.qtyAvailable.valid
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/30"
              }`}
            >
              <span className="text-3xl">
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
                    ? "✅ Quantity Available"
                    : "❌ Quantity Exceeded"}
                </div>
                {!validationResults.qtyAvailable.valid && (
                  <div className="text-xs text-red-300 mt-1">
                    {validationResults.qtyAvailable.message}
                  </div>
                )}
              </div>
            </div>

            {/* Contract Validity */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                validationResults.contractValid.valid
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-red-500/5 border-red-500/30"
              }`}
            >
              <span className="text-3xl">
                {validationResults.contractValid.valid ? "✓" : "✕"}
              </span>
              <div className="flex-1">
                <div
                  className={`font-bold text-sm ${
                    validationResults.contractValid.valid
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {validationResults.contractValid.valid
                    ? "✅ Contract Period Valid"
                    : "❌ Contract Period Invalid"}
                </div>
                {!validationResults.contractValid.valid && (
                  <div className="text-xs text-red-300 mt-1">
                    {validationResults.contractValid.message}
                  </div>
                )}
              </div>
            </div>

            {/* Daily Limit */}
            {validationResults.dailyLimit.needsCFO && (
              <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/30 flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div className="flex-1">
                  <div className="font-bold text-sm text-amber-400">
                    ⚠️ Requires CFO Approval
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
        {isInvoiceUploaded && isLowConfidence && (
          <div ref={warningRef} className="overflow-hidden opacity-0 h-0 mb-6">
            <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-amber-500"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 text-2xl">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">
                      Low AI Confidence Detected
                    </h4>
                    <p className="text-sm text-slate-400 mt-1">
                      AI Reliability: {(aiConfidence.score * 100).toFixed(0)}%.{" "}
                      {aiConfidence.reason}
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer bg-amber-500/5 px-4 py-3 rounded-lg border border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={isManuallyVerified}
                    onChange={(e) => setIsManuallyVerified(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-600"
                  />
                  <span className="text-xs font-bold uppercase text-amber-400">
                    I Verify Data is Correct
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Details & Submit */}
        {isInvoiceUploaded && extractedData && (
          <div className="fade-in-entry bg-[#0B1120] border border-white/5 rounded-xl p-6">
            <h3 className="text-white font-bold mb-4">
              Editable Invoice Details
            </h3>

            <div className="space-y-3 mb-6">
              {formData.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-900/30 border border-white/5 rounded-lg p-4 hover:border-cyan-500/30 transition-all"
                >
                  <div className="text-xs text-slate-500 font-bold mb-2">
                    Item #{idx + 1}
                  </div>

                  <input
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(item.id, "description", e.target.value)
                    }
                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-white font-medium mb-3 outline-none focus:border-cyan-500/50"
                  />

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 text-xs mb-1">
                        Quantity
                      </div>
                      <input
                        type="text"
                        value={formatThousand(item.quantity)}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", e.target.value)
                        }
                        className="w-full bg-slate-950 border border-white/10 rounded px-3 py-2 text-white text-center focus:border-cyan-500/50 outline-none"
                      />
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">
                        Unit Price
                      </div>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          Rp
                        </span>
                        <input
                          type="text"
                          value={formatThousand(item.unitPrice)}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          className="w-full bg-slate-950 border border-white/10 rounded pl-7 pr-2 py-2 text-white text-right focus:border-cyan-500/50 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs mb-1">Total</div>
                      <div className="text-white font-mono font-bold bg-slate-950 border border-white/10 rounded px-2 py-2 text-center">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
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
                    value={formatThousand(formData.taxAmount)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxAmount: parseNumber(e.target.value),
                      })
                    }
                    className="w-32 bg-slate-900 border border-white/10 rounded px-3 py-2 text-right text-white text-sm focus:border-cyan-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center bg-gradient-to-r from-slate-900/50 to-cyan-900/20 p-4 rounded-lg border border-cyan-500/20">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">
                    Grand Total
                  </div>
                  <div className="text-[10px] text-slate-600 mt-1">
                    AI Extracted: {formatCurrency(extractedData.extractedTotal)}
                  </div>
                </div>
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {formatCurrency(calculateGrandTotal())}
                </div>
              </div>

              <button
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
                className={`w-full mt-5 py-4 font-bold rounded-lg text-sm uppercase transition-all ${
                  isSubmitDisabled
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02]"
                }`}
              >
                {!selectedAgreement
                  ? "⚠️ Select Agreement First"
                  : !isInvoiceUploaded
                  ? "⚠️ Upload Invoice First"
                  : hasValidationErrors
                  ? "❌ Validation Failed - Cannot Submit"
                  : isLowConfidence && !isManuallyVerified
                  ? "🔒 Please Verify Data First"
                  : validationResults?.dailyLimit.needsCFO
                  ? "📤 Submit for CFO Approval"
                  : "🚀 Auto-Approve & Mint to Blockchain"}
              </button>
            </div>
          </div>
        )}

        {/* Info Box */}
        {!isInvoiceUploaded && selectedAgreement && !isScanning && (
          <div className="fade-in-entry mt-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">💡</div>
              <div>
                <h4 className="text-blue-400 font-bold mb-2">Next Step</h4>
                <p className="text-slate-300 text-sm">
                  Upload your invoice image. Google Gemini AI will automatically
                  extract all data (vendor, items, prices) and validate it
                  against your selected agreement.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadReceipt;
