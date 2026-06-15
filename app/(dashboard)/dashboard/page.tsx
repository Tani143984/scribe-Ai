"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  chartData: { date: string; requests: number }[];
  usageSummary: { used: number; limit: number; plan: string };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workspaces/me")
      .then((r) => r.json())
      .then((workspace) => {
        if (!workspace.workspaceId) {
          setLoading(false);
          return;
        }
        return fetch(`/api/dashboard/usage?workspaceId=${workspace.workspaceId}`)
          .then((r) => r.json())
          .then((d) => {
            setData(d);
            setLoading(false);
          });
      })
      .catch(() => setLoading(false));
  }, []);

  const usagePercent = data
    ? Math.round((data.usageSummary.used / data.usageSummary.limit) * 100)
    : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Good morning, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s your workspace overview
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="AI credits used"
          value={loading ? "—" : String(data?.usageSummary.used ?? 0)}
          sub={`of ${data?.usageSummary.limit ?? 50} this month`}
          color="blue"
        />
        <StatCard
          label="Current plan"
          value={loading ? "—" : data?.usageSummary.plan || "FREE"}
          sub="Upgrade for more credits"
          color="purple"
        />
        <StatCard
          label="This week"
          value={loading ? "—" : String(data?.chartData.reduce((sum, d) => sum + d.requests, 0) ?? 0)}
          sub="AI requests"
          color="green"
        />
      </div>

      {data && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">
              Monthly usage
            </span>
            <span className="text-sm text-gray-500">
              {data.usageSummary.used} / {data.usageSummary.limit} credits
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                usagePercent > 80 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          {usagePercent > 80 && (
            <p className="text-xs text-red-600 mt-2">
              Running low!{" "}
              <a href="/billing" className="underline font-medium">
                Upgrade your plan
              </a>
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-medium text-gray-900 mb-6">
          AI requests — last 7 days
        </h2>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "blue" | "purple" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    green: "bg-green-50 text-green-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="text-xs text-gray-500 mb-2">{label}</div>
      <div className={`text-2xl font-semibold ${colors[color].split(" ")[1]}`}>
        {value}
      </div>
      <div className="text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}
