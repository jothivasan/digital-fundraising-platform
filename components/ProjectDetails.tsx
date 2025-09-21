

import React, { useState } from 'react';
import type { Project } from '../types';
import ProgressBar from './common/ProgressBar';
import Button from './common/Button';
import Input from './common/Input';
import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, UserGroupIcon } from './common/Icons';
import Modal from './common/Modal';
import type { User } from '@supabase/supabase-js';


interface ProjectDetailsProps {
    project: Project;
    user: User | null;
    onInvest: (projectId: string, amount: number) => void;
    onBack: () => void;
    onLoginRequest: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, user, onInvest, onBack, onLoginRequest }) => {
    const [investmentAmount, setInvestmentAmount] = useState('');
    const [pledgeError, setPledgeError] = useState<string | null>(null);
    const [isPledgeSuccessModalOpen, setIsPledgeSuccessModalOpen] = useState(false);
    
    const fundedPercentage = (project.current_funding / project.funding_goal) * 100;
    const remainingAmount = project.funding_goal - project.current_funding;
    const isFullyFunded = remainingAmount <= 0;
    const isCreator = user && user.id === project.creator_id;


    const daysLeft = () => {
        const deadlineDate = new Date(project.deadline);
        const now = new Date();
        const diffTime = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const handleInvest = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFullyFunded) return;
        
        setPledgeError(null);
        const amount = parseInt(investmentAmount, 10);

        if (isNaN(amount) || amount <= 0) {
            setPledgeError("Please enter a valid pledge amount.");
            return;
        }

        if (amount > remainingAmount) {
            setPledgeError(`Your pledge cannot exceed the remaining amount of ₹${remainingAmount.toLocaleString()}.`);
            return;
        }

        onInvest(project.id, amount);
        setInvestmentAmount('');
        setIsPledgeSuccessModalOpen(true);
    };
    
    const creatorName = project.profiles?.name || 'Anonymous Creator';
    const creatorAvatar = project.profiles?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${creatorName}`;

    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={onBack} className="flex items-center text-primary mb-6 font-medium hover:underline">
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Projects
            </button>
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    <div className="lg:col-span-3">
                        <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="lg:col-span-2 p-8 flex flex-col">
                        <span className="text-sm font-semibold text-secondary uppercase">{project.category}</span>
                        <h1 className="text-3xl font-bold text-neutral-dark mt-2">{project.title}</h1>
                        <p className="text-neutral mt-2">{project.tagline}</p>

                        <div className="flex items-center my-4">
                            <img src={creatorAvatar} alt={creatorName} className="h-10 w-10 rounded-full" />
                            <p className="ml-3 text-neutral">By <span className="font-semibold text-neutral-dark">{creatorName}</span></p>
                        </div>
                        
                        <div className="my-4 space-y-4">
                            <ProgressBar percentage={fundedPercentage} height="h-3" />
                            <div>
                                <p className="text-3xl font-bold text-primary">₹{project.current_funding.toLocaleString()}</p>
                                <p className="text-neutral text-sm">pledged of ₹{project.funding_goal.toLocaleString()} goal</p>
                            </div>
                            <div className="flex justify-between text-neutral-dark font-medium">
                                <div className="flex items-center"><UserGroupIcon className="w-5 h-5 mr-2 text-neutral" /> {project.investments.length} backers</div>
                                <div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-2 text-neutral" /> {daysLeft()} days to go</div>
                            </div>
                            {isFullyFunded && (
                                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mt-4" role="alert">
                                    <p className="font-bold">🎉 Fully Funded!</p>
                                    <p>This project has reached its funding goal. Thank you to all the backers!</p>
                                </div>
                            )}
                        </div>

                        {isCreator ? (
                            <div className="mt-auto space-y-4 text-center bg-blue-50 border-l-4 border-primary text-blue-800 p-6 rounded-lg">
                                <h3 className="font-semibold text-lg">This is your project!</h3>
                                <p className="text-sm">You cannot invest in your own project. You can monitor its progress from your profile page.</p>
                            </div>
                        ) : user ? (
                            !isFullyFunded ? (
                                <form onSubmit={handleInvest} className="mt-auto space-y-4">
                                    <h3 className="font-semibold text-lg">Back this project</h3>
                                    <div>
                                        <label htmlFor="investmentAmount" className="sr-only">Pledge amount</label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                                            <Input
                                                id="investmentAmount"
                                                type="number" 
                                                placeholder={`Pledge amount`}
                                                min="1"
                                                max={remainingAmount.toString()}
                                                value={investmentAmount}
                                                onChange={(e) => {
                                                    setInvestmentAmount(e.target.value);
                                                    setPledgeError(null);
                                                }}
                                                className="pl-7"
                                                aria-describedby="pledge-error"
                                            />
                                        </div>
                                        {pledgeError && <p id="pledge-error" className="text-sm text-red-600 mt-2">{pledgeError}</p>}
                                    </div>
                                    <Button type="submit" className="w-full" disabled={!investmentAmount || parseInt(investmentAmount, 10) <= 0}>
                                        Pledge {investmentAmount && parseInt(investmentAmount, 10) > 0 ? `₹${parseInt(investmentAmount, 10).toLocaleString()}` : ''}
                                    </Button>
                                    <p className="text-xs text-gray-500 text-center">Your card will be charged when the project is successfully funded. KYC checks may be required.</p>
                                </form>
                            ) : null
                        ) : (
                            <div className="mt-auto space-y-4 text-center bg-gray-100 p-6 rounded-lg">
                                <h3 className="font-semibold text-lg">Join the community!</h3>
                                <p className="text-neutral text-sm">Log in or sign up to back this project and bring it to life.</p>
                                <Button onClick={onLoginRequest} className="w-full mt-4">
                                    Log In or Sign Up
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-neutral-dark mb-4">About this project</h2>
                    <p className="text-neutral leading-relaxed whitespace-pre-wrap">{project.description}</p>
                </div>
            </div>

            <Modal isOpen={isPledgeSuccessModalOpen} onClose={() => setIsPledgeSuccessModalOpen(false)}>
                <div className="text-center">
                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 id="modal-title" className="text-2xl font-bold text-neutral-dark mb-2">
                        Pledge Successful!
                    </h2>
                    <p className="text-neutral">
                        Thank you for pledging. Your support helps bring creative ideas to life.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => setIsPledgeSuccessModalOpen(false)}>
                            Done
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectDetails;