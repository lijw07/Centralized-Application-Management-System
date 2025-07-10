import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, Role, EditTemporaryUserForm, EditUserForm } from '.././types';
import { userApi, roleApi } from '../../../services/api';

const DeleteAccount =() => {
    const { userId } = useParams<{ userId: string }>();
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                if (!userId) {
                // handle missing userId: show error, return early, etc.
                throw new Error("userId is required");
                }
                const res = await userApi.getUser(userId);
            } catch (err) {
                console.error('Error fetching user:', err);
            } finally {
                setLoading(false);
            }
        }

        if (userId) fetchUser();
    }, [userId]);

    if (loading) return <p>Loading delete user...</p>;

    return (
        <div className="container mt-4">
            <h2> {userId}</h2>
           
        </div>
    );
}

export default DeleteAccount;