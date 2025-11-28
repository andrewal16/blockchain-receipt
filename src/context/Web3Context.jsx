import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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
  const [hasCheckedConnection, setHasCheckedConnection] = useState(false);

  // ✅ NEW: Check if user explicitly disconnected
  const checkExplicitDisconnect = () => {
    return localStorage.getItem(STORAGE_KEYS.EXPLICIT_DISCONNECT) === "true";
  };

  // ✅ NEW: Set explicit disconnect flag
  const setExplicitDisconnect = (value) => {
    if (value) {
      localStorage.setItem(STORAGE_KEYS.EXPLICIT_DISCONNECT, "true");
    } else {
      localStorage.removeItem(STORAGE_KEYS.EXPLICIT_DISCONNECT);
    }
  };

  // ✅ IMPROVED: Only auto-reconnect if user didn't explicitly disconnect
  useEffect(() => {
    const initializeConnection = async () => {
      const wasConnected = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
      const explicitDisconnect = checkExplicitDisconnect();

      // Only auto-check if user was previously connected AND didn't explicitly disconnect
      if (wasConnected && !explicitDisconnect && window.ethereum) {
        await checkConnection();
      }

      setHasCheckedConnection(true);
    };

    initializeConnection();

    // Setup event listeners
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

  // Load role ONLY after successful connection
  useEffect(() => {
    if (account) {
      const savedRole = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
      if (savedRole) {
        setUserRole(savedRole);
      }
    }
  }, [account]);

  const checkConnection = async () => {
    if (!window.ethereum) return;

    try {
      // Check if we have permission first
      const permissions = await window.ethereum.request({
        method: "wallet_getPermissions",
      });

      const hasAccountsPermission = permissions.some(
        (permission) => permission.parentCapability === "eth_accounts"
      );

      if (!hasAccountsPermission) {
        return;
      }

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
      localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    }
  };

  const handleAccountsChanged = useCallback(
    (accounts) => {
      if (accounts.length === 0) {
        // User disconnected from MetaMask
        disconnect();
      } else if (accounts[0] !== account) {
        // Account changed, update state
        setAccount(accounts[0]);
        localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);

        // Reset role when account changes
        setUserRole(null);
        localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      }
    },
    [account]
  );

  const handleChainChanged = useCallback((newChainId) => {
    const chainIdDecimal = parseInt(newChainId, 16);

    if (chainIdDecimal === BLOCKCHAIN_CONFIG.CHAIN_ID) {
      setChainId(chainIdDecimal);
      setError(null);
    } else {
      setChainId(chainIdDecimal);
      setError(`Please switch to ${BLOCKCHAIN_CONFIG.NETWORK_NAME}`);
    }
  }, []);

  // ✅ IMPROVED: Clear explicit disconnect flag when connecting
  const connectWallet = async (walletType = "metamask") => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error(
          "MetaMask is not installed. Please install MetaMask extension."
        );
      }

      // ✅ CRITICAL: Clear explicit disconnect flag before connecting
      // This allows future auto-reconnect
      setExplicitDisconnect(false);

      // Request accounts - this will ALWAYS show MetaMask popup
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No accounts found. Please unlock your MetaMask wallet."
        );
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();

      // Check if on correct network
      if (network.chainId !== BLOCKCHAIN_CONFIG.CHAIN_ID) {
        try {
          await switchNetwork();
          const updatedNetwork = await provider.getNetwork();
          setChainId(updatedNetwork.chainId);
        } catch (switchError) {
          throw new Error(`Please switch to ${BLOCKCHAIN_CONFIG.NETWORK_NAME}`);
        }
      } else {
        setChainId(network.chainId);
      }

      setAccount(accounts[0]);
      setProvider(provider);
      setSigner(signer);

      localStorage.setItem(STORAGE_KEYS.WALLET_ADDRESS, accounts[0]);

      return { success: true, account: accounts[0] };
    } catch (err) {
      console.error("Error connecting wallet:", err);

      let errorMessage = err.message;
      if (err.code === 4001) {
        errorMessage =
          "Connection request rejected. Please approve the connection in MetaMask.";
      } else if (err.code === -32002) {
        errorMessage =
          "Connection request pending. Please check your MetaMask extension.";
      } else if (err.code === -32603) {
        errorMessage = "Internal error. Please try refreshing the page.";
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
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
      throw new Error(
        "Failed to add network. Please add manually in MetaMask."
      );
    }
  };

  // ✅ IMPROVED: Set explicit disconnect flag and attempt to revoke permissions
  const disconnect = useCallback(async () => {
    // Clear all state
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setUserRole(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.WALLET_ADDRESS);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);

    // ✅ CRITICAL: Set explicit disconnect flag
    // This prevents auto-reconnect on next visit
    setExplicitDisconnect(true);

    // ✅ BONUS: Try to revoke permissions (works on newer MetaMask versions)
    try {
      if (window.ethereum && window.ethereum.request) {
        // Check if wallet_revokePermissions is available
        await window.ethereum.request({
          method: "wallet_revokePermissions",
          params: [
            {
              eth_accounts: {},
            },
          ],
        });
        console.log("Permissions revoked successfully");
      }
    } catch (err) {
      // This is expected on older MetaMask versions
      // The explicit disconnect flag will handle the behavior
      console.log("Permission revocation not supported, using fallback method");
    }
  }, []);

  const selectRole = useCallback((role) => {
    setUserRole(role);
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  }, []);

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    error,
    userRole,
    isConnected: !!account,
    hasCheckedConnection,
    connectWallet,
    disconnect,
    selectRole,
    switchNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
