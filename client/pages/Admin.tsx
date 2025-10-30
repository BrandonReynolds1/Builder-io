import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPendingSponsors,
  approveSponsor as approveSponsorFn,
  declineSponsor as declineSponsorFn,
  bulkApproveSponsors as bulkApproveFn,
  searchPendingSponsors,
  RawUser,
} from "@/lib/relations";

export default function Admin() {
  const { user } = useAuth();
  const [pendingSponsors, setPendingSponsors] = useState<RawUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") return;

    const pending = getPendingSponsors();
    setPendingSponsors(pending);
  }, [user]);

  const refresh = () => setPendingSponsors(getPendingSponsors());

  const approveSponsor = (id: string) => {
    approveSponsorFn(id);
    refresh();
  };

  const declineSponsor = (id: string) => {
    declineSponsorFn(id);
    refresh();
  };

  const bulkApprove = () => {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) return;
    bulkApproveFn(ids);
    setSelectedIds({});
    refresh();
  };

  const onSearch = (q: string) => {
    setSearch(q);
    if (!q) {
      setPendingSponsors(getPendingSponsors());
      return;
    }
    setPendingSponsors(searchPendingSponsors(q));
  };

  if (!user) {
    return (
      <Layout showHeader>
        <div className="p-8">Please login as admin to view this page.</div>
      </Layout>
    );
  }

  if (user.role !== "admin") {
    return (
      <Layout showHeader>
        <div className="p-8">You do not have permission to view this page.</div>
      </Layout>
    );
  }

  return (
    <Layout showHeader>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Admin — Sponsor Approvals</h1>

        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search pending sponsors"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="px-3 py-2 border border-input rounded w-full"
          />
          <button
            onClick={bulkApprove}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded"
          >
            Bulk Approve
          </button>
        </div>

        {pendingSponsors.length === 0 ? (
          <div>No pending sponsors to review.</div>
        ) : (
          <div className="space-y-4">
            {pendingSponsors.map((s) => (
              <div key={s.id} className="p-4 border rounded flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={!!selectedIds[s.id]}
                  onChange={(e) => setSelectedIds((prev) => ({ ...prev, [s.id]: e.target.checked }))}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-medium">{s.displayName}</h2>
                      <p className="text-sm text-muted-foreground">{s.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveSponsor(s.id)}
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => declineSponsor(s.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded"
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>Experience: {s.yearsOfExperience || 0} years</div>
                    {s.qualifications && s.qualifications.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium">Qualifications:</div>
                        <ul className="list-disc ml-5 mt-1">
                          {s.qualifications.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
