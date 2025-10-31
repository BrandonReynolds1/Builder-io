import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPendingSponsorsAsync,
  approveSponsor as approveSponsorFn,
  approveSponsorAsync,
  declineSponsor as declineSponsorFn,
  declineSponsorAsync,
  bulkApproveSponsors as bulkApproveFn,
  bulkApproveSponsorsAsync,
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
    (async () => {
      const pending = await getPendingSponsorsAsync();
      setPendingSponsors(pending);
    })();
  }, [user]);
  const refresh = async () => setPendingSponsors(await getPendingSponsorsAsync());

  const approveSponsor = async (id: string) => {
    await approveSponsorAsync(id);
    await refresh();
  };

  const declineSponsor = async (id: string) => {
    await declineSponsorAsync(id);
    await refresh();
  };

  const bulkApprove = async () => {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) return;
    await bulkApproveSponsorsAsync(ids);
    setSelectedIds({});
    await refresh();
  };

  const onSearch = async (q: string) => {
    setSearch(q);
    const list = await getPendingSponsorsAsync();
    if (!q) {
      setPendingSponsors(list);
      return;
    }
    const qlow = q.trim().toLowerCase();
    setPendingSponsors(list.filter((u) => u.displayName.toLowerCase().includes(qlow) || u.email.toLowerCase().includes(qlow)));
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
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-xl font-semibold mb-6 text-foreground">Admin — Sponsor Approvals</h1>

        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Search pending sponsors"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={bulkApprove}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Bulk Approve
          </button>
        </div>

        {pendingSponsors.length === 0 ? (
          <div className="text-sm text-muted-foreground">No pending sponsors to review.</div>
        ) : (
          <div className="space-y-3">
            {pendingSponsors.map((s) => (
              <div key={s.id} className="p-4 border border-border rounded-lg bg-card flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={!!selectedIds[s.id]}
                  onChange={(e) => setSelectedIds((prev) => ({ ...prev, [s.id]: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-medium text-foreground">{s.displayName}</h2>
                      <p className="text-sm text-muted-foreground">{s.email}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => approveSponsor(s.id)}
                        className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => declineSponsor(s.id)}
                        className="px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-muted-foreground">
                    <div>Experience: {s.yearsOfExperience || 0} years</div>
                    {s.qualifications && s.qualifications.length > 0 && (
                      <div className="mt-2">
                        <div className="font-medium text-foreground">Qualifications:</div>
                        <ul className="list-disc ml-5 mt-1 space-y-0.5">
                          {s.qualifications.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(s as any).sponsorMotivation && (
                      <div className="mt-3">
                        <div className="font-medium text-foreground">Motivation:</div>
                        <p className="mt-1 text-foreground/90 whitespace-pre-wrap">
                          {(s as any).sponsorMotivation}
                        </p>
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
