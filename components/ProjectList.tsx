

import React from 'react';
import type { Project } from '../types';
import ProjectCard from './ProjectCard';
import { SparklesIcon, UserCircleIcon } from './common/Icons';
import type { User } from '@supabase/supabase-js';

interface ProjectListProps {
    projects: Project[];
    onSelectProject: (projectId: string) => void;
    user: User | null;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelectProject, user }) => {
    // Empty state component for when no projects are found
    const EmptyState = ({ title, message }: { title: string, message: string }) => (
        <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md col-span-full">
            <SparklesIcon className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
    );
    
    // Logged-out View
    if (!user) {
        return (
            <div>
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-dark mb-2">Fueling Innovation, Together.</h1>
                    <p className="text-lg text-neutral max-w-2xl mx-auto">Discover and support groundbreaking projects from creators around the world.</p>
                </div>
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map(project => (
                            <ProjectCard key={project.id} project={project} onSelectProject={onSelectProject} />
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        title="No Projects Found"
                        message="Check back later for new and exciting ideas from the community!"
                    />
                )}
            </div>
        );
    }
    
    // Logged-in View
    const myProjects = projects.filter(p => p.creator_id === user.id);
    const otherProjects = projects.filter(p => p.creator_id !== user.id);

    return (
        <div>
            {/* My Projects Section */}
            <section className="mb-16">
                <div className="flex items-center mb-6 border-b pb-4">
                    <UserCircleIcon className="w-8 h-8 mr-3 text-primary" />
                    <h2 className="text-3xl font-bold text-neutral-dark">My Projects</h2>
                </div>
                {myProjects.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {myProjects.map(project => (
                            <ProjectCard key={project.id} project={project} onSelectProject={onSelectProject} />
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        title="You haven't created any projects yet."
                        message="Ready to launch your big idea? Start a new project today!"
                    />
                )}
            </section>
            
            {/* Other Projects Section */}
            <section>
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-dark mb-2">
                        Discover Other Projects
                    </h1>
                    <p className="text-lg text-neutral max-w-2xl mx-auto">Support groundbreaking projects from other creators in the community.</p>
                </div>
                {otherProjects.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {otherProjects.map(project => (
                            <ProjectCard key={project.id} project={project} onSelectProject={onSelectProject} />
                        ))}
                    </div>
                ) : (
                    <EmptyState 
                        title="No Other Projects Found"
                        message="It looks like all the available projects are yours. Great work!"
                    />
                )}
            </section>
        </div>
    );
};

export default ProjectList;