import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, generateMockHash } from "../utils/helpers";

const ZKGenerator = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] = useState(null);

  // Form state
  const [proofConfig, setProofConfig] = useState({
    dateRange: { start: "2024-10-01", end: "2024-12-31" },
    categories: [],
    rangeProof: {
      type: "between",
      min: 50000000,
      max: 100000000,
    },
    includeCategories: false,
    purpose: "",
    recipientEmail: "",
  });

  // Data Definitions
  const proofTypes = [
    {
      id: "between",
      title: "Range (Between)",
      desc: "Value is within min & max",
      icon: "↔️",
    },
    {
      id: "less-than",
      title: "Ceiling ( < )",
      desc: "Value is below threshold",
      icon: "⬇️",
    },
    {
      id: "greater-than",
      title: "Floor ( > )",
      desc: "Value exceeds threshold",
      icon: "⬆️",
    },
    {
      id: "equals",
      title: "Exact Match ( = )",
      desc: "Value equals target",
      icon: "🎯",
    },
  ];

  const categories = [
    "Travel",
    "Meals",
    "Office Supplies",
    "Software",
    "Marketing",
    "Equipment",
  ];

  // --- GSAP ANIMATION HANDLER ---
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Animate Content Entry whenever STEP changes
      gsap.fromTo(
        ".zk-anim-entry",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
          clearProps: "all", // Penting agar tidak mengganggu interaksi form
        }
      );

      // 2. Header & Stepper (Run once on mount)
      if (step === 1) {
        gsap.fromTo(
          ".page-header",
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [step]);

  // Handlers
  const handleGenerateProof = async () => {
    setGenerating(true);
    // Simulate complex computation
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const proof = {
      id: `ZKP-${Date.now().toString().slice(-6)}`,
      proofHash: generateMockHash(),
      verificationLink: `https://blockreceipt.app/zk/verify/ZKP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      config: proofConfig,
      status: "valid",
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    setGeneratedProof(proof);
    setGenerating(false);
    setStep(3);
  };

  // Helper Components
  const StepIndicator = ({ num, label }) => {
    const isActive = step >= num;
    const isCurrent = step === num;

    return (
      <div className="flex flex-col items-center relative z-10">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
            isActive
              ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110"
              : "bg-slate-800 text-slate-500 border border-slate-700"
          }`}
        >
          {isActive ? "✓" : num}
        </div>
        <span
          className={`mt-2 text-xs font-medium tracking-wide uppercase transition-colors duration-300 ${
            isCurrent
              ? "text-cyan-400"
              : isActive
              ? "text-slate-300"
              : "text-slate-600"
          }`}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={containerRef}
    >
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* --- HEADER & STEPPER --- */}
        <div className="page-header mb-12">
          <div className="text-center mb-10">
            <Badge variant="premium" className="mb-4">
              PRO FEATURE
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-3">
              Generate ZK-Proof
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Create a privacy-preserving cryptographic proof for auditors or
              investors.
            </p>
          </div>

          {/* Stepper Visual */}
          <div className="relative flex justify-between items-center max-w-2xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-800 -z-0"></div>
            <div
              className="absolute top-5 left-0 h-0.5 bg-cyan-500 transition-all duration-700 ease-in-out"
              style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
            ></div>

            <StepIndicator num={1} label="Configure" />
            <StepIndicator num={2} label="Review" />
            <StepIndicator num={3} label="Result" />
          </div>
        </div>

        {/* --- STEP 1: CONFIGURATION --- */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Info Box */}
            <div className="zk-anim-entry bg-blue-900/20 border border-blue-500/20 p-5 rounded-2xl flex gap-4 backdrop-blur-sm">
              <div className="text-2xl">💡</div>
              <div className="text-sm text-blue-100/80 leading-relaxed">
                <strong>Zero-Knowledge Range Proofs</strong> allow you to prove
                your spending falls within a specific limit
                <span className="text-blue-400 font-semibold">
                  {" "}
                  without revealing the exact amount
                </span>{" "}
                or individual transaction details.
              </div>
            </div>

            {/* 1. Date Selection */}
            <Card className="zk-anim-entry bg-slate-900/50 border-white/5 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-cyan-500 rounded-full"></span> Time
                Period
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={proofConfig.dateRange.start}
                    onChange={(e) =>
                      setProofConfig({
                        ...proofConfig,
                        dateRange: {
                          ...proofConfig.dateRange,
                          start: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all group-hover:border-slate-600"
                  />
                </div>
                <div className="group">
                  <label className="block text-xs text-slate-400 uppercase font-bold mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={proofConfig.dateRange.end}
                    onChange={(e) =>
                      setProofConfig({
                        ...proofConfig,
                        dateRange: {
                          ...proofConfig.dateRange,
                          end: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all group-hover:border-slate-600"
                  />
                </div>
              </div>
            </Card>

            {/* 2. Proof Type & Range */}
            <div className="zk-anim-entry grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Type Selector */}
              <div className="lg:col-span-1 space-y-3">
                <label className="block text-xs text-slate-400 uppercase font-bold pl-1">
                  Logic Type
                </label>
                {proofTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      setProofConfig({
                        ...proofConfig,
                        rangeProof: {
                          ...proofConfig.rangeProof,
                          type: type.id,
                        },
                      })
                    }
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                      proofConfig.rangeProof.type === type.id
                        ? "bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10"
                    }`}
                  >
                    <span className="text-xl">{type.icon}</span>
                    <div>
                      <div className="font-semibold text-sm">{type.title}</div>
                      <div className="text-[10px] opacity-70">{type.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Value Inputs */}
              <div className="lg:col-span-2">
                <Card className="h-full bg-slate-900/50 border-white/5 backdrop-blur-md">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <span className="w-1 h-5 bg-purple-500 rounded-full"></span>{" "}
                    Value Configuration (IDR)
                  </h3>

                  <div className="space-y-6">
                    {proofConfig.rangeProof.type === "between" && (
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 mb-1 block">
                            Min Value
                          </label>
                          <input
                            type="number"
                            value={proofConfig.rangeProof.min}
                            onChange={(e) =>
                              setProofConfig({
                                ...proofConfig,
                                rangeProof: {
                                  ...proofConfig.rangeProof,
                                  min: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none font-mono"
                          />
                        </div>
                        <div className="pb-4 text-slate-500 font-bold">TO</div>
                        <div className="flex-1">
                          <label className="text-xs text-slate-400 mb-1 block">
                            Max Value
                          </label>
                          <input
                            type="number"
                            value={proofConfig.rangeProof.max}
                            onChange={(e) =>
                              setProofConfig({
                                ...proofConfig,
                                rangeProof: {
                                  ...proofConfig.rangeProof,
                                  max: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none font-mono"
                          />
                        </div>
                      </div>
                    )}
                    {(proofConfig.rangeProof.type === "greater-than" ||
                      proofConfig.rangeProof.type === "less-than") && (
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          Threshold Amount
                        </label>
                        <input
                          type="number"
                          value={
                            proofConfig.rangeProof.type === "greater-than"
                              ? proofConfig.rangeProof.min
                              : proofConfig.rangeProof.max
                          }
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const isGt =
                              proofConfig.rangeProof.type === "greater-than";
                            setProofConfig({
                              ...proofConfig,
                              rangeProof: {
                                ...proofConfig.rangeProof,
                                min: isGt ? val : 0,
                                max: isGt ? 0 : val,
                              },
                            });
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none font-mono text-lg"
                        />
                      </div>
                    )}

                    <div className="p-4 bg-slate-800/50 rounded-lg border border-dashed border-slate-600 text-sm text-slate-300">
                      <span className="text-slate-500 uppercase text-xs font-bold block mb-1">
                        Preview Statement
                      </span>
                      "I verify that total spending is{" "}
                      <span className="text-cyan-400 font-bold">
                        {proofConfig.rangeProof.type === "between"
                          ? `between ${formatCurrency(
                              proofConfig.rangeProof.min
                            )} and ${formatCurrency(
                              proofConfig.rangeProof.max
                            )}`
                          : proofConfig.rangeProof.type === "less-than"
                          ? `below ${formatCurrency(
                              proofConfig.rangeProof.max
                            )}`
                          : `above ${formatCurrency(
                              proofConfig.rangeProof.min
                            )}`}
                      </span>
                      ."
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* 3. Metadata */}
            <Card className="zk-anim-entry bg-slate-900/50 border-white/5">
              <h3 className="text-lg font-semibold text-white mb-4">
                Metadata
              </h3>
              <input
                type="text"
                placeholder="Purpose (e.g. Q4 Investor Report)"
                value={proofConfig.purpose}
                onChange={(e) =>
                  setProofConfig({ ...proofConfig, purpose: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none mb-4"
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={proofConfig.includeCategories}
                  onChange={(e) =>
                    setProofConfig({
                      ...proofConfig,
                      includeCategories: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-0"
                />
                <span className="text-slate-300 text-sm">
                  Restrict proof to specific categories only
                </span>
              </div>

              {proofConfig.includeCategories && (
                <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        const active = proofConfig.categories.includes(cat);
                        setProofConfig({
                          ...proofConfig,
                          categories: active
                            ? proofConfig.categories.filter((c) => c !== cat)
                            : [...proofConfig.categories, cat],
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        proofConfig.categories.includes(cat)
                          ? "bg-cyan-500 border-cyan-500 text-black"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            <div className="zk-anim-entry flex gap-4 pt-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 border-0"
                onClick={() => setStep(2)}
              >
                Review Configuration →
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 2: REVIEW --- */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="zk-anim-entry bg-slate-900/80 border-white/10 backdrop-blur-xl shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                Review Statement
              </h3>

              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Period</span>
                  <span className="text-white">
                    {proofConfig.dateRange.start} — {proofConfig.dateRange.end}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Logic</span>
                  <span className="text-cyan-400 font-bold uppercase">
                    {proofConfig.rangeProof.type}
                  </span>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-white/5 text-center">
                  <div className="text-xs text-slate-500 mb-1">
                    PROVING AMOUNT
                  </div>
                  <div className="text-xl text-white font-bold">
                    {proofConfig.rangeProof.type === "between"
                      ? `${formatCurrency(
                          proofConfig.rangeProof.min
                        )} < X < ${formatCurrency(proofConfig.rangeProof.max)}`
                      : "..."}
                  </div>
                </div>
                {proofConfig.purpose && (
                  <div className="pt-2 text-center text-slate-400 italic">
                    "{proofConfig.purpose}"
                  </div>
                )}
              </div>
            </Card>

            <div className="zk-anim-entry bg-amber-900/10 border border-amber-500/20 p-4 rounded-xl flex gap-3 items-start">
              <span className="text-xl mt-0.5">⚠️</span>
              <p className="text-sm text-amber-200/80">
                This action will generate a cryptographic hash on the Lisk
                blockchain. Once minted, the proof parameters{" "}
                <strong>cannot be edited</strong>. Gas fees may apply.
              </p>
            </div>

            <div className="zk-anim-entry flex gap-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                ← Back
              </Button>
              <Button
                variant="primary"
                className="flex-[2] relative overflow-hidden"
                onClick={handleGenerateProof}
                disabled={generating}
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Calculating ZK-SNARK...
                  </span>
                ) : (
                  "Mint Proof On-Chain"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* --- STEP 3: SUCCESS --- */}
        {step === 3 && generatedProof && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="zk-anim-entry">
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(16,185,129,0.4)] mb-6 animate-bounce-subtle">
                ✓
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Proof Generated!
              </h2>
              <p className="text-slate-400">
                Your privacy-preserving proof is live.
              </p>
            </div>

            <Card className="zk-anim-entry bg-slate-900/50 border-white/10 text-left">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase font-bold">
                    Verification Link
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      readOnly
                      value={generatedProof.verificationLink}
                      className="flex-1 bg-black/30 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          generatedProof.verificationLink
                        )
                      }
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">
                      Expires
                    </label>
                    <div className="text-white text-sm">
                      {new Date(generatedProof.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">
                      Hash
                    </label>
                    <div className="text-cyan-500 text-sm font-mono truncate">
                      {generatedProof.proofHash.slice(0, 12)}...
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="zk-anim-entry flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/zk/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/zk/verify/${generatedProof.id}`)}
              >
                Preview Verification Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZKGenerator;
