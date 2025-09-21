import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { LogoIcon, LockIcon } from './common/Icons';
import { supabase } from '../lib/supabaseClient';

interface ResetPasswordProps {
    navigateToLogin: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ navigateToLogin }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            // When the user follows the link from the email, Supabase sets up a session
            // that allows this updateUser call to succeed.
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            setMessage("Your password has been updated successfully! You can now log in.");
        } catch (error: any) {
            console.error("Password reset failed:", error);
            setError(error.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-blue-800 to-neutral-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <LogoIcon className="h-12 w-12 text-white mx-auto" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        Set a New Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-300">
                        Enter a new secure password for your account.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
                    {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
                    {message && <p className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
                    
                    {!message ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="password-reset" className="block text-sm font-medium text-gray-700">New Password</label>
                                <div className="relative">
                                    <Input id="password-reset" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Must be at least 6 characters" className="pl-10" />
                                     <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon className="h-5 w-5 text-gray-400" />
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="confirm-password-reset" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <Input id="confirm-password-reset" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    ) : null}

                     <p className="mt-8 text-center text-sm text-gray-600">
                        <button onClick={navigateToLogin} className="font-medium text-primary hover:text-primary-hover">
                            Back to Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;