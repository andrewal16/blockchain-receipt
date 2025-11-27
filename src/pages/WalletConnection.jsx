import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

const WalletConnection = () => {
  const { connectWallet, isConnected, account, selectRole } = useWeb3();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && account) {
      setShowRoleSelection(true);
    }
  }, [isConnected, account]);

  const handleConnectMetaMask = async () => {
    setIsConnecting(true);
    const result = await connectWallet("metamask");
    setIsConnecting(false);

    if (result.success) {
      setShowRoleSelection(true);
    }
  };

  const handleRoleSelect = (role) => {
    selectRole(role);

    // Route based on role
    if (role === "finance") {
      navigate("/agreements");
    } else if (role === "cfo") {
      navigate("/dashboard");
    } else if (role === "vendor") {
      navigate("/vendor/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-4 py-20">
        <Card className="max-w-md w-full bg-slate-900/50 border-white/10 backdrop-blur-md">
          {!showRoleSelection ? (
            <>
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Connect Your Wallet
              </h2>

              <div className="space-y-4">
                <button
                  onClick={handleConnectMetaMask}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-4 p-4 bg-slate-800 border border-white/10 rounded-lg hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="text-4xl">🦊</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">MetaMask</div>
                    <div className="text-sm text-slate-400">
                      Connect with MetaMask wallet
                    </div>
                  </div>
                  <span className="text-slate-400">→</span>
                </button>

                <button
                  disabled
                  className="w-full flex items-center gap-4 p-4 bg-slate-800/50 border border-white/10 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <span className="text-4xl">🔗</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">
                      WalletConnect
                    </div>
                    <div className="text-sm text-slate-400">Coming soon</div>
                  </div>
                </button>

                <button
                  disabled
                  className="w-full flex items-center gap-4 p-4 bg-slate-800/50 border border-white/10 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <span className="text-4xl">🔵</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">
                      Coinbase Wallet
                    </div>
                    <div className="text-sm text-slate-400">Coming soon</div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="text-success-500 text-5xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Wallet Connected
                </h2>
                <p className="text-slate-400 text-sm">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">
                Select Your Role
              </h3>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect("finance")}
                  className="w-full p-6 bg-slate-800 border border-white/10 rounded-lg hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">📋</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors">
                        Finance Team
                      </div>
                      <div className="text-sm text-slate-400">
                        Create agreements & submit invoices
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                      →
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect("cfo")}
                  className="w-full p-6 bg-slate-800 border border-white/10 rounded-lg hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">👨‍💼</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors">
                        CFO
                      </div>
                      <div className="text-sm text-slate-400">
                        View dashboard, approve & generate reports
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                      →
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect("vendor")}
                  className="w-full p-6 bg-slate-800 border border-white/10 rounded-lg hover:border-cyan-500/50 hover:-translate-y-1 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">🏢</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors">
                        Vendor
                      </div>
                      <div className="text-sm text-slate-400">
                        Review & approve purchase agreements
                      </div>
                    </div>
                    <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                      →
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default WalletConnection;
