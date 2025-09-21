import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { LogoIcon, MailIcon } from './common/Icons';
import { supabase } from '../lib/supabaseClient';

interface ForgotPasswordProps {
    navigateToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigateToLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin, // Redirects to the app's base URL
            });
            if (error) throw error;
            setMessage("Password reset link sent! Please check your email inbox.");
        } catch (error: any) {
            console.error("Password reset request failed:", error);
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
                        Forgot Your Password?
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-300">
                        Enter your email and we'll send you a link to get back into your account.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
                    {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
                    {message && <p className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md">{message}</p>}
                    
                    {!message && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                <div className="relative">
                                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="pl-10" />
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MailIcon className="h-5 w-5 text-gray-400" />
                                    </span>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}
                    
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Remembered your password?{' '}
                        <button onClick={navigateToLogin} className="font-medium text-primary hover:text-primary-hover">
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;