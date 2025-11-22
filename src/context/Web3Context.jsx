import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { BLOCKCHAIN_CONFIG, STORAGE_KEYS } from "../utils/constants";

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within Web3Provider");
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  // Load user role from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (savedRole) {
      setUserRole(savedRole);
    }
  }, []);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const network = await provider.getNetwork();

        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setChainId(network.chainId);
      }
    } catch (err) {
      console.error("Error checking connection:", err);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      setAccount(accounts[0]);
      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const connectWallet = async (walletType = "metamask") => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      // Check if on correct network
      if (network.chainId !== BLOCKCHAIN_CONFIG.CHAIN_ID) {
        try {
          await switchNetwork();
        } catch (switchError) {
          throw new Error("Please switch to Lisk Sepolia network");
        }
      }

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);
      setChainId(network.chainId);

      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);

      return { success: true, account: accounts[0] };
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          { chainId: ethers.utils.hexValue(BLOCKCHAIN_CONFIG.CHAIN_ID) },
        ],
      });
    } catch (switchError) {
      // Chain not added to wallet
      if (switchError.code === 4902) {
        await addNetwork();
      } else {
        throw switchError;
      }
    }
  };

  const addNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: ethers.utils.hexValue(BLOCKCHAIN_CONFIG.CHAIN_ID),
            chainName: BLOCKCHAIN_CONFIG.NETWORK_NAME,
            nativeCurrency: BLOCKCHAIN_CONFIG.CURRENCY,
            rpcUrls: [BLOCKCHAIN_CONFIG.RPC_URL],
            blockExplorerUrls: [BLOCKCHAIN_CONFIG.EXPLORER_URL],
          },
        ],
      });
    } catch (addError) {
      throw new Error("Failed to add network to wallet");
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setUserRole(null);
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
  };

  const selectRole = (role) => {
    setUserRole(role);
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  };

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    error,
    userRole,
    isConnected: !!account,
    connectWallet,
    disconnect,
    selectRole,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
