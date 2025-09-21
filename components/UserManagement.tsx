import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types';
import Modal from './common/Modal';
import Button from './common/Button';
import { TrashIcon, ShieldCheckIcon, UserIcon } from './common/Icons';
import { useAuth } from '../context/AuthContext';

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null); // Stores ID of user being acted upon
    
    const [userToAction, setUserToAction] = useState<Profile | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // This query requires RLS policies that allow admins to read all profiles.
            const { data, error } = await supabase.from('profiles').select('*').order('name');
            if (error) throw error;
            setUsers(data || []);
        } catch (err: any) {
            console.error("Error fetching users:", err);
            setError("Could not load user data. You may not have the required permissions.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteClick = (user: Profile) => {
        setActionError(null);
        if (currentUser?.id === user.id) {
            setActionError("You cannot delete your own account from the admin panel.");
            return;
        }
        setUserToAction(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToAction) return;
        
        setActionLoading(userToAction.id);
        setActionError(null);
        try {
            // IMPORTANT: This requires a Supabase Edge Function or RPC
            // that checks for admin privileges before deleting a user.
            const { error } = await supabase.rpc('delete_user_by_id', {
                user_id_to_delete: userToAction.id
            });
            if (error) throw error;
            
            // Refresh user list on success
            await fetchUsers();
        } catch (err: any) {
            console.error('Failed to delete user:', err);
            setActionError(err.message || 'An unexpected error occurred during deletion.');
        } finally {
            setIsDeleteModalOpen(false);
            setUserToAction(null);
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (user: Profile, newRole: 'admin' | 'user') => {
        if (currentUser?.id === user.id) {
            setActionError("You cannot change your own role.");
            return;
        }
        
        setActionLoading(user.id);
        setActionError(null);
        try {
            // IMPORTANT: This requires an RPC that verifies the caller is an admin.
            const { error } = await supabase.rpc('update_user_role', {
                user_id_to_update: user.id,
                new_role: newRole
            });
            if (error) throw error;

            await fetchUsers();
        } catch (err: any) {
            console.error('Failed to update role:', err);
            setActionError(err.message || 'An unexpected error occurred while updating the role.');
        } finally {
            setActionLoading(null);
        }
    };

    const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
        const is_admin = role === 'admin';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${is_admin ? 'bg-blue-100 text-primary' : 'bg-gray-100 text-neutral'}`}>
                {is_admin ? <ShieldCheckIcon className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                {is_admin ? 'Admin' : 'User'}
            </span>
        );
    };

    if (loading) {
        return <div className="text-center py-20">Loading user data...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-dark mb-6">User Management</h1>
             {actionError && <div className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{actionError}</div>}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{/* User's email is sensitive, assuming we can't show it */}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <RoleBadge role={user.role} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end items-center space-x-2">
                                            {actionLoading === user.id ? (
                                                <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <>
                                                    {user.role !== 'admin' ? (
                                                        <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => handleRoleChange(user, 'admin')}>Make Admin</Button>
                                                    ) : (
                                                        <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => handleRoleChange(user, 'user')}>Remove Admin</Button>
                                                    )}
                                                    <button onClick={() => handleDeleteClick(user)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                        <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4" id="modal-title">
                        Delete User
                    </h3>
                    <div className="mt-2 px-7 py-3">
                        <p className="text-sm text-gray-500">
                            Are you sure you want to delete <span className="font-bold">{userToAction?.name}</span>? This action is irreversible.
                        </p>
                    </div>
                    <div className="items-center px-4 py-3 space-x-4">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
