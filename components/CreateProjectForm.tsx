import React, { useState, useEffect } from "react";
import type { Project } from "../types";
import Button from "./common/Button";
import Input from "./common/Input";
import { SparklesIcon, XIcon, CalendarIcon } from "./common/Icons";
import { supabase } from "../lib/supabaseClient";

type NewProjectData = Omit<
  Project,
  | "id"
  | "creator_id"
  | "current_funding"
  | "investors"
  | "profiles"
  | "investments"
  | "created_at"
  | "updated_at"
>;

interface CreateProjectFormProps {
  onSubmit: (newProject: NewProjectData) => void;
  onCancel: () => void;
  existingProject?: Project | null; // For edit mode
  isEditing?: boolean;
}

const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onSubmit,
  onCancel,
  existingProject = null,
  isEditing = false,
}) => {
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [fundingGoal, setFundingGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize form with existing project data if editing
  useEffect(() => {
    if (isEditing && existingProject) {
      setTitle(existingProject.title);
      setTagline(existingProject.tagline);
      setDescription(existingProject.description);
      setCategory(existingProject.category);
      setFundingGoal(existingProject.funding_goal.toString());

      // Format deadline for date input
      const deadlineDate = new Date(existingProject.deadline);
      const formattedDeadline = deadlineDate.toISOString().split("T")[0];
      setDeadline(formattedDeadline);

      // Set existing image as preview
      setImagePreview(existingProject.image_url);
    }
  }, [isEditing, existingProject]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from("project-images")
        .upload(fileName, file);

      if (error) {
        console.error("Supabase storage error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("project-images").getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error("Upload error:", error);
      // If storage upload fails, fall back to a placeholder image
      // You could also implement a different upload service here
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tagline || !description || !fundingGoal || !deadline) {
      alert("Please fill out all fields.");
      return;
    }

    let imageUrl =
      isEditing && existingProject
        ? existingProject.image_url
        : `https://picsum.photos/seed/${title.replace(/\s/g, "")}/800/600`;

    // Upload image if one is selected
    if (imageFile) {
      setIsUploading(true);
      setUploadError(null);
      try {
        imageUrl = await uploadImageToSupabase(imageFile);
      } catch (error: any) {
        console.error("Image upload failed:", error);
        setUploadError(
          `Image upload failed: ${error.message}. Using ${
            isEditing ? "existing" : "default"
          } image instead.`
        );
        // Continue with existing/default image instead of stopping the form submission
      }
      setIsUploading(false);
    }

    const projectData = {
      title,
      tagline,
      description,
      category,
      image_url: imageUrl,
      funding_goal: parseInt(fundingGoal, 10),
      deadline: new Date(deadline).toISOString(),
    };

    if (isEditing && existingProject) {
      // For editing, include the project ID
      onSubmit({ ...projectData, id: existingProject.id } as any);
    } else {
      // For creating new project
      onSubmit(projectData);
    }
  };

  const inputStyles =
    "mt-1 block w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-neutral-dark placeholder-gray-400 shadow-sm transition focus:border-primary-focus focus:outline-none focus:ring-1 focus:ring-primary-focus sm:text-sm";

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-neutral-dark flex items-center">
          <SparklesIcon className="w-8 h-8 mr-3 text-primary" />
          {isEditing ? "Edit Project" : "Launch your Idea"}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Project Title
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Solar-Powered Water Purifier"
            required
          />
        </div>

        <div>
          <label
            htmlFor="tagline"
            className="block text-sm font-medium text-gray-700"
          >
            Tagline
          </label>
          <Input
            id="tagline"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A short, catchy phrase"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputStyles} pr-10`}
          >
            <option>Technology</option>
            <option>Arts</option>
            <option>Education</option>
            <option>Environment</option>
            <option>Community</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={inputStyles}
            placeholder="Tell us more about your project..."
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Image
          </label>
          <div className="space-y-4">
            {uploadError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {uploadError}
              </div>
            )}

            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">
                        Click to change image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, JPEG up to 5MB
                    </p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            </div>

            {imageFile && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium">Selected file:</p>
                <p>
                  {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="fundingGoal"
              className="block text-sm font-medium text-gray-700"
            >
              Funding Goal (₹)
            </label>
            <Input
              id="fundingGoal"
              type="number"
              min="1"
              value={fundingGoal}
              onChange={(e) => setFundingGoal(e.target.value)}
              placeholder="5000000"
              required
            />
          </div>
          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700"
            >
              Deadline
            </label>
            <div className="relative">
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="pr-10"
              />
              <label
                htmlFor="deadline"
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              >
                {/* <CalendarIcon className="h-5 w-5 text-gray-400" /> */}
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading
              ? "Uploading Image..."
              : isEditing
              ? "Update Project"
              : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectForm;
