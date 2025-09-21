import React, { useState } from "react";
import type { Profile, Project } from "../types";
import ProjectCard from "./ProjectCard";
import { useAuth } from "../context/AuthContext";
import Button from "./common/Button";
import Input from "./common/Input";
import Modal from "./common/Modal";

interface UserProfileProps {
  profile: Profile;
  createdProjects: Project[];
  investedProjects: Project[];
  onSelectProject: (projectId: string) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}
const UserProfile: React.FC<UserProfileProps> = ({
  profile,
  createdProjects,
  investedProjects,
  onSelectProject,
  onEditProject,
  onDeleteProject,
}) => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newName, setNewName] = useState(profile.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const userAvatar =
    profile.avatar_url ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`;

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await updateProfile({ name: newName.trim() });
      setSuccess("Name updated successfully!");
      setIsEditingName(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update name");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Additional password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      );
      return;
    }

    setLoading(true);
    try {
      await changePassword(newPassword);
      setSuccess("Password changed successfully!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentUser = user?.id === profile.id;

  // Component for project cards with edit/delete actions
  const ProjectCardWithActions: React.FC<{
    project: Project;
    isOwned: boolean;
  }> = ({ project, isOwned }) => {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 flex flex-col">
        <div className="relative">
          <img
            className="w-full h-56 object-cover cursor-pointer"
            src={project.image_url}
            alt={project.title}
            onClick={() => onSelectProject(project.id)}
          />
          {isOwned && isCurrentUser && onEditProject && onDeleteProject && (
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProject(project);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                title="Edit Project"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors"
                title="Delete Project"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div
          className="p-6 flex flex-col flex-grow cursor-pointer"
          onClick={() => onSelectProject(project.id)}
        >
          <span className="text-sm font-semibold text-secondary uppercase tracking-wider">
            {project.category}
          </span>
          <h3 className="text-xl font-bold text-neutral-dark mt-2 mb-1">
            {project.title}
          </h3>
          <p className="text-neutral text-sm flex-grow">{project.tagline}</p>

          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    (project.current_funding / project.funding_goal) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 text-sm text-neutral">
            <div>
              <span className="font-bold text-lg text-primary">
                ₹{project.current_funding.toLocaleString()}
              </span>{" "}
              raised
            </div>
            <div>
              <span className="font-bold text-lg text-neutral-dark">
                {Math.max(
                  0,
                  Math.ceil(
                    (new Date(project.deadline).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                )}
              </span>{" "}
              days left
            </div>
          </div>

          <div className="border-t mt-4 pt-4 flex items-center">
            <img
              src={
                project.profiles?.avatar_url ||
                `https://api.dicebear.com/8.x/initials/svg?seed=${
                  project.profiles?.name || "Anonymous"
                }`
              }
              alt={project.profiles?.name || "Anonymous"}
              className="h-8 w-8 rounded-full object-cover"
            />
            <p className="ml-3 text-sm text-neutral">
              By{" "}
              <span className="font-medium text-neutral-dark">
                {project.profiles?.name || "Anonymous"}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const getPasswordStrengthLabel = (score: number) => {
    if (score < 2) return { label: "Weak", color: "text-red-500" };
    if (score < 4) return { label: "Fair", color: "text-yellow-500" };
    if (score < 5) return { label: "Good", color: "text-blue-500" };
    return { label: "Strong", color: "text-green-500" };
  };

  return (
    <div className="max-w-5xl mx-auto">
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
        <img
          src={userAvatar}
          alt={profile.name}
          className="h-32 w-32 rounded-full object-cover border-4 border-primary"
        />
        <div className="md:ml-8 mt-4 md:mt-0 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-neutral-dark">
              {profile.name}
            </h1>
            {isCurrentUser && (
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                  onClick={() => setIsEditingName(true)}
                >
                  Edit Name
                </Button>
                <Button
                  variant="secondary"
                  className="px-3 py-1 text-sm"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center md:justify-start space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {createdProjects.length}
              </p>
              <p className="text-sm text-neutral">Projects Created</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {investedProjects.length}
              </p>
              <p className="text-sm text-neutral">Projects Backed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-neutral-dark mb-6">
          My Created Projects
        </h2>
        {createdProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {createdProjects.map((p) => (
              <ProjectCardWithActions key={p.id} project={p} isOwned={true} />
            ))}
          </div>
        ) : (
          <p className="text-neutral bg-white p-6 rounded-lg shadow">
            You haven't created any projects yet.
          </p>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-neutral-dark mb-6">
          My Investments
        </h2>
        {investedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {investedProjects.map((p) => (
              <ProjectCardWithActions key={p.id} project={p} isOwned={false} />
            ))}
          </div>
        ) : (
          <p className="text-neutral bg-white p-6 rounded-lg shadow">
            You haven't invested in any projects yet.
          </p>
        )}
      </div>

      {/* Edit Name Modal */}
      <Modal isOpen={isEditingName} onClose={() => setIsEditingName(false)}>
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Edit Name
          </h3>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleNameUpdate}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditingName(false);
                  setNewName(profile.name);
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
      >
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Change Password
          </h3>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                {newPassword && (
                  <div className="mt-2">
                    <div
                      className={`text-sm ${
                        getPasswordStrengthLabel(
                          getPasswordStrength(newPassword)
                        ).color
                      }`}
                    >
                      Password strength:{" "}
                      {
                        getPasswordStrengthLabel(
                          getPasswordStrength(newPassword)
                        ).label
                      }
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Password should contain uppercase, lowercase, and numbers
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError(null);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
