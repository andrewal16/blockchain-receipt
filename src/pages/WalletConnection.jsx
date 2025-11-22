import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import Navbar from '../components/common/Navbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

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
    const result = await connectWallet('metamask');
    setIsConnecting(false);
    
    if (result.success) {
      setShowRoleSelection(true);
    }
  };

  const handleRoleSelect = (role) => {
    selectRole(role);
    if (role === 'auditor') {
      navigate('/upload');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-primary-900">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-4 py-20">
        <Card className="max-w-md w-full">
          {!showRoleSelection ? (
            <>
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Connect Your Wallet
              </h2>

              <div className="space-y-4">
                <button
                  onClick={handleConnectMetaMask}
                  disabled={isConnecting}
                  className="w-full flex items-center gap-4 p-4 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-secondary-500 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="text-4xl">🦊</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">MetaMask</div>
                    <div className="text-sm text-neutral-400">
                      Connect with MetaMask wallet
                    </div>
                  </div>
                  <span className="text-neutral-400">→</span>
                </button>

                <button
                  disabled
                  className="w-full flex items-center gap-4 p-4 bg-neutral-800 border border-neutral-700 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <span className="text-4xl">🔗</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">WalletConnect</div>
                    <div className="text-sm text-neutral-400">Coming soon</div>
                  </div>
                </button>

                <button
                  disabled
                  className="w-full flex items-center gap-4 p-4 bg-neutral-800 border border-neutral-700 rounded-lg opacity-50 cursor-not-allowed"
                >
                  <span className="text-4xl">🔵</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">Coinbase Wallet</div>
                    <div className="text-sm text-neutral-400">Coming soon</div>
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
                <p className="text-neutral-400 text-sm">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">
                Select Your Role
              </h3>

              <div className="space-y-4">
                <button
                  onClick={() => handleRoleSelect('auditor')}
                  className="w-full p-6 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-secondary-500 hover:-translate-y-1 transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">📋</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">
                        Auditor
                      </div>
                      <div className="text-sm text-neutral-400">
                        Upload and verify receipts
                      </div>
                    </div>
                    <span className="text-neutral-400">→</span>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelect('cfo')}
                  className="w-full p-6 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-secondary-500 hover:-translate-y-1 transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">💼</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-lg">CFO</div>
                      <div className="text-sm text-neutral-400">
                        View dashboard & generate reports
                      </div>
                    </div>
                    <span className="text-neutral-400">→</span>
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