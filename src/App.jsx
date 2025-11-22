import { Routes, Route, Navigate } from "react-router-dom";
import { useWeb3 } from "./context/Web3Context";

// Pages - Phase 1
import Landing from "./pages/Landing";
import WalletConnection from "./pages/WalletConnection";
import UploadReceipt from "./pages/UploadReceipt";
import ReceiptSuccess from "./pages/ReceiptSuccess";
import Pricing from "./pages/Pricing";

// Pages - Phase 2
import AuditorSubmissions from "./pages/AuditorSubmissions";
import CFODashboard from "./pages/CFODashboard";
import Reports from "./pages/Reports";

// Pages - Phase 3 (ZK Proofs)
import ZKDashboard from "./pages/ZKDashboard";
import ZKGenerator from './pages/ZKGenerator'; // You already have this
import ZKVerification from './pages/ZKVerification'; // You already have this

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isConnected, userRole } = useWeb3();

  if (!isConnected) {
    return <Navigate to="/connect" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "auditor") {
      return <Navigate to="/upload" replace />;
    } else if (userRole === "cfo") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/connect" element={<WalletConnection />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Auditor Routes */}
      <Route
        path="/upload"
        element={
          <ProtectedRoute allowedRoles={["auditor"]}>
            <UploadReceipt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auditor/submissions"
        element={
          <ProtectedRoute allowedRoles={["auditor"]}>
            <AuditorSubmissions />
          </ProtectedRoute>
        }
      />

      {/* CFO Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["cfo"]}>
            <CFODashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={["cfo"]}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* ZK Proof Routes - CFO Only */}
      <Route
        path="/zk/dashboard"
        element={
          <ProtectedRoute allowedRoles={["cfo"]}>
            <ZKDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/zk/generate"
        element={
          <ProtectedRoute allowedRoles={['cfo']}>
            <ZKGenerator />
          </ProtectedRoute>
        }
      />
   

  
      <Route path="/zk/verify/:proofId" element={<ZKVerification />} />
     

      {/* Shared Routes */}
      <Route
        path="/receipt/:receiptId"
        element={
          <ProtectedRoute>
            <ReceiptSuccess />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
