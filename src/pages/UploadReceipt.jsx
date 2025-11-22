import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency } from "../utils/helpers";

// --- NEW COMPONENT: CREATABLE SELECT ---
// Komponen ini menangani logika pencarian dan penambahan kategori baru
const CategorySelect = ({ value, onChange, options, onAddCategory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  // Check if the search term exactly matches an existing option
  const exactMatch = options.some(
    (opt) => opt.toLowerCase() === search.toLowerCase()
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearch(""); // Reset search on close
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

  const handleCreate = () => {
    if (search.trim()) {
      onAddCategory(search.trim()); // Callback to parent to add to list
      onChange(search.trim()); // Auto select the new one
      setIsOpen(false);
      setSearch("");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Box */}
      <div
        className={`w-full px-4 py-2.5 bg-slate-950 border rounded-lg text-white flex justify-between items-center cursor-pointer transition-all ${
          isOpen
            ? "border-cyan-500 ring-1 ring-cyan-500"
            : "border-slate-700 hover:border-slate-600"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-white" : "text-slate-500"}>
          {value || "Select or create category..."}
        </span>
        <span className="text-slate-500 text-xs">▼</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Search Input inside Dropdown */}
          <div className="p-2 border-b border-white/5">
            <input
              autoFocus
              type="text"
              placeholder="Type to search or create..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!exactMatch && search) handleCreate();
                  else if (filteredOptions.length > 0)
                    handleSelect(filteredOptions[0]);
                }
              }}
            />
          </div>

          {/* List Options */}
          <div className="max-h-48 overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                className={`px-3 py-2 rounded-lg text-sm cursor-pointer flex items-center justify-between ${
                  value === option
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                {option}
                {value === option && <span>✓</span>}
              </div>
            ))}

            {/* Create Option State */}
            {search && !exactMatch && (
              <div
                onClick={handleCreate}
                className="px-3 py-2 rounded-lg text-sm cursor-pointer text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-dashed border-cyan-500/30 mt-1 flex items-center gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold text-xs">
                  +
                </span>
                Create "{search}"
              </div>
            )}

            {filteredOptions.length === 0 && !search && (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No categories found. Type to add one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const UploadReceipt = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // 1. Category State (Default Categories)
  const [availableCategories, setAvailableCategories] = useState([
    "Equipment & Hardware",
    "Software Subscriptions",
    "Professional Services",
    "Travel & Logistics",
    "Meals & Entertainment",
    "Office Supplies",
  ]);

  // Form State
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    category: "", // This will hold the selected string
    items: [{ id: 1, description: "", quantity: 1, unitPrice: 0, total: 0 }],
    taxAmount: 0,
    notes: "",
  });

  const subtotal = formData.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const grandTotal = subtotal + Number(formData.taxAmount);

  // --- GSAP ANIMATIONS ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".page-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      )
        .fromTo(
          ".main-content",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.3"
        )
        .fromTo(
          ".sidebar-card",
          { x: 20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          "-=0.3"
        );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  // --- HANDLERS ---
  const handleFileSelect = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      simulateAIScan();
    }
  };

  const simulateAIScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        vendor: "PT. Teknologi Maju Jaya",
        invoiceNumber: "INV/2025/00123",
        date: "2025-01-22",
        category: "Equipment & Hardware", // AI Matches existing category
        items: [
          {
            id: 1,
            description: "MacBook Pro M3",
            quantity: 1,
            unitPrice: 25000000,
            total: 25000000,
          },
          {
            id: 2,
            description: "USB-C Hub Anker",
            quantity: 2,
            unitPrice: 500000,
            total: 1000000,
          },
        ],
        taxAmount: 2860000,
        notes: "Extracted by AI",
      }));
      setIsScanning(false);
      gsap.fromTo(
        ".form-flash",
        { backgroundColor: "rgba(34, 211, 238, 0.2)" },
        { backgroundColor: "transparent", duration: 1 }
      );
    }, 1500);
  };

  const handleItemChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total =
              Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
          }
          return updatedItem;
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    const newId =
      formData.items.length > 0
        ? Math.max(...formData.items.map((i) => i.id)) + 1
        : 1;
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: newId, description: "", quantity: 1, unitPrice: 0, total: 0 },
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

  // 2. Handler untuk Menambah Kategori Baru
  const handleAddCategory = (newCategory) => {
    // Add to local list (In real app, this might call an API)
    setAvailableCategories((prev) => [...prev, newCategory]);
    // Show toast or notification here if needed
    console.log("New Category Added:", newCategory);
  };

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans"
      ref={pageRef}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="page-header mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-white">Upload Receipt</h1>
            <Badge variant="default">Auditor Mode</Badge>
          </div>
          <p className="text-slate-400">
            Record detailed expenses for enterprise audit trails.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 main-content">
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-md overflow-hidden relative form-flash transition-colors">
              {isScanning && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <div className="text-cyan-400 font-bold animate-pulse">
                    AI Scanning Line Items...
                  </div>
                </div>
              )}

              <div className="mb-8 p-1">
                {!file ? (
                  <div
                    className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50 rounded-xl p-8 text-center cursor-pointer transition-all"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                    <div className="text-3xl mb-2">📄</div>
                    <div className="text-sm text-slate-300 font-medium">
                      Click to Upload Receipt
                    </div>
                    <div className="text-xs text-slate-500">
                      PDF, JPG, PNG (Max 10MB)
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <img
                      src={preview}
                      alt="Receipt"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium truncate">
                        {file.name}
                      </div>
                      <div
                        className="text-xs text-cyan-400 cursor-pointer hover:underline"
                        onClick={() => setFile(null)}
                      >
                        Remove & Re-upload
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={simulateAIScan}
                    >
                      ✨ Re-Scan
                    </Button>
                  </div>
                )}
              </div>

              {/* FORM FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 border-b border-white/5 pb-8">
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    Vendor Name
                  </label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none"
                    placeholder="e.g. Tokopedia"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    Invoice / Receipt #
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        invoiceNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none font-mono"
                    placeholder="INV/2025/..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                {/* --- UPDATED: CATEGORY SELECTOR --- */}
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    Category
                  </label>
                  <CategorySelect
                    options={availableCategories}
                    value={formData.category}
                    onChange={(val) =>
                      setFormData({ ...formData, category: val })
                    }
                    onAddCategory={handleAddCategory}
                  />
                </div>
              </div>

              {/* LINE ITEMS (Sama seperti sebelumnya) */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-white">Line Items</h3>
                  <button
                    onClick={addItem}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 text-[10px] uppercase text-slate-500 font-bold px-2">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Total</div>
                    <div className="col-span-1"></div>
                  </div>

                  {formData.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center group"
                    >
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded text-sm text-white focus:border-cyan-500 outline-none"
                          placeholder="Item name"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded text-sm text-white text-center focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 bg-slate-950/50 border border-slate-700 rounded text-sm text-white text-right focus:border-cyan-500 outline-none"
                        />
                      </div>
                      <div className="col-span-2 text-right text-sm text-slate-300 font-mono">
                        {formatCurrency(item.total)}
                      </div>
                      <div className="col-span-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-600 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINANCIAL SUMMARY (Sama seperti sebelumnya) */}
              <div className="flex flex-col items-end border-t border-white/5 pt-6 space-y-3">
                <div className="flex justify-between w-full md:w-1/2 lg:w-1/3">
                  <span className="text-sm text-slate-400">Subtotal</span>
                  <span className="text-sm text-white font-mono">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center w-full md:w-1/2 lg:w-1/3">
                  <span className="text-sm text-slate-400">
                    Tax / PPN (IDR)
                  </span>
                  <input
                    type="number"
                    value={formData.taxAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxAmount: Number(e.target.value),
                      })
                    }
                    className="w-32 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right text-white text-sm focus:border-cyan-500 outline-none"
                  />
                </div>
                <div className="flex justify-between w-full md:w-1/2 lg:w-1/3 pt-3 border-t border-white/10">
                  <span className="text-lg font-bold text-white">
                    Grand Total
                  </span>
                  <span className="text-lg font-bold text-cyan-400 font-mono">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-4">
                <Button variant="ghost">Save Draft</Button>
                <Button
                  variant="primary"
                  className="shadow-lg shadow-cyan-500/20 px-8"
                >
                  Mint Receipt
                </Button>
              </div>
            </Card>
          </div>

          {/* SIDEBAR (Sama seperti sebelumnya) */}
          <div className="lg:col-span-4 space-y-6 sidebar-card">
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10">
              <h3 className="font-bold text-white text-sm mb-3">
                Company Policy
              </h3>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>Purchases {">"} 5 Juta
                  require Tax Invoice.
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>Electronics must
                  include Serial Numbers.
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReceipt;
