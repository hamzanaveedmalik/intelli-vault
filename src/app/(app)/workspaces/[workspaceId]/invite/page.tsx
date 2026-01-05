"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function InviteUserPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"OWNER_CCO" | "MEMBER">("MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send invitation");
      }

      setSuccess(true);
      setEmail("");
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invite User</h2>
          <p className="mt-2 text-sm text-gray-600">
            Send an invitation to join your workspace
          </p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">
              Invitation sent successfully! Redirecting...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as "OWNER_CCO" | "MEMBER")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="MEMBER">Member</option>
              <option value="OWNER_CCO">Owner/CCO</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Members can view and edit meetings. Owners/CCOs can finalize records and manage workspace settings.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


