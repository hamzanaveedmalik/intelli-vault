"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Workspace = {
  id: string;
  name: string;
  retentionYears: number;
  legalHold: boolean;
  billingStatus: string;
};

export function WorkspaceSettingsForm({
  workspace,
}: {
  workspace: Workspace;
}) {
  const router = useRouter();
  const [retentionYears, setRetentionYears] = useState(workspace.retentionYears);
  const [legalHold, setLegalHold] = useState(workspace.legalHold);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          retentionYears,
          legalHold,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Workspace Information</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Workspace Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{workspace.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Billing Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {workspace.billingStatus === "PILOT" ? "Pilot" : workspace.billingStatus === "ACTIVE" ? "Active" : "Cancelled"}
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Retention & Legal Hold</h2>

        <div className="mt-6 space-y-6">
          <div>
            <label
              htmlFor="retentionYears"
              className="block text-sm font-medium text-gray-700"
            >
              Retention Years (Minimum 5)
            </label>
            <input
              id="retentionYears"
              type="number"
              min={5}
              max={10}
              value={retentionYears}
              onChange={(e) => setRetentionYears(parseInt(e.target.value, 10))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              SEC requires minimum 5 years retention. Default is 6 years.
            </p>
          </div>

          <div className="flex items-start">
            <input
              id="legalHold"
              type="checkbox"
              checked={legalHold}
              onChange={(e) => setLegalHold(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="legalHold"
              className="ml-2 block text-sm text-gray-700"
            >
              Legal Hold
            </label>
            <p className="ml-2 text-xs text-gray-500">
              When enabled, prevents deletion of workspace data
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">Settings updated successfully</p>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

