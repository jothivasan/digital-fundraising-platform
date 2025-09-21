import React from 'react';
import type { Project } from '../types';
import ProgressBar from './common/ProgressBar';

interface ProjectCardProps {
    project: Project;
    onSelectProject: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject }) => {
    const { id, title, tagline, image_url, category, profiles, current_funding, funding_goal } = project;
    const fundedPercentage = (current_funding / funding_goal) * 100;

    const daysLeft = () => {
        const deadlineDate = new Date(project.deadline);
        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };
    
    const creatorName = profiles?.name || 'Anonymous';
    const creatorAvatar = profiles?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${creatorName}`;

    return (
        <div 
            className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => onSelectProject(id)}
        >
            <img className="w-full h-56 object-cover" src={image_url} alt={title} />
            <div className="p-6 flex flex-col flex-grow">
                <span className="text-sm font-semibold text-secondary uppercase tracking-wider">{category}</span>
                <h3 className="text-xl font-bold text-neutral-dark mt-2 mb-1">{title}</h3>
                <p className="text-neutral text-sm flex-grow">{tagline}</p>
                
                <div className="mt-4">
                    <ProgressBar percentage={fundedPercentage} />
                </div>
                
                <div className="flex justify-between items-center mt-4 text-sm text-neutral">
                    <div>
                        <span className="font-bold text-lg text-primary">₹{current_funding.toLocaleString()}</span> raised
                    </div>
                    <div>
                        <span className="font-bold text-lg text-neutral-dark">{daysLeft()}</span> days left
                    </div>
                </div>
                
                <div className="border-t mt-4 pt-4 flex items-center">
                    <img src={creatorAvatar} alt={creatorName} className="h-8 w-8 rounded-full object-cover" />
                    <p className="ml-3 text-sm text-neutral">By <span className="font-medium text-neutral-dark">{creatorName}</span></p>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;