// FIX: Corrected the import syntax for useState and useEffect.
import React, { useState, useEffect } from "react";
import type { Project, Profile } from "./types";
import { View } from "./types";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProjectList from "./components/ProjectList";
import ProjectDetails from "./components/ProjectDetails";
import CreateProjectForm from "./components/CreateProjectForm";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import LandingPage from "./components/LandingPage";
import UserManagement from "./components/UserManagement";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { supabase } from "./lib/supabaseClient";

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Landing);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { user, profile, isAdmin, loading: authLoading } = useAuth();

  const navigateTo = (view: View) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
                    *,
                    profiles ( id, name, avatar_url ),
                    investments ( user_id )
                `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // This effect handles Supabase's password recovery flow.
    // When a user clicks the link in their email, they are redirected here
    // with a URL hash containing `type=recovery`.
    if (window.location.hash.includes("type=recovery")) {
      navigateTo(View.ResetPassword);
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (
        currentView === View.Landing ||
        currentView === View.Login ||
        currentView === View.SignUp ||
        currentView === View.ForgotPassword ||
        currentView === View.ResetPassword
      ) {
        navigateTo(View.Home);
      }
    } else {
      // Do not redirect if auth is still loading
      if (
        !authLoading &&
        (currentView === View.CreateProject ||
          currentView === View.Profile ||
          currentView === View.UserManagement)
      ) {
        navigateTo(View.Login);
      }
    }
  }, [user, currentView, authLoading]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    navigateTo(View.ProjectDetails);
  };

  const handleCreateProject = async (
    newProjectData: Omit<
      Project,
      | "id"
      | "creator_id"
      | "current_funding"
      | "investors"
      | "profiles"
      | "investments"
      | "created_at"
      | "updated_at"
    >
  ) => {
    if (!user) {
      alert("You must be logged in to create a project.");
      return;
    }
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([{ ...newProjectData, creator_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Refetch projects to show the new one
      await fetchProjects();
      navigateTo(View.Home);
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project.");
    }
  };

  const handleInvest = async (projectId: string, amount: number) => {
    if (!user) {
      alert("You must be logged in to invest.");
      return;
    }
    try {
      // The previous client-side update was likely failing due to database permissions (Row-Level Security).
      // The correct and more secure approach is to use a Supabase RPC (database function)
      // that handles the logic on the backend atomically.
      const { error } = await supabase.rpc("handle_investment", {
        project_id_arg: projectId,
        amount_arg: amount,
      });

      if (error) throw error;

      // The database is now updated correctly via the RPC.
      // Update the local state for immediate UI feedback.
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id === projectId) {
            // The 'investments' array from our fetch query only contains user_id.
            // We mimic that structure here for UI consistency.
            const newInvestments = [...p.investments, { user_id: user.id }];
            return {
              ...p,
              current_funding: p.current_funding + amount,
              investments: newInvestments,
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      console.error("Error investing in project:", err);
      alert(
        `Investment failed: ${err.message}. Please ensure the 'handle_investment' function exists in your Supabase project.`
      );
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    navigateTo(View.CreateProject);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) {
      alert("You must be logged in to delete a project.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)
        .eq("creator_id", user.id); // Ensure only the creator can delete

      if (error) throw error;

      // Remove project from local state
      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      // If we're viewing the deleted project, go back to home
      if (selectedProjectId === projectId) {
        navigateTo(View.Home);
      }
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  const handleUpdateProject = async (updatedProjectData: any) => {
    if (!user || !editingProject) {
      alert("You must be logged in to update a project.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .update({
          title: updatedProjectData.title,
          tagline: updatedProjectData.tagline,
          description: updatedProjectData.description,
          category: updatedProjectData.category,
          image_url: updatedProjectData.image_url,
          funding_goal: updatedProjectData.funding_goal,
          deadline: updatedProjectData.deadline,
        })
        .eq("id", editingProject.id)
        .eq("creator_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Update project in local state
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? { ...p, ...data } : p))
      );

      setEditingProject(null);
      navigateTo(View.Home);
    } catch (err: any) {
      console.error("Error updating project:", err);
      alert(`Failed to update project: ${err.message}`);
    }
  };

  const handleProjectFormSubmit = (projectData: any) => {
    if (editingProject) {
      handleUpdateProject(projectData);
    } else {
      handleCreateProject(projectData);
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    navigateTo(View.Home);
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="flex justify-center items-center py-40">
          <div className="text-center">
            <svg
              className="animate-spin h-10 w-10 text-primary mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-lg text-neutral">Authenticating...</p>
          </div>
        </div>
      );
    }

    if (loadingProjects && projects.length === 0) {
      return <div className="text-center py-20">Loading projects...</div>;
    }
    if (error) {
      return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    switch (currentView) {
      case View.Landing:
        const featuredProjects = projects.slice(0, 3);
        return (
          <LandingPage
            navigateTo={navigateTo}
            featuredProjects={featuredProjects}
            onSelectProject={handleSelectProject}
          />
        );
      case View.ProjectDetails:
        const project = projects.find((p) => p.id === selectedProjectId);
        return project ? (
          <ProjectDetails
            project={project}
            user={user}
            onInvest={handleInvest}
            onBack={() => navigateTo(View.Home)}
            onLoginRequest={() => navigateTo(View.Login)}
          />
        ) : (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            user={user}
          />
        );
      case View.CreateProject:
        if (!user) return null;
        return (
          <CreateProjectForm
            onSubmit={handleProjectFormSubmit}
            onCancel={handleCancelEdit}
            existingProject={editingProject}
            isEditing={!!editingProject}
          />
        );
      case View.Profile:
        if (!profile) return null;
        const userProjects = projects.filter(
          (p) => p.creator_id === profile.id
        );
        const userInvestments = projects.filter((p) =>
          p.investments.some((inv) => inv.user_id === profile.id)
        );
        return (
          <UserProfile
            profile={profile}
            createdProjects={userProjects}
            investedProjects={userInvestments}
            onSelectProject={handleSelectProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        );
      case View.UserManagement:
        if (!isAdmin) {
          return (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
              <p className="mt-2 text-neutral">
                You must be an administrator to view this page.
              </p>
            </div>
          );
        }
        return <UserManagement />;
      case View.Login:
        return (
          <Login
            navigateToSignUp={() => navigateTo(View.SignUp)}
            navigateToForgotPassword={() => navigateTo(View.ForgotPassword)}
          />
        );
      case View.SignUp:
        return <SignUp navigateToLogin={() => navigateTo(View.Login)} />;
      case View.ForgotPassword:
        return (
          <ForgotPassword navigateToLogin={() => navigateTo(View.Login)} />
        );
      case View.ResetPassword:
        return <ResetPassword navigateToLogin={() => navigateTo(View.Login)} />;
      case View.Home:
      default:
        return (
          <ProjectList
            projects={projects}
            onSelectProject={handleSelectProject}
            user={user}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-neutral-dark flex flex-col">
      <Navbar navigateTo={navigateTo} />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderContent()}
      </main>
      <footer className="bg-neutral-dark text-white text-center p-4">
        <p>&copy; 2024 Digital Fundraising. All rights reserved.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
