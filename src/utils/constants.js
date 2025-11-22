// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORK_NAME: "Lisk Sepolia Testnet",
  CHAIN_ID: 4202, // Lisk Sepolia
  RPC_URL: "https://rpc.sepolia-api.lisk.com",
  EXPLORER_URL: "https://sepolia-blockscout.lisk.com",
  CURRENCY: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
};

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
  ALLOWED_EXTENSIONS: ["pdf", "jpg", "jpeg", "png"],
};

// Receipt Categories
export const RECEIPT_CATEGORIES = [
  { value: "travel", label: "Travel & Transportation" },
  { value: "meals", label: "Meals & Entertainment" },
  { value: "office", label: "Office Supplies" },
  { value: "equipment", label: "Equipment & Hardware" },
  { value: "software", label: "Software & Subscriptions" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "utilities", label: "Utilities & Services" },
  { value: "other", label: "Other Expenses" },
];

// Processing Steps
export const PROCESSING_STEPS = [
  {
    id: "upload",
    label: "File Upload",
    description: "Uploading receipt to server",
  },
  {
    id: "extraction",
    label: "AI Extraction",
    description: "Extracting data from receipt",
  },
  {
    id: "ipfs",
    label: "IPFS Storage",
    description: "Storing file on IPFS network",
  },
  {
    id: "blockchain",
    label: "Blockchain Recording",
    description: "Recording proof on blockchain",
  },
  {
    id: "finalize",
    label: "Database Update",
    description: "Finalizing transaction",
  },
];

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: "Basic",
    price: 0,
    priceLabel: "Free",
    features: [
      { text: "50 receipts per month", included: true },
      { text: "AI extraction", included: true },
      { text: "Blockchain verification", included: true },
      { text: "IPFS storage", included: true },
      { text: "Basic dashboard", included: true },
      { text: "ZK-Range proofs", included: false },
      { text: "Advanced reports", included: false },
      { text: "API access", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  pro: {
    name: "Pro",
    price: 99,
    priceLabel: "$99/month",
    features: [
      { text: "Unlimited receipts", included: true },
      { text: "Enhanced AI extraction", included: true },
      { text: "Priority blockchain verification", included: true },
      { text: "Priority IPFS storage", included: true },
      { text: "Advanced dashboard & analytics", included: true },
      { text: "ZK-Range proofs", included: true, highlight: true },
      { text: "Advanced reports (PDF, Excel, JSON)", included: true },
      { text: "Full API access", included: true },
      { text: "24/7 priority support", included: true },
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
};

// Wallet Types
export const WALLET_TYPES = [
  {
    id: "metamask",
    name: "MetaMask",
    icon: "🦊",
    description: "Connect with MetaMask wallet",
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    icon: "🔗",
    description: "Scan QR code with mobile wallet",
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    icon: "🔵",
    description: "Connect with Coinbase Wallet",
  },
];

// User Roles
export const USER_ROLES = [
  {
    id: "auditor",
    name: "Auditor",
    icon: "📋",
    description: "Upload and verify receipts",
    route: "/upload",
  },
  {
    id: "cfo",
    name: "CFO",
    icon: "💼",
    description: "View dashboard & generate reports",
    route: "/dashboard",
  },
];

// API Endpoints (Placeholder)
export const API_ENDPOINTS = {
  UPLOAD_RECEIPT: "/api/receipts/upload",
  GET_RECEIPT: "/api/receipts/:id",
  LIST_RECEIPTS: "/api/receipts",
  PROCESS_RECEIPT: "/api/receipts/:id/process",
};

// Animation Durations (in seconds)
export const ANIMATION_DURATION = {
  FAST: 0.3,
  NORMAL: 0.5,
  SLOW: 0.8,
  VERY_SLOW: 1.2,
};

// Toast Messages
export const TOAST_MESSAGES = {
  WALLET_CONNECTED: "Wallet connected successfully",
  WALLET_DISCONNECTED: "Wallet disconnected",
  UPLOAD_SUCCESS: "Receipt uploaded successfully",
  UPLOAD_ERROR: "Failed to upload receipt",
  PROCESSING_ERROR: "Error processing receipt",
  COPY_SUCCESS: "Copied to clipboard",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  WALLET_ADDRESS: "wallet_address",
  USER_ROLE: "user_role",
  SUBSCRIPTION_PLAN: "subscription_plan",
  RECENT_RECEIPTS: "recent_receipts",
};

// Feature Highlights for Landing Page
export const FEATURE_HIGHLIGHTS = [
  {
    icon: "Shield",
    title: "Blockchain Immutability",
    description:
      "Every receipt is permanently recorded on Lisk blockchain, ensuring tamper-proof audit trails.",
  },
  {
    icon: "Cpu",
    title: "AI-Powered Extraction",
    description:
      "Advanced AI automatically extracts vendor, amount, date, and category from receipts.",
  },
  {
    icon: "Database",
    title: "IPFS Decentralized Storage",
    description:
      "Original files stored on IPFS network for permanent, distributed access.",
  },
  {
    icon: "Lock",
    title: "Zero-Knowledge Proofs",
    description:
      "Generate ZK-Range proofs for compliance without revealing sensitive amounts (Pro only).",
  },
];

// How It Works Steps
export const HOW_IT_WORKS_STEPS = [
  {
    number: 1,
    title: "Upload Receipt",
    description: "Connect wallet and upload receipt image or PDF",
    icon: "Upload",
  },
  {
    number: 2,
    title: "Blockchain Verification",
    description: "AI extracts data and records proof on blockchain",
    icon: "Blocks",
  },
  {
    number: 3,
    title: "Generate Reports",
    description: "Access dashboard and generate compliance reports",
    icon: "FileText",
  },
];

export default {
  BLOCKCHAIN_CONFIG,
  FILE_CONFIG,
  RECEIPT_CATEGORIES,
  PROCESSING_STEPS,
  SUBSCRIPTION_PLANS,
  WALLET_TYPES,
  USER_ROLES,
  API_ENDPOINTS,
  ANIMATION_DURATION,
  TOAST_MESSAGES,
  STORAGE_KEYS,
  FEATURE_HIGHLIGHTS,
  HOW_IT_WORKS_STEPS,
};
