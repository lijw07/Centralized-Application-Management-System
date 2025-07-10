import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, Role, EditTemporaryUserForm, EditUserForm } from './types';
import { userApi, roleApi } from '../../services/api';

const AccountDetails =() => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                if (!userId) {
                // handle missing userId: show error, return early, etc.
                throw new Error("userId is required");
                }
                const res = await userApi.getUser(userId);
                setUser(res.data.userData);
            } catch (err) {
                console.error('Error fetching user:', err);
            } finally {
                setLoading(false);
            }
        }

        if (userId) fetchUser();
    }, [userId]);

    if (loading) return <p>Loading user details...</p>;
    if (!user) return <p>User not found.</p>;

    return (
        <div className="container mt-4">
            <h2>{user.firstName} {user.lastName}</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Phone:</strong> {user.phoneNumber || 'N/A'}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</p>
        </div>
    );
}

export default AccountDetails;