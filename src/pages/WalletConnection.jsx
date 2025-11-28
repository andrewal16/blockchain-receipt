import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import {
  Wallet,
  Link2,
  ShieldCheck,
  FileText,
  Store,
  ChevronRight,
  Loader2,
  CheckCircle2,
  LayoutDashboard,
  AlertCircle,
  Info,
} from "lucide-react";

const WalletConnection = () => {
  const {
    connectWallet,
    isConnected,
    account,
    selectRole,
    userRole,
    error: web3Error,
    hasCheckedConnection,
  } = useWeb3();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [localError, setLocalError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && account && !userRole) {
      setShowRoleSelection(true);
    }

    if (isConnected && account && userRole) {
      redirectToRole(userRole);
    }
  }, [isConnected, account, userRole]);

  if (!hasCheckedConnection) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">
            Checking wallet connection...
          </p>
        </div>
      </div>
    );
  }

  const handleConnectMetaMask = async () => {
    setIsConnecting(true);
    setLocalError(null);

    try {
      const result = await connectWallet("metamask");

      if (result.success) {
        setShowRoleSelection(true);
      } else {
        setLocalError(result.error);
      }
    } catch (err) {
      setLocalError("Unexpected error occurred. Please try again.");
      console.error("Connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRoleSelect = (role) => {
    selectRole(role);
    redirectToRole(role);
  };

  const redirectToRole = (role) => {
    switch (role) {
      case "finance":
        navigate("/finance/dashboard");
        break;
      case "cfo":
        navigate("/dashboard");
        break;
      case "vendor":
        navigate("/vendor/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  const displayError = localError || web3Error;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col font-sans text-slate-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <Card className="max-w-md w-full bg-slate-900/80 border border-slate-800/60 backdrop-blur-xl shadow-2xl shadow-black/50 rounded-2xl relative z-10">
          <div className="p-8">
            {displayError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-200 font-medium">
                    Connection Error
                  </p>
                  <p className="text-xs text-red-300/80 mt-1">{displayError}</p>
                </div>
              </div>
            )}

            {!showRoleSelection ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-inner mb-5 ring-1 ring-white/5">
                    <Wallet
                      className="w-8 h-8 text-cyan-400"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Connect Wallet
                  </h2>
                  <p className="text-slate-400 text-sm mt-2">
                    Connect your wallet to continue
                  </p>
                </div>

                {/* ✅ NEW: Info banner about connection behavior */}
                <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-200/90 leading-relaxed">
                    MetaMask will ask for your approval each time you connect.
                    This ensures your wallet security.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* MetaMask - Active */}
                  <button
                    onClick={handleConnectMetaMask}
                    disabled={isConnecting}
                    className="group w-full flex items-center gap-4 p-4 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-orange-500/50 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-orange-500/10 rounded-lg shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {isConnecting ? (
                        <Loader2 className="w-7 h-7 text-orange-500 animate-spin" />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          className="w-7 h-7 text-orange-500 fill-current"
                        >
                          <path d="M21.5 7.5l-3-1.5L16 9l-3-6-3 6-2.5-3-3 1.5 1 6h15z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white flex items-center gap-2">
                        MetaMask
                      </div>
                      <div className="text-xs text-slate-400">
                        {isConnecting ? "Connecting..." : "Popular web3 wallet"}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-orange-400 transition-colors" />
                  </button>

                  {/* WalletConnect - Disabled */}
                  <button
                    disabled
                    className="w-full flex items-center gap-4 p-4 bg-transparent border border-slate-800 rounded-xl opacity-40 cursor-not-allowed"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 rounded-lg shrink-0">
                      <Link2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-slate-300">
                        WalletConnect
                      </div>
                      <div className="text-xs text-slate-500">Coming soon</div>
                    </div>
                  </button>

                  {/* Coinbase - Disabled */}
                  <button
                    disabled
                    className="w-full flex items-center gap-4 p-4 bg-transparent border border-slate-800 rounded-xl opacity-40 cursor-not-allowed"
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-indigo-500/10 rounded-lg shrink-0">
                      <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-slate-300">
                        Coinbase Wallet
                      </div>
                      <div className="text-xs text-slate-500">Coming soon</div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800/50">
                  <p className="text-xs text-slate-500 text-center">
                    Don't have a wallet?{" "}
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                      Install MetaMask
                    </a>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4 ring-1 ring-green-500/20 animate-scale-in">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Wallet Connected
                  </h2>
                  <div className="flex justify-center mt-2">
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-slate-400 border border-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">
                    Select Your Access
                  </h3>

                  {/* Finance Team */}
                  <button
                    onClick={() => handleRoleSelect("finance")}
                    className="w-full p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-emerald-500/50 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                          Finance Team
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Manage agreements & invoices
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </button>

                  {/* CFO */}
                  <button
                    onClick={() => handleRoleSelect("cfo")}
                    className="w-full p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-violet-500/50 hover:shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-violet-500/10 rounded-xl text-violet-400 group-hover:scale-110 transition-transform duration-300">
                        <LayoutDashboard className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                          Chief Financial Officer
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Dashboard & approvals
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 transition-colors" />
                    </div>
                  </button>

                  {/* Vendor */}
                  <button
                    onClick={() => handleRoleSelect("vendor")}
                    className="w-full p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-amber-500/50 hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)] transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-amber-500/10 rounded-xl text-amber-400 group-hover:scale-110 transition-transform duration-300">
                        <Store className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                          External Vendor
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Review purchase orders
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WalletConnection;
