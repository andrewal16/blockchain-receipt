import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, formatDate } from "../utils/helpers";

const AgreementReview = () => {
  const { agreementId } = useParams();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  
  const [action, setAction] = useState(null); // 'approve', 'negotiate', 'reject'
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Negotiation form
  const [negotiationData, setNegotiationData] = useState({
    proposedPrice: 0,
    reason: "",
  });
  
  // Rejection form
  const [rejectionReason, setRejectionReason] = useState("");

  // Mock Agreement Data
  const [agreement] = useState({
    id: agreementId || "AGR-2025-002",
    company: "BlockReceipt Enterprise",
    category: "Software Subscription",
    itemName: "Cloud Storage Enterprise",
    specifications: "100TB storage, 99.9% uptime SLA, Daily backups, API access",
    pricePerUnit: 5000000,
    totalQuantity: 12,
    totalValue: 60000000,
    contractPeriod: { start: "2025-02-01", end: "2026-01-31" },
    paymentTerms: "full",
    createdAt: "2025-01-20",
    createdBy: "Finance Team - Sarah",
    status: "pending-vendor",
    draftContract: null,
  });

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".page-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );

      gsap.fromTo(
        ".content-section",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power3.out" }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Handle Actions
  const handleApprove = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`Agreement ${agreement.id} approved! Sent to CFO for final approval.`);
    setIsProcessing(false);
    navigate("/vendor/dashboard");
  };

  const handleNegotiate = async () => {
    if (!negotiationData.proposedPrice || !negotiationData.reason) {
      alert("Please fill in all negotiation fields");
      return;
    }
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(
      `Negotiation request sent! Proposed price: ${formatCurrency(
        negotiationData.proposedPrice
      )}`
    );
    setIsProcessing(false);
    navigate("/vendor/dashboard");
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert("Please provide a rejection reason");
      return;
    }
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`Agreement ${agreement.id} rejected. Finance team will be notified.`);
    setIsProcessing(false);
    navigate("/vendor/dashboard");
  };

  const ActionModal = () => {
    if (!action) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="max-w-lg w-full p-6 shadow-2xl">
          {action === "approve" && (
            <>
              <h3 className="text-2xl font-bold text-white mb-4">
                Confirm Approval
              </h3>
              <p className="text-slate-400 mb-6">
                By approving this agreement, you confirm that:
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>You can deliver the items as specified</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>You agree to the pricing and terms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span>You can meet the contract period timeline</span>
                </li>
              </ul>
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-300">
                  <strong>Next Step:</strong> After your approval, this agreement
                  will be sent to CFO for final approval before becoming active.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setAction(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400"
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "✓ Confirm Approval"}
                </Button>
              </div>
            </>
          )}

          {action === "negotiate" && (
            <>
              <h3 className="text-2xl font-bold text-white mb-4">
                Request Changes
              </h3>
              <p className="text-slate-400 mb-6 text-sm">
                Submit a counteroffer to the finance team. They will review and
                respond to your proposal.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Current Price per Unit
                  </label>
                  <div className="bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white font-mono">
                    {formatCurrency(agreement.pricePerUnit)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Your Proposed Price per Unit *
                  </label>
                  <input
                    type="number"
                    value={negotiationData.proposedPrice || ""}
                    onChange={(e) =>
                      setNegotiationData({
                        ...negotiationData,
                        proposedPrice: Number(e.target.value),
                      })
                    }
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                    placeholder="Enter your price"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Reason for Change *
                  </label>
                  <textarea
                    value={negotiationData.reason}
                    onChange={(e) =>
                      setNegotiationData({
                        ...negotiationData,
                        reason: e.target.value,
                      })
                    }
                    rows="4"
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                    placeholder="Explain why you need different terms..."
                  />
                </div>

                {negotiationData.proposedPrice > 0 && (
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-300">New Total Value:</span>
                      <span className="text-blue-300 font-mono font-bold">
                        {formatCurrency(
                          negotiationData.proposedPrice * agreement.totalQuantity
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setAction(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleNegotiate}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Sending..." : "💬 Send Proposal"}
                </Button>
              </div>
            </>
          )}

          {action === "reject" && (
            <>
              <h3 className="text-2xl font-bold text-white mb-4">
                Decline Agreement
              </h3>
              <p className="text-slate-400 mb-6 text-sm">
                Please provide a reason for declining this agreement. The finance
                team will be notified.
              </p>

              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">
                  Reason for Declining *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows="5"
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                  placeholder="e.g., Cannot meet delivery timeline, Price too low, Specifications unclear..."
                />
              </div>

              <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-300">
                  <strong>Note:</strong> Rejecting this agreement will notify the
                  finance team, and they may revise and resubmit the proposal.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setAction(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white"
                  onClick={handleReject}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "✕ Confirm Rejection"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={pageRef}
    >
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="page-header mb-10">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate("/vendor/dashboard")}
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Agreement Review
              </h1>
              <p className="text-slate-400 text-sm">
                Review proposal from {agreement.company}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="warning" size="lg">
              Awaiting Your Approval
            </Badge>
            <span className="text-slate-500 text-sm">
              Received: {formatDate(agreement.createdAt)}
            </span>
          </div>
        </div>

        {/* Agreement Details */}
        <div className="space-y-6">
          <Card className="content-section p-8">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              Agreement Details
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                    Agreement ID
                  </div>
                  <div className="text-white font-mono font-medium">
                    {agreement.id}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                    Category
                  </div>
                  <div className="text-white font-medium">
                    {agreement.category}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                    Created By
                  </div>
                  <div className="text-white font-medium">
                    {agreement.createdBy}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">
                    Created Date
                  </div>
                  <div className="text-white font-medium">
                    {formatDate(agreement.createdAt)}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                  Item Details
                </div>
                <div className="bg-slate-800/30 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {agreement.itemName}
                  </h3>
                  <div className="text-slate-300 text-sm leading-relaxed mb-4">
                    {agreement.specifications}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <div className="text-xs text-slate-500 uppercase font-bold mb-3">
                  Commercial Terms
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <div className="text-xs text-slate-500 mb-1">
                      Price per Unit
                    </div>
                    <div className="text-2xl font-bold text-cyan-400 font-mono">
                      {formatCurrency(agreement.pricePerUnit)}
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <div className="text-xs text-slate-500 mb-1">
                      Total Quantity
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {agreement.totalQuantity} units
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <div className="text-xs text-slate-500 mb-1">
                      Contract Start
                    </div>
                    <div className="text-white font-medium">
                      {formatDate(agreement.contractPeriod.start)}
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <div className="text-xs text-slate-500 mb-1">
                      Contract End
                    </div>
                    <div className="text-white font-medium">
                      {formatDate(agreement.contractPeriod.end)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-cyan-400 mb-1">
                      Total Agreement Value
                    </div>
                    <div className="text-xs text-slate-400">
                      {agreement.totalQuantity} units × {formatCurrency(agreement.pricePerUnit)}
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-cyan-400">
                    {formatCurrency(agreement.totalValue)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="content-section grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400"
              onClick={() => setAction("approve")}
            >
              <span className="text-xl mr-2">✓</span>
              Approve Agreement
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="w-full py-4"
              onClick={() => setAction("negotiate")}
            >
              <span className="text-xl mr-2">💬</span>
              Request Changes
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full py-4 text-red-400 hover:bg-red-500/10 border border-red-500/20"
              onClick={() => setAction("reject")}
            >
              <span className="text-xl mr-2">✕</span>
              Decline
            </Button>
          </div>

          {/* Info Box */}
          <Card className="content-section p-6 bg-blue-900/10 border-blue-500/20">
            <div className="flex items-start gap-4">
              <span className="text-3xl">ℹ️</span>
              <div>
                <h4 className="text-blue-300 font-bold mb-2">
                  What Happens Next?
                </h4>
                <ul className="space-y-2 text-sm text-blue-200/80">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      <strong>If you approve:</strong> Agreement will be sent to
                      CFO for final approval, then becomes active
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      <strong>If you negotiate:</strong> Finance team will review
                      your counteroffer and respond
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>
                      <strong>If you decline:</strong> Finance team will be
                      notified and may revise the proposal
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Action Modals */}
      <ActionModal />
    </div>
  );
};

export default AgreementReview;