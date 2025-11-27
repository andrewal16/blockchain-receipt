import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Navbar from "../components/common/Navbar";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { formatCurrency, formatDate } from "../utils/helpers";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'active', 'history'

  // Mock Data - Pending Agreements
  const [pendingAgreements] = useState([
    {
      id: "AGR-2025-002",
      company: "BlockReceipt Enterprise",
      category: "Software Subscription",
      itemName: "Cloud Storage Enterprise",
      specifications: "100TB storage, 99.9% uptime SLA",
      pricePerUnit: 5000000,
      totalQuantity: 12,
      totalValue: 60000000,
      contractPeriod: { start: "2025-02-01", end: "2026-01-31" },
      paymentTerms: "full",
      createdAt: "2025-01-20",
      status: "pending-vendor",
    },
    {
      id: "AGR-2025-006",
      company: "BlockReceipt Enterprise",
      category: "Services",
      itemName: "Annual Maintenance Contract",
      specifications: "24/7 support, monthly on-site visit",
      pricePerUnit: 15000000,
      totalQuantity: 12,
      totalValue: 180000000,
      contractPeriod: { start: "2025-02-15", end: "2026-02-14" },
      paymentTerms: "installment",
      createdAt: "2025-01-23",
      status: "pending-vendor",
    },
  ]);

  // Mock Data - Active Agreements
  const [activeAgreements] = useState([
    {
      id: "AGR-2025-001",
      company: "BlockReceipt Enterprise",
      category: "Electronics",
      itemName: "Laptop Dell Latitude 5420",
      pricePerUnit: 8000000,
      totalQuantity: 10,
      usedQuantity: 4,
      totalValue: 80000000,
      contractPeriod: { start: "2025-01-01", end: "2025-12-31" },
      status: "active",
      lastInvoice: "2025-01-15",
    },
  ]);

  // Mock Data - Payment History
  const [paymentHistory] = useState([
    {
      id: "PAY-001",
      agreementId: "AGR-2025-001",
      invoiceId: "INV-2025-0015",
      amount: 32000000,
      date: "2025-01-15",
      status: "paid",
      paidDate: "2025-01-18",
    },
    {
      id: "PAY-002",
      agreementId: "AGR-2025-001",
      invoiceId: "INV-2024-0125",
      amount: 24000000,
      date: "2024-12-20",
      status: "paid",
      paidDate: "2024-12-25",
    },
  ]);

  // Stats
  const stats = {
    pendingReview: pendingAgreements.length,
    activeContracts: activeAgreements.length,
    totalRevenue: paymentHistory.reduce((acc, p) => acc + p.amount, 0),
    pendingPayments: 0,
  };

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".page-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 }
      );

      tl.fromTo(
        ".stat-card",
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 },
        "-=0.3"
      );

      tl.fromTo(
        ".tab-button",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        "-=0.2"
      );

      tl.fromTo(
        ".content-item",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.4, stagger: 0.08 },
        "-=0.3"
      );
    }, pageRef);

    return () => ctx.revert();
  }, [activeTab]);

  const TabButton = ({ id, label, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`tab-button px-6 py-3 rounded-lg font-medium transition-all ${
        activeTab === id
          ? "bg-slate-800 text-white shadow-lg"
          : "text-slate-400 hover:text-white hover:bg-slate-800/50"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === id
              ? "bg-cyan-500 text-black"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div
      className="min-h-screen bg-[#0B0F19] text-slate-200 font-sans selection:bg-cyan-500/30"
      ref={pageRef}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Header */}
        <div className="page-header mb-10 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-white/10 flex items-center justify-center">
              <span className="text-3xl">🏢</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Vendor Portal
              </h1>
              <p className="text-slate-400">PT Supplier ABC</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card bg-amber-900/10 border border-amber-500/20 p-5 rounded-2xl">
            <div className="text-amber-400 text-xs uppercase font-bold mb-2">
              Pending Review
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.pendingReview}
            </div>
            <div className="text-[10px] text-amber-500/60 mt-1">
              Needs your action
            </div>
          </div>

          <div className="stat-card bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-2xl">
            <div className="text-emerald-400 text-xs uppercase font-bold mb-2">
              Active Contracts
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.activeContracts}
            </div>
            <div className="text-[10px] text-emerald-500/60 mt-1">
              Currently running
            </div>
          </div>

          <div className="stat-card bg-slate-900/50 border border-white/5 p-5 rounded-2xl">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Total Revenue
            </div>
            <div className="text-xl font-bold text-white truncate">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Lifetime earned</div>
          </div>

          <div className="stat-card bg-slate-900/50 border border-white/5 p-5 rounded-2xl">
            <div className="text-slate-400 text-xs uppercase font-bold mb-2">
              Pending Payments
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.pendingPayments}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Awaiting payment</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <TabButton
            id="pending"
            label="Pending Approval"
            count={pendingAgreements.length}
          />
          <TabButton
            id="active"
            label="Active Agreements"
            count={activeAgreements.length}
          />
          <TabButton id="history" label="Payment History" count={0} />
        </div>

        {/* TAB 1: Pending Agreements */}
        {activeTab === "pending" && (
          <div className="space-y-4">
            {pendingAgreements.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-5xl mb-4 opacity-20">✅</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  No Pending Agreements
                </h3>
                <p className="text-slate-400">All proposals have been reviewed.</p>
              </Card>
            ) : (
              pendingAgreements.map((agreement) => (
                <Card
                  key={agreement.id}
                  className="content-item p-6 border-amber-500/20 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-white">
                          {agreement.itemName}
                        </h3>
                        <Badge variant="warning" size="sm">
                          Needs Your Approval
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-slate-500">Agreement ID:</span>
                          <span className="text-white font-mono ml-2">
                            {agreement.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Company:</span>
                          <span className="text-white ml-2">
                            {agreement.company}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Category:</span>
                          <span className="text-white ml-2">
                            {agreement.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Created:</span>
                          <span className="text-white ml-2">
                            {formatDate(agreement.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-800/30 rounded-lg p-4 mb-3">
                        <div className="text-xs text-slate-500 uppercase font-bold mb-2">
                          Specifications
                        </div>
                        <div className="text-sm text-white">
                          {agreement.specifications}
                        </div>
                      </div>

                      <div className="bg-slate-800/30 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Price per Unit:</span>
                          <span className="text-white font-mono">
                            {formatCurrency(agreement.pricePerUnit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Quantity:</span>
                          <span className="text-white font-bold">
                            {agreement.totalQuantity} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Contract Period:</span>
                          <span className="text-white text-xs">
                            {agreement.contractPeriod.start} to{" "}
                            {agreement.contractPeriod.end}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2">
                          <span className="text-cyan-400 font-bold">
                            Total Value:
                          </span>
                          <span className="text-cyan-400 font-mono font-bold text-lg">
                            {formatCurrency(agreement.totalValue)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6 lg:w-64">
                      <div className="space-y-3">
                        <Button
                          variant="primary"
                          className="w-full bg-emerald-500 hover:bg-emerald-400"
                          onClick={() =>
                            navigate(`/vendor/agreements/${agreement.id}/review`)
                          }
                        >
                          ✓ Review & Approve
                        </Button>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() =>
                            navigate(`/vendor/agreements/${agreement.id}/negotiate`)
                          }
                        >
                          💬 Request Changes
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full text-red-400 hover:bg-red-500/10"
                          onClick={() => alert("Reject agreement")}
                        >
                          ✕ Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Active Agreements */}
        {activeTab === "active" && (
          <div className="space-y-4">
            {activeAgreements.map((agreement) => {
              const usagePercent =
                (agreement.usedQuantity / agreement.totalQuantity) * 100;
              const remainingQty =
                agreement.totalQuantity - agreement.usedQuantity;

              return (
                <Card
                  key={agreement.id}
                  className="content-item p-6 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-bold text-white">
                          {agreement.itemName}
                        </h3>
                        <Badge variant="success" size="sm" dot>
                          Active
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-slate-500">Agreement ID:</span>
                          <span className="text-cyan-400 font-mono ml-2">
                            {agreement.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Company:</span>
                          <span className="text-white ml-2">
                            {agreement.company}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Category:</span>
                          <span className="text-white ml-2">
                            {agreement.category}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Last Invoice:</span>
                          <span className="text-white ml-2">
                            {formatDate(agreement.lastInvoice)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-800/30 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Used Quantity:</span>
                          <span className="text-white font-bold">
                            {agreement.usedQuantity} / {agreement.totalQuantity}{" "}
                            units
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Remaining:</span>
                          <span className="text-cyan-400 font-bold">
                            {remainingQty} units
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Usage Progress</span>
                            <span>{usagePercent.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="h-full bg-cyan-500 rounded-full transition-all"
                              style={{ width: `${usagePercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6 lg:w-64">
                      <div className="space-y-3">
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() =>
                            navigate(`/vendor/agreements/${agreement.id}`)
                          }
                        >
                          View Details
                        </Button>
                        <div className="text-xs text-slate-500 text-center">
                          Contract valid until{" "}
                          {formatDate(agreement.contractPeriod.end)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 3: Payment History */}
        {activeTab === "history" && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                      Payment ID
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                      Agreement
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                      Invoice
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                      Paid Date
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paymentHistory.map((payment) => (
                    <tr
                      key={payment.id}
                      className="content-item hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white font-mono">
                        {payment.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-cyan-400 font-mono">
                        {payment.agreementId}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                        {payment.invoiceId}
                      </td>
                      <td className="px-6 py-4 text-sm text-white font-mono font-bold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-white">
                        {formatDate(payment.paidDate)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="success" size="sm" dot>
                          Paid
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;