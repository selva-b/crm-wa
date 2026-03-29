"use client";

import type {
  SlaPerformanceResponse,
  SlaBreachByUser,
  SlaAvgResponseByUser,
} from "@/lib/types/sla";

function formatMs(ms: number): string {
  if (ms < 1000) return "<1s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSec = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSec}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  return `${hours}h ${remainingMin}m`;
}

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
}

interface SlaTeamTableProps {
  performance: SlaPerformanceResponse;
  users: UserInfo[];
}

export function SlaTeamTable({ performance, users }: SlaTeamTableProps) {
  const { breachByUser, avgResponseByUser } = performance;

  const breachMap = new Map<string, number>(
    breachByUser.map((b: SlaBreachByUser) => [b.assignedUserId, b.count]),
  );
  const responseMap = new Map<string, SlaAvgResponseByUser>(
    avgResponseByUser.map((r: SlaAvgResponseByUser) => [r.assignedUserId, r]),
  );

  const userMap = new Map(users.map((u) => [u.id, u]));

  // Combine data for all users who appear in either dataset
  const allUserIds = new Set([
    ...breachByUser.map((b: SlaBreachByUser) => b.assignedUserId),
    ...avgResponseByUser.map((r: SlaAvgResponseByUser) => r.assignedUserId),
  ]);

  const rows = Array.from(allUserIds)
    .map((userId) => {
      const user = userMap.get(userId);
      return {
        userId,
        name: user ? `${user.firstName} ${user.lastName}` : userId.slice(0, 8),
        breaches: breachMap.get(userId) ?? 0,
        avgMs: responseMap.get(userId)?.avgMs ?? 0,
        conversations: responseMap.get(userId)?.count ?? 0,
      };
    })
    .sort((a, b) => b.breaches - a.breaches);

  return (
    <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-5">
      <h3 className="text-[13px] font-medium text-on-surface-variant mb-4">
        Team SLA Performance
      </h3>

      {rows.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-on-surface-variant/40">
          No team performance data available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="text-left py-2 pr-4 text-on-surface-variant/60 font-medium">
                  Name
                </th>
                <th className="text-right py-2 px-3 text-on-surface-variant/60 font-medium">
                  Avg Response
                </th>
                <th className="text-right py-2 px-3 text-on-surface-variant/60 font-medium">
                  Conversations
                </th>
                <th className="text-right py-2 px-3 text-on-surface-variant/60 font-medium">
                  Breaches
                </th>
                <th className="text-right py-2 pl-3 text-on-surface-variant/60 font-medium">
                  Compliance
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const complianceRate =
                  row.conversations > 0
                    ? (
                        ((row.conversations - row.breaches) /
                          row.conversations) *
                        100
                      ).toFixed(1)
                    : "100.0";
                const complianceNum = parseFloat(complianceRate);

                return (
                  <tr
                    key={row.userId}
                    className="border-b border-outline-variant/5 hover:bg-surface-container/30"
                  >
                    <td className="py-2.5 pr-4 text-on-surface font-medium">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-on-surface-variant">
                      {row.avgMs > 0 ? formatMs(row.avgMs) : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-on-surface">
                      {row.conversations}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span
                        className={
                          row.breaches === 0 ? "text-success" : "text-error"
                        }
                      >
                        {row.breaches}
                      </span>
                    </td>
                    <td className="py-2.5 pl-3 text-right tabular-nums">
                      <span
                        className={
                          complianceNum >= 90
                            ? "text-success"
                            : complianceNum >= 70
                              ? "text-warning"
                              : "text-error"
                        }
                      >
                        {complianceRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
