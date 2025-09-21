import React from 'react';
import type { Project } from '../types';
import { View } from '../types';
import Button from './common/Button';
import ProjectCard from './ProjectCard';
import { CreateIcon, FundIcon, LaunchIcon } from './common/Icons';

interface LandingPageProps {
    navigateTo: (view: View) => void;
    featuredProjects: Project[];
    onSelectProject: (projectId: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ navigateTo, featuredProjects, onSelectProject }) => {
    
    const handleScrollToProjects = () => {
        document.getElementById('featured-projects')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="text-neutral-dark">
            {/* Hero Section */}
            <section className="text-center py-20 bg-white rounded-lg shadow-md mb-16">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-dark mb-4">
                        Bring Your Creative Ideas to Life.
                    </h1>
                    <p className="text-lg md:text-xl text-neutral max-w-3xl mx-auto mb-8">
                        Digital Fundraising is the platform where innovators and backers connect to build the future. Discover, fund, and launch the next big thing.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Button onClick={() => navigateTo(View.SignUp)} className="text-lg px-8 py-3 w-full sm:w-auto">Get Started</Button>
                        <Button onClick={() => navigateTo(View.Home)} variant="secondary" className="text-lg px-8 py-3 w-full sm:w-auto">Explore Projects</Button>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-2">How Digital Fundraising Works</h2>
                    <p className="text-neutral mb-12 max-w-2xl mx-auto">Funding your project or backing an innovator is just a few steps away.</p>
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="flex flex-col items-center">
                            <div className="bg-primary-focus/20 rounded-full p-6 mb-4 inline-block">
                                <CreateIcon className="w-12 h-12 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">1. Create</h3>
                            <p className="text-neutral">Creators submit their projects with a clear vision, funding goal, and timeline.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-accent/20 rounded-full p-6 mb-4 inline-block">
                                <FundIcon className="w-12 h-12 text-accent" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">2. Fund</h3>
                            <p className="text-neutral">Backers browse projects and pledge money to the ones that inspire them.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-secondary/20 rounded-full p-6 mb-4 inline-block">
                                <LaunchIcon className="w-12 h-12 text-secondary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">3. Launch</h3>
                            <p className="text-neutral">Once funded, creators bring their ideas to life and share their journey with backers.</p>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Featured Projects Section */}
            <section id="featured-projects" className="py-16 bg-white rounded-lg shadow-md">
                 <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Featured Projects</h2>
                        <p className="text-neutral mt-2">Get inspired by some of the innovative projects on our platform.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {featuredProjects.map(project => (
                           <ProjectCard key={project.id} project={project} onSelectProject={onSelectProject} />
                       ))}
                    </div>
                    <div className="text-center mt-12">
                        <Button onClick={() => navigateTo(View.Home)} variant="primary" className="text-lg px-8 py-3">
                            Discover More Projects
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;