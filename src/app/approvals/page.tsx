"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, CheckCircle, XCircle, MessageSquare, Loader2, AlertCircle } from "lucide-react";

interface Approval {
  id: string;
  title: string;
  type: "code-review" | "content-review" | "strategy-review" | "design-review";
  requester: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  description: string;
  files?: string[];
  content?: string;
  details?: any;
  comment?: string;
  createdAt: string;
  reviewedAt?: string;
}

const typeColors: Record<string, string> = {
  "code-review": "#3b82f6",
  "content-review": "#8b5cf6",
  "strategy-review": "#f59e0b",
  "design-review": "#ec4899",
};

const priorityColors: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchApprovals();
  }, []);

  async function fetchApprovals() {
    try {
      const res = await fetch("/api/approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(id: string, status: "approved" | "rejected") {
    try {
      const res = await fetch("/api/approvals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, comment }),
      });
      if (res.ok) {
        setApprovals(approvals.map((a) => (a.id === id ? { ...a, status, comment } : a)));
        setSelectedApproval(null);
        setComment("");
      }
    } catch (error) {
      console.error("Failed to update approval:", error);
    }
  }

  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ClipboardCheck size={24} style={{ color: "var(--accent)" }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Approvals</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {pendingCount} pending • {approvedCount} approved • {rejectedCount} rejected
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-3xl font-bold" style={{ color: "#f59e0b" }}>{pendingCount}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Pending Review</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-3xl font-bold" style={{ color: "#22c55e" }}>{approvedCount}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Approved</div>
        </div>
        <div className="rounded-xl p-4 border" style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
          <div className="text-3xl font-bold" style={{ color: "#ef4444" }}>{rejectedCount}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Rejected</div>
        </div>
      </div>

      {/* Approvals List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : (
        <div className="space-y-2">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              onClick={() => setSelectedApproval(approval)}
              className="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors hover:border-opacity-50"
              style={{ background: "var(--bg-card)", borderColor: selectedApproval?.id === approval.id ? "var(--accent)" : "var(--border)" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: typeColors[approval.type] + "20" }}
              >
                <AlertCircle size={20} style={{ color: typeColors[approval.type] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ color: "var(--text-primary)" }}>{approval.title}</div>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>{approval.requester}</span>
                  <span>•</span>
                  <span>{approval.createdAt}</span>
                  {approval.files && (
                    <>
                      <span>•</span>
                      <span>{approval.files.length} files</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 rounded text-xs font-medium capitalize"
                  style={{ background: priorityColors[approval.priority] + "20", color: priorityColors[approval.priority] }}
                >
                  {approval.priority}
                </span>
                <span
                  className="px-2 py-1 rounded text-xs font-medium capitalize"
                  style={{ background: approval.status === "pending" ? "#f59e0b20" : approval.status === "approved" ? "#22c55e20" : "#ef444420", color: approval.status === "pending" ? "#f59e0b" : approval.status === "approved" ? "#22c55e" : "#ef4444" }}
                >
                  {approval.status}
                </span>
              </div>
            </div>
          ))}
          {approvals.length === 0 && (
            <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
              No approvals pending
            </div>
          )}
        </div>
      )}

      {/* Approval Detail Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl rounded-xl p-6 border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ background: typeColors[selectedApproval.type] + "20" }}
              >
                <AlertCircle size={24} style={{ color: typeColors[selectedApproval.type] }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{selectedApproval.title}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Requested by {selectedApproval.requester} • {selectedApproval.createdAt}</p>
              </div>
            </div>

            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{selectedApproval.description}</p>

            {selectedApproval.files && selectedApproval.files.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Files</div>
                <div className="flex flex-wrap gap-2">
                  {selectedApproval.files.map((file) => (
                    <span key={file} className="px-2 py-1 rounded text-xs" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>{file}</span>
                  ))}
                </div>
              </div>
            )}

            {selectedApproval.status === "pending" && (
              <>
                <textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-sm border outline-none resize-none mb-4"
                  style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setSelectedApproval(null)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--text-secondary)" }}>Cancel</button>
                  <button onClick={() => handleDecision(selectedApproval.id, "rejected")} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#ef4444" }}>Reject</button>
                  <button onClick={() => handleDecision(selectedApproval.id, "approved")} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#22c55e" }}>Approve</button>
                </div>
              </>
            )}

            {selectedApproval.status !== "pending" && (
              <>
                {selectedApproval.comment && (
                  <div className="mb-4 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Comment</div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{selectedApproval.comment}</p>
                  </div>
                )}
                <div className="flex justify-end">
                  <button onClick={() => setSelectedApproval(null)} className="px-4 py-2 rounded-lg text-sm" style={{ color: "var(--text-secondary)" }}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
