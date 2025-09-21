
import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { LogoIcon } from './common/Icons';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
    navigateToSignUp: () => void;
    navigateToForgotPassword: () => void;
}

const Login: React.FC<LoginProps> = ({ navigateToSignUp, navigateToForgotPassword }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // The AuthProvider's onAuthStateChange will handle navigation
        } catch (error: any) {
            console.error("Login failed:", error);
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
                        Welcome Back
                    </h2>
                     <p className="mt-2 text-center text-sm text-gray-300">
                        Sign in to continue to Digital Fundraising.
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
                    {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                        </div>
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <button type="button" onClick={navigateToForgotPassword} className="font-medium text-primary hover:text-primary-hover focus:outline-none">
                                    Forgot your password?
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button onClick={navigateToSignUp} className="font-medium text-primary hover:text-primary-hover">
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;