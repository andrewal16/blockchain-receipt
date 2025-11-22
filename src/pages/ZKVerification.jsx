import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, formatDate, getExplorerLink } from "../utils/helpers";

const ZKVerification = () => {
  const { proofId } = useParams();
  const pageRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [proof, setProof] = useState(null);

  // Mock data - replace with actual API call
  const mockProof = {
    id: proofId || "ZKP-1737123456789",
    status: "valid",
    createdAt: "2025-01-18T10:30:00Z",
    expiresAt: "2025-04-18T10:30:00Z",
    proofHash: "0xabc123...def789",
    blockNumber: "1234567",
    txHash: "0xdef456...abc123",
    statement: {
      type: "between",
      range: {
        min: 50000000,
        max: 100000000,
      },
      dateRange: {
        start: "2024-10-01",
        end: "2024-12-31",
      },
      categories: ["Travel", "Marketing"],
      purpose: "Q4 2024 Budget Compliance for Board Meeting",
    },
    verificationCount: 12,
    issuer: {
      organization: "BlockReceipt Enterprise",
      wallet: "0x742d...3f8a",
    },
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setProof(mockProof);
      setLoading(false);
    }, 1500);

    const ctx = gsap.context(() => {
      gsap.from(".verify-section", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power3.out",
        delay: 1.5,
      });
    }, pageRef);

    return () => ctx.revert();
  }, [proofId]);

  const handleVerify = async () => {
    setVerifying(true);

    // Simulate blockchain verification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setVerified(true);
    setVerifying(false);

    // Animate success
    gsap.from(".verification-success", {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(2)",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white text-lg">Loading proof...</div>
        </div>
      </div>
    );
  }

  if (!proof) {
    return (
      <div className="min-h-screen bg-primary-900">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-32 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Proof Not Found
          </h1>
          <p className="text-neutral-400">
            The proof ID you're looking for doesn't exist or has been revoked.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = new Date(proof.expiresAt) < new Date();
  const isValid = proof.status === "valid" && !isExpired;

  return (
    <div className="min-h-screen bg-primary-900" ref={pageRef}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="premium" size="lg" className="mb-4">
            🔒 ZERO-KNOWLEDGE PROOF
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-2">
            Verification Portal
          </h1>
          <p className="text-neutral-400">
            Verify cryptographic proof of spending without revealing exact
            amounts
          </p>
        </div>

        {/* How to Read This Proof */}
        <Card className="verify-section mb-6 bg-secondary-900/20 border-secondary-700">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                How to Read This Proof
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                This is a <strong>Zero-Knowledge Proof</strong> - a
                cryptographic method that proves a statement is true without
                revealing the underlying data. You can verify that spending
                falls within the stated range
                <strong className="text-white">
                  {" "}
                  without seeing exact transaction amounts
                </strong>
                . The proof is mathematically guaranteed by blockchain
                verification.
              </p>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card
          className={`verify-section mb-6 ${
            isValid ? "border-success-500" : "border-warning-500"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Proof Status</h2>
            <Badge variant={isValid ? "success" : "warning"} size="lg">
              {isValid ? "✓ Valid" : isExpired ? "⏱️ Expired" : "⚠️ Invalid"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-800 rounded-lg">
              <div className="text-sm text-neutral-400 mb-1">Proof ID</div>
              <code className="text-white font-mono text-sm">{proof.id}</code>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <div className="text-sm text-neutral-400 mb-1">
                Verification Count
              </div>
              <div className="text-xl font-bold text-white">
                {proof.verificationCount} times
              </div>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <div className="text-sm text-neutral-400 mb-1">Created</div>
              <div className="text-white">{formatDate(proof.createdAt)}</div>
            </div>
            <div className="p-4 bg-neutral-800 rounded-lg">
              <div className="text-sm text-neutral-400 mb-1">Valid Until</div>
              <div className={isExpired ? "text-warning-400" : "text-white"}>
                {formatDate(proof.expiresAt)}
              </div>
            </div>
          </div>
        </Card>

        {/* Proof Statement */}
        <Card className="verify-section mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            📊 Proof Statement
          </h2>

          {/* Time Period */}
          <div className="mb-6 p-4 bg-neutral-800 rounded-lg">
            <div className="text-sm text-neutral-400 mb-2">Time Period</div>
            <div className="text-lg text-white font-medium">
              {formatDate(proof.statement.dateRange.start)} -{" "}
              {formatDate(proof.statement.dateRange.end)}
            </div>
          </div>

          {/* The Claim */}
          <div className="mb-6 p-6 bg-gradient-to-br from-secondary-900/40 to-accent-900/40 border-2 border-accent-500/50 rounded-xl">
            <div className="text-sm text-neutral-400 mb-3">
              Cryptographically Proven Claim:
            </div>
            <div className="text-2xl font-bold text-white leading-relaxed">
              {proof.statement.type === "between" && (
                <>
                  Total spending is{" "}
                  <span className="text-success-400">between</span>
                  <div className="text-3xl text-accent-400 my-3">
                    {formatCurrency(proof.statement.range.min)}
                    <span className="text-neutral-500 mx-3">and</span>
                    {formatCurrency(proof.statement.range.max)}
                  </div>
                </>
              )}
              {proof.statement.type === "less-than" && (
                <>
                  Total spending is{" "}
                  <span className="text-success-400">less than</span>
                  <div className="text-3xl text-accent-400 my-3">
                    {formatCurrency(proof.statement.range.max)}
                  </div>
                </>
              )}
              {proof.statement.type === "greater-than" && (
                <>
                  Total spending is{" "}
                  <span className="text-success-400">greater than</span>
                  <div className="text-3xl text-accent-400 my-3">
                    {formatCurrency(proof.statement.range.min)}
                  </div>
                </>
              )}
            </div>

            {proof.statement.categories &&
              proof.statement.categories.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-700">
                  <div className="text-sm text-neutral-400 mb-2">
                    For Categories:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {proof.statement.categories.map((cat) => (
                      <Badge key={cat} variant="ai">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Purpose */}
          {proof.statement.purpose && (
            <div className="p-4 bg-neutral-800 rounded-lg">
              <div className="text-sm text-neutral-400 mb-1">Purpose</div>
              <div className="text-white">{proof.statement.purpose}</div>
            </div>
          )}
        </Card>

        {/* What You DON'T See */}
        <Card className="verify-section mb-6 bg-warning-900/20 border-warning-700">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🔐</div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                What This Proof Does NOT Reveal
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li className="flex items-start gap-2">
                  <span className="text-warning-500 mt-0.5">✗</span>
                  <span>
                    <strong>Exact total amount</strong> - Only range boundaries
                    are known
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning-500 mt-0.5">✗</span>
                  <span>
                    <strong>Individual transaction details</strong> - Receipts
                    remain private
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning-500 mt-0.5">✗</span>
                  <span>
                    <strong>Vendor information</strong> - Business relationships
                    are confidential
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning-500 mt-0.5">✗</span>
                  <span>
                    <strong>Payment methods</strong> - Financial instruments
                    remain hidden
                  </span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-success-500/10 border border-success-500/30 rounded-lg">
                <div className="text-sm text-success-300">
                  <strong>Privacy Guarantee:</strong> This proof is
                  mathematically impossible to reverse-engineer. The exact
                  spending amount cannot be derived from this proof.
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Blockchain Verification */}
        <Card className="verify-section mb-6">
          <h2 className="text-xl font-bold text-white mb-4">
            ⛓️ Blockchain Verification
          </h2>

          {!verified ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-lg text-white mb-6">
                Verify this proof on the blockchain to confirm its authenticity
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleVerify}
                loading={verifying}
              >
                {verifying
                  ? "Verifying on Blockchain..."
                  : "Verify on Blockchain"}
              </Button>
            </div>
          ) : (
            <div className="verification-success">
              <div className="flex items-start gap-4 p-6 bg-success-500/10 border-2 border-success-500 rounded-xl mb-4">
                <div className="text-5xl">✓</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-success-400 mb-2">
                    Verification Successful!
                  </h3>
                  <p className="text-neutral-300 mb-4">
                    This proof has been verified on the Lisk blockchain and is
                    cryptographically valid.
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg">
                      <span className="text-sm text-neutral-400">
                        Proof Hash:
                      </span>
                      <code className="text-white font-mono text-xs">
                        {proof.proofHash}
                      </code>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg">
                      <span className="text-sm text-neutral-400">
                        Block Number:
                      </span>
                      <span className="text-white">#{proof.blockNumber}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-800 rounded-lg">
                      <span className="text-sm text-neutral-400">
                        Transaction:
                      </span>
                      <a
                        href={getExplorerLink("tx", proof.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary-400 hover:text-secondary-300 text-xs font-mono"
                      >
                        {proof.txHash}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() =>
                  window.open(getExplorerLink("tx", proof.txHash), "_blank")
                }
              >
                View on Lisk Explorer →
              </Button>
            </div>
          )}
        </Card>

        {/* Issuer Information */}
        <Card className="verify-section">
          <h2 className="text-xl font-bold text-white mb-4">
            🏢 Issuer Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Organization:</span>
              <span className="text-white font-medium">
                {proof.issuer.organization}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Wallet Address:</span>
              <code className="text-white font-mono text-sm">
                {proof.issuer.wallet}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Verification Standard:</span>
              <Badge variant="success">ZK-SNARK v2.0</Badge>
            </div>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-neutral-800 rounded-lg">
            <div className="text-3xl mb-2">🔒</div>
            <div className="text-sm font-semibold text-white mb-1">
              Privacy Protected
            </div>
            <div className="text-xs text-neutral-400">
              Zero-Knowledge cryptography
            </div>
          </div>
          <div className="text-center p-4 bg-neutral-800 rounded-lg">
            <div className="text-3xl mb-2">⛓️</div>
            <div className="text-sm font-semibold text-white mb-1">
              Blockchain Verified
            </div>
            <div className="text-xs text-neutral-400">Immutable on Lisk</div>
          </div>
          <div className="text-center p-4 bg-neutral-800 rounded-lg">
            <div className="text-3xl mb-2">✓</div>
            <div className="text-sm font-semibold text-white mb-1">
              Mathematically Sound
            </div>
            <div className="text-xs text-neutral-400">
              Cryptographically proven
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZKVerification;
