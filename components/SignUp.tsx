
import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';
import { LogoIcon } from './common/Icons';
import { supabase } from '../lib/supabaseClient';

interface SignUpProps {
    navigateToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ navigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name, // This will be used by the trigger to create the profile
                    },
                }
            });
            if (error) throw error;
            // On success, the AuthProvider's onAuthStateChange listener will detect the new user,
            // log them in, and navigate to the home view automatically.
        } catch (error: any) {
            console.error("Signup failed:", error);
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
                        Create an Account
                    </h2>
                     <p className="mt-2 text-center text-sm text-gray-300">
                        Join Digital Fundraising and start funding the future.
                    </p>
                </div>
            </div>
            
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10">
                    {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
                        </div>
                        <div>
                            <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">Email address</label>
                            <Input id="email-signup" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                        <div>
                            <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700">Password</label>
                            <Input id="password-signup" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" placeholder="Must be at least 6 characters" />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <button onClick={navigateToLogin} className="font-medium text-primary hover:text-primary-hover">
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
