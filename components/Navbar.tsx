import React, { useState } from 'react';
import { View } from '../types';
import { useAuth } from '../context/AuthContext';
import { LogoIcon, MenuIcon, XIcon, UserCircleIcon, PlusCircleIcon, HomeIcon, ShieldCheckIcon } from './common/Icons';

interface NavbarProps {
    navigateTo: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ navigateTo }) => {
    const { user, profile, isAdmin, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setIsProfileMenuOpen(false);
        navigateTo(View.Landing);
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigateTo(user ? View.Home : View.Landing)}>
                        <LogoIcon className="h-8 w-8 text-primary" />
                        <span className="text-xl font-bold text-primary">Digital Fundraising</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.Home); }} className="text-neutral hover:text-primary transition-colors">Discover</a>
                        {user && <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.CreateProject); }} className="text-neutral hover:text-primary transition-colors">Start a Project</a>}
                    </nav>

                    {/* Auth Buttons / Profile Dropdown */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            profile ? (
                                <div className="relative">
                                    <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center space-x-2 focus:outline-none">
                                        <img src={profile.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`} alt={profile.name} className="h-9 w-9 rounded-full object-cover" />
                                        <span className="font-medium text-neutral-dark">{profile.name}</span>
                                    </button>
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                                            <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.Profile); setIsProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</a>
                                            {isAdmin && (
                                                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.UserManagement); setIsProfileMenuOpen(false); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                                                    User Management
                                                </a>
                                            )}
                                            <div className="border-t my-1"></div>
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 animate-pulse">
                                    <div className="h-9 w-9 rounded-full bg-gray-200"></div>
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                </div>
                            )
                        ) : (
                            <>
                                <button onClick={() => navigateTo(View.Login)} className="text-primary font-medium hover:underline">Log In</button>
                                <button onClick={() => navigateTo(View.SignUp)} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition-colors">Sign Up</button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    <nav className="flex flex-col p-4 space-y-4">
                        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.Home); setIsMenuOpen(false);}} className="text-neutral hover:text-primary flex items-center space-x-2"><HomeIcon className="w-5 h-5"/><span>Discover</span></a>
                        {user && <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.CreateProject); setIsMenuOpen(false); }} className="text-neutral hover:text-primary flex items-center space-x-2"><PlusCircleIcon className="w-5 h-5"/><span>Start a Project</span></a>}
                        <hr/>
                        {user && profile ? (
                            <>
                                <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.Profile); setIsMenuOpen(false); }} className="text-neutral hover:text-primary flex items-center space-x-2"><UserCircleIcon className="w-5 h-5"/><span>My Profile</span></a>
                                {isAdmin && (
                                    <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(View.UserManagement); setIsMenuOpen(false); }} className="text-neutral hover:text-primary flex items-center space-x-2"><ShieldCheckIcon className="w-5 h-5"/><span>User Management</span></a>
                                )}
                                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md w-full text-left">Sign Out</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { navigateTo(View.Login); setIsMenuOpen(false); }} className="text-primary font-medium text-left">Log In</button>
                                <button onClick={() => { navigateTo(View.SignUp); setIsMenuOpen(false); }} className="bg-primary text-white px-4 py-2 rounded-md text-left">Sign Up</button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Navbar;
