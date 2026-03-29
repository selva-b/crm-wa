"use client";

import type { TeamPerformanceResponse } from "@/lib/types/analytics";

function formatMs(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return "<1s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSec = seconds % 60;
  return `${minutes}m ${remainingSec}s`;
}

interface TeamPerformanceTableProps {
  data: TeamPerformanceResponse;
}

export function TeamPerformanceTable({ data }: TeamPerformanceTableProps) {
  const sorted = [...data.users].sort((a, b) => b.messagesSent - a.messagesSent);

  return (
    <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/10 p-5">
      <h3 className="text-[13px] font-medium text-on-surface-variant mb-4">
        Team Performance
      </h3>

      {sorted.length === 0 ? (
        <div className="py-8 text-center text-[13px] text-on-surface-variant/40">
          No team data available
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
                  Sent
                </th>
                <th className="text-right py-2 px-3 text-on-surface-variant/60 font-medium">
                  Received
                </th>
                <th className="text-right py-2 px-3 text-on-surface-variant/60 font-medium">
                  Avg Response
                </th>
                <th className="text-right py-2 px-3 text-on-surface-variant/60 font-medium">
                  Converted
                </th>
                <th className="text-right py-2 pl-3 text-on-surface-variant/60 font-medium">
                  Active Convos
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((user) => (
                <tr
                  key={user.userId}
                  className="border-b border-outline-variant/5 hover:bg-surface-container/30"
                >
                  <td className="py-2.5 pr-4 text-on-surface font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-on-surface">
                    {user.messagesSent.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-on-surface-variant">
                    {user.messagesReceived.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-on-surface-variant">
                    {formatMs(user.avgResponseTimeMs)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-success">
                    {user.contactsConverted}
                  </td>
                  <td className="py-2.5 pl-3 text-right tabular-nums text-on-surface-variant">
                    {user.activeConversations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
