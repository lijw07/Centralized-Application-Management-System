import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { userApi, roleApi } from '../../../services/api';
import { authApi } from '../../../services/api';
import { User, Role, EditTemporaryUserForm, EditUserForm, NewUserForm } from '../types';
import FormField from '../../shared/Form';
import { useForm, validationRules } from '../../../hooks/useForm'; // adjust path
import { toast } from 'react-toastify';
import Conditional  from '../../shared/Conditional';

const initialValues: NewUserForm = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phoneNumber: '',
    role: '',
    password: '',
    reEnterPassword: '',
};

const schema = {
    firstName: validationRules.name,
    lastName: validationRules.name,
    username: validationRules.username,
    email: validationRules.email,
    phoneNumber: { required: true, maxLength: 20 }, // add your own rule here
    role: { required: true },
    password: validationRules.password,
    reEnterPassword: {
        required: true,
        custom: (value: any, formState: Record<string, { value: any }>) =>
            value !== formState.password.value ? 'Passwords do not match' : null,
    },
};

interface CreateEditUserModalProps {
    userId?: string; // Optional, can be undefined for 'Create' mode
}

export default function CreateEditUserModal({ userId }: CreateEditUserModalProps) {
    const [showAddUser, setShowAddUser] = useState(false);
    const [userDetailModal, setUserDetailModal] = useState<User | null>(null);
    const [showEditUser, setShowEditUser] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [editSubmitSuccess, setEditSubmitSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    const { values, errors, touched, handleSubmit, setValue, isSubmitting, reset } = useForm<NewUserForm>({
        initialValues,
        validationRules: schema,
        onSubmit: async (values) => {
            if (!userId) { //create User
                const payload = { 
                        email: values.email,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        phoneNumber: values.phoneNumber,
                        username: values.username,
                        role: values.role,
                        isActive: true,
                        password: values.password,
                        reEnterPassword: values.reEnterPassword 
                    }
                const response = await authApi.register(payload);
                console.error("User ID is required for editing.");
                return;
            }
            else {
                //Need to add edit temp user functionality
                try { //edit User
                    const payload = { 
                        userId: userId,
                        email: values.email,
                        firstName: values.firstName,
                        lastName: values.lastName,
                        phoneNumber: values.phoneNumber,
                        username: values.username,
                        role: values.role,
                        isActive: true
                    }
                    
                    await userApi.updateUser(payload);

                    toast.success('User saved successfully!');
                } catch (error) {
                    toast.error('Failed to save user.');
                    console.error(error);
                }
            }
        },
    });

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content border-0 rounded-4">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Edit User</h5>
                    </div>
                    <div className="modal-body">
                        {editSubmitSuccess ? (
                            <div className="text-center py-4">
                                <CheckCircle2 size={64} className="text-success mb-3" />
                                <h4 className="text-success fw-bold">User Updated Successfully!</h4>
                                <p className="text-muted">The user information has been updated.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <FormField
                                        name="firstName"
                                        label="First Name"
                                        type="text"
                                        value={values.firstName}
                                        error={touched.firstName ? errors.firstName : ''}
                                        onChange={setValue}
                                        colClass="col-md-6"
                                    />
                                    <FormField
                                        name="lastName"
                                        label="Last Name"
                                        type="text"
                                        value={values.lastName}
                                        error={touched.lastName ? errors.lastName : ''}
                                        onChange={setValue}
                                        colClass="col-md-6"
                                    />
                                    <FormField
                                        name="username"
                                        label="Username"
                                        type="text"
                                        value={values.username}
                                        error={touched.username ? errors.username : ''}
                                        onChange={setValue}
                                    />
                                    <FormField
                                        name="email"
                                        label="Email"
                                        type="email"
                                        value={values.email}
                                        error={touched.email ? errors.email : ''}
                                        onChange={setValue}
                                    />
                                    <FormField
                                        name="phoneNumber"
                                        label="Phone Number"
                                        type="tel"
                                        value={values.phoneNumber}
                                        error={touched.phoneNumber ? errors.phoneNumber : ''}
                                        onChange={setValue}
                                        placeholder="e.g., +1 (555) 123-4567"
                                        colClass="col-md-6"
                                    />
                                    <FormField
                                        name="role"
                                        label="Role"
                                        type="select"
                                        value={values.role}
                                        error={touched.role ? errors.role : ''}
                                        onChange={setValue}
                                        options={roles.map((r) => ({ value: r.role, label: r.role }))}
                                        colClass="col-md-6"
                                    />
                                    <Conditional showIf={!userId}>
                                        <FormField
                                            name="password"
                                            label="Password"
                                            type="password"
                                            value={values.password}
                                            error={touched.password ? errors.password : ''}
                                            onChange={setValue}
                                            colClass='col-md-6'
                                            placeholder="Please enter a password"
                                        />
                                        <FormField
                                            name="reEnterPassword"
                                            label="ReEnter Password"
                                            type="password"
                                            value={values.reEnterPassword}
                                            error={touched.reEnterPassword ? errors.reEnterPassword : ''}
                                            onChange={setValue}
                                            colClass='col-md-6'
                                            placeholder="Please re-enter password"
                                        />
                                    </Conditional>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="btn btn-primary mt-3">
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        reset();   
                                        //closeModal();   // your function to close the modal
                                    }}
                                >
                                    Cancel
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>

    )


}

