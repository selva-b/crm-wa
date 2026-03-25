"use client";

import { useState } from "react";
import { Plus, Trash2, UserPlus, UserMinus } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";
import {
  useTeams,
  useCreateTeam,
  useDeleteTeam,
  useAddTeamMember,
  useRemoveTeamMember,
} from "@/hooks/use-teams";
import { useUsers } from "@/hooks/use-users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import type { Team } from "@/lib/types/teams";

export default function AdminTeamsPage() {
  usePageTitle("Teams");
  const { data: teams, isLoading } = useTeams();
  const { data: usersData } = useUsers();
  const createTeam = useCreateTeam();
  const deleteTeam = useDeleteTeam();
  const addMember = useAddTeamMember();
  const removeMember = useRemoveTeamMember();

  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamManagerId, setNewTeamManagerId] = useState("");
  const [addingMemberTeamId, setAddingMemberTeamId] = useState<string | null>(null);
  const [newMemberUserId, setNewMemberUserId] = useState("");

  const users = usersData?.users ?? [];
  const managers = users.filter((u) => u.role === "MANAGER" || u.role === "ADMIN");

  const handleCreateTeam = () => {
    if (!newTeamName.trim() || !newTeamManagerId) return;
    createTeam.mutate(
      { name: newTeamName.trim(), managerId: newTeamManagerId },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewTeamName("");
          setNewTeamManagerId("");
        },
      },
    );
  };

  const handleAddMember = (teamId: string) => {
    if (!newMemberUserId) return;
    addMember.mutate(
      { teamId, data: { userId: newMemberUserId } },
      {
        onSuccess: () => {
          setAddingMemberTeamId(null);
          setNewMemberUserId("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
        <Spinner size="lg" className="text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-on-surface">Teams</h1>
          <p className="text-[13px] text-on-surface-variant mt-0.5">
            Create and manage teams for your organization
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} disabled={showCreate}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Team
        </Button>
      </div>

      {/* Create team form */}
      {showCreate && (
        <div className="rounded-xl border border-outline-variant/15 p-4 space-y-3 bg-surface-container/30">
          <h3 className="text-[14px] font-semibold text-on-surface">New Team</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="flex-1 rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <select
              value={newTeamManagerId}
              onChange={(e) => setNewTeamManagerId(e.target.value)}
              className="rounded-lg border border-outline-variant/20 bg-surface px-3 py-2 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select manager</option>
              {managers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreateTeam} disabled={createTeam.isPending}>
              Create
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Teams list */}
      {!teams || teams.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-16 w-16" />}
          title="No teams yet"
          description="Create your first team to organize your employees."
        />
      ) : (
        <div className="space-y-4">
          {(teams as Team[]).map((team) => (
            <div
              key={team.id}
              className="rounded-xl border border-outline-variant/15 overflow-hidden"
            >
              {/* Team header */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-container/30">
                <div className="flex items-center gap-3">
                  <h3 className="text-[15px] font-semibold text-on-surface">
                    {team.name}
                  </h3>
                  <Badge variant="info">
                    {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-on-surface-variant">
                    Manager: {team.manager.firstName} {team.manager.lastName}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAddingMemberTeamId(team.id)}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete team "${team.name}"?`)) {
                        deleteTeam.mutate(team.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Add member form */}
              {addingMemberTeamId === team.id && (
                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container/20 border-b border-outline-variant/10">
                  <select
                    value={newMemberUserId}
                    onChange={(e) => setNewMemberUserId(e.target.value)}
                    className="flex-1 rounded-lg border border-outline-variant/20 bg-surface px-3 py-1.5 text-[13px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select user to add</option>
                    {users
                      .filter(
                        (u) =>
                          !team.members.some((m) => m.user.id === u.id) &&
                          u.id !== team.managerId,
                      )
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} ({u.role})
                        </option>
                      ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => handleAddMember(team.id)}
                    disabled={addMember.isPending}
                  >
                    Add
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setAddingMemberTeamId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Members list */}
              {team.members.length > 0 && (
                <div className="divide-y divide-outline-variant/10">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between px-4 py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={`${member.user.firstName} ${member.user.lastName}`}
                          size="sm"
                        />
                        <div>
                          <p className="text-[13px] font-medium text-on-surface">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            {member.user.email}
                          </p>
                        </div>
                        <Badge variant="default">{member.user.role}</Badge>
                      </div>
                      <button
                        onClick={() =>
                          removeMember.mutate({
                            teamId: team.id,
                            userId: member.user.id,
                          })
                        }
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
