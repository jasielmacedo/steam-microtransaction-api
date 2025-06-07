import React, { useState, useEffect } from "react";
import {
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetTeamMembersQuery,
  useInviteTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useRemoveTeamMemberMutation,
} from "../api/apiSlice";
import {
  Mail,
  User,
  Key,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { TeamMember, TeamMemberInvite } from "../types/settings";

const Profile: React.FC = () => {
  // RTK Query hooks
  const { data: currentUser, isLoading, error } = useGetCurrentUserQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] =
    useUpdatePasswordMutation();
  const { data: teamMembers = [], isLoading: isLoadingTeam } =
    useGetTeamMembersQuery();
  const [inviteMember] = useInviteTeamMemberMutation();
  const [updateTeamMember] = useUpdateTeamMemberMutation();
  const [removeMember] = useRemoveTeamMemberMutation();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error2, setError] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<TeamMember["role"]>("viewer");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Invite form state
  const [inviteForm, setInviteForm] = useState<TeamMemberInvite>({
    email: "",
    role: "viewer",
  });

  // Update profile form when user data changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      // Update profile info if changed
      if (
        profileForm.name !== currentUser?.name ||
        profileForm.email !== currentUser?.email
      ) {
        await updateProfile({
          name: profileForm.name,
          email: profileForm.email,
        });
        setSuccessMessage("Profile updated successfully");
      }

      // Update password if provided
      if (profileForm.currentPassword && profileForm.newPassword) {
        const result = await updatePassword({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword,
        }).unwrap();

        if (result.success) {
          setSuccessMessage("Password updated successfully");
          // Clear password fields
          setProfileForm({
            ...profileForm,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      }

      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await inviteMember(inviteForm).unwrap();
      setSuccessMessage("Team member invited successfully");
      setInviteForm({ email: "", role: "viewer" });
      setShowInviteForm(false);
    } catch (err) {
      console.error("Error inviting team member:", err);
      setError(
        err instanceof Error ? err.message : "Failed to invite team member",
      );
    }
  };

  const handleRemoveMember = async (id: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      try {
        await removeMember(id).unwrap();
        setSuccessMessage("Team member removed successfully");
      } catch (err) {
        console.error("Error removing team member:", err);
        setError(
          err instanceof Error ? err.message : "Failed to remove team member",
        );
      }
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMemberId(member.id);
    setEditRole(member.role);
  };

  const handleCancelEdit = () => {
    setEditingMemberId(null);
  };

  const handleSaveMember = async (id: string) => {
    try {
      await updateTeamMember({ id, role: editRole }).unwrap();
      setSuccessMessage("Team member updated successfully");
      setEditingMemberId(null);
    } catch (err) {
      console.error("Error updating team member:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update team member",
      );
    }
  };

  if (isLoading || isLoadingTeam) {
    return <div className="text-center py-10">Loading profile data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <h3 className="font-bold">Error loading profile</h3>
        <p>{error.toString()}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Profile & Settings</h2>
        <p className="text-gray-500 mt-1">
          Manage your profile and API settings
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md flex items-center">
          <Check size={18} className="mr-2 flex-shrink-0" />
          <span>{successMessage}</span>
          <button
            className="ml-auto text-green-700"
            onClick={() => setSuccessMessage(null)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error2 && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          <span>{error2}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Profile Information
          </h3>
          <Button
            variant={isEditing ? "outline" : "primary"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Input
                label="Name"
                name="name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                disabled={!isEditing}
                icon={<User size={18} className="text-gray-500" />}
              />
            </div>

            <div>
              <Input
                label="Email"
                type="email"
                name="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                disabled={!isEditing}
                icon={<Mail size={18} className="text-gray-500" />}
              />
            </div>

            <div>
              <Input
                label="Role"
                name="role"
                value={currentUser?.role || ""}
                disabled={true}
                icon={<User size={18} className="text-gray-500" />}
              />
            </div>

            {isEditing && (
              <>
                <div>
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={profileForm.currentPassword}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        currentPassword: e.target.value,
                      })
                    }
                    icon={<Key size={18} className="text-gray-500" />}
                  />
                </div>

                <div>
                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={profileForm.newPassword}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        newPassword: e.target.value,
                      })
                    }
                    icon={<Key size={18} className="text-gray-500" />}
                  />
                </div>

                <div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={profileForm.confirmPassword}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    icon={<Key size={18} className="text-gray-500" />}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Team Management Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setShowInviteForm(true)}
          >
            Invite Member
          </Button>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  placeholder="Enter team member's email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      role: e.target.value as TeamMember["role"],
                    })
                  }
                  className="w-full rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Send Invite
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Team Members List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Member
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingMemberId === member.id ? (
                      <select
                        value={editRole}
                        onChange={(e) =>
                          setEditRole(e.target.value as TeamMember["role"])
                        }
                        className="border-gray-300 rounded-md text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-900 capitalize">
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {member.status === "active" ? (
                        <Check size={14} className="mr-1" />
                      ) : (
                        <Mail size={14} className="mr-1" />
                      )}
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingMemberId === member.id ? (
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSaveMember(member.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          onClick={() => handleEditMember(member)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 size={16} />}
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;
