import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  MoreVertical,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
} from 'lucide-react';
import { userApi, roleApi } from '../../services/api';
import { authApi } from '../../services/api';
import { User, Role, EditTemporaryUserForm, EditUserForm } from './types';
import CreateEditUserModal from './modals/Create';


export default function Accounts() {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // active, inactive, all
  const [filterVerification, setFilterVerification] = useState<string>('all'); // verified, unverified, all
  const [sortBy, setSortBy] = useState<string>('newest'); // newest, oldest, lastLoginNewest, lastLoginOldest
  const [showAddUser, setShowAddUser] = useState(false);
  const [userDetailModal, setUserDetailModal] = useState<User | null>(null);
  const [showEditUser, setShowEditUser] = useState(false);

  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editSubmitSuccess, setEditSubmitSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  // Pagination state


  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // New User Form State

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReEnterPassword, setShowReEnterPassword] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const openCreateModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

   const openEditModal = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const fetchAllUsers = async () => {
    try {
      let allUsers: User[] = [];
      let currentPage = 1;
      const maxPageSize = 100; // Backend limit
      let hasMoreData = true;

      while (hasMoreData) {
        const usersResponse = await userApi.getAllUsers(currentPage, maxPageSize);

        if (usersResponse.success && usersResponse.data?.data) {
          const transformedUsers: User[] = usersResponse.data.data.map((user: any) => ({
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isActive: user.isActive,
            role: user.role,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            isTemporary: user.isTemporary || false
          }));

          allUsers = [...allUsers, ...transformedUsers];

          // Check if we've fetched all pages
          const totalPages = usersResponse.data.totalPages || 1;
          hasMoreData = currentPage < totalPages;
          currentPage++;
        } else if (usersResponse.success && usersResponse.users) {
          // Fallback for old API response format
          const transformedUsers: User[] = usersResponse.users.map((user: any) => ({
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            isActive: user.isActive,
            role: user.role,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            isTemporary: user.isTemporary || false
          }));
          allUsers = transformedUsers;
          hasMoreData = false; // Old format returns all data at once
        } else {
          hasMoreData = false;
        }
      }

      setAllUsers(allUsers);
      return allUsers;
    } catch (error) {
      console.error('Failed to fetch all users:', error);
      return [];
    }
  };

  // Load users and roles from database
  const loadData = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);

    // Load users - this should always work regardless of roles
    try {
      const usersResponse = await userApi.getAllUsers(page, size);

      if (usersResponse.success && usersResponse.data?.data) {
        const transformedUsers: User[] = usersResponse.data.data.map((user: any) => ({
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          isTemporary: user.isTemporary || false
        }));

        setUsers(transformedUsers);
        setCurrentPage(usersResponse.data.page || page);
        setPageSize(usersResponse.data.pageSize || size);
        setTotalCount(usersResponse.data.totalCount || 0);
        setTotalPages(usersResponse.data.totalPages || 1);
      } else if (usersResponse.success && usersResponse.users) {
        // Fallback for old API response format - use client-side pagination
        const allTransformedUsers: User[] = usersResponse.users.map((user: any) => ({
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isActive: user.isActive,
          role: user.role,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          isTemporary: user.isTemporary || false
        }));
        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const paginatedUsers = allTransformedUsers.slice(startIndex, endIndex);
        setUsers(paginatedUsers);
        // Set pagination values for non-paginated response
        setTotalCount(allTransformedUsers.length);
        setTotalPages(Math.ceil(allTransformedUsers.length / size));
        setCurrentPage(page);
        setPageSize(size);
      } else {
        console.error('Failed to load users:', usersResponse.message);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }

    // Load roles - independent of users
    try {
      const rolesResponse = await roleApi.getAllRoles(1, 100); // Get up to 100 roles

      if (rolesResponse.success && rolesResponse.data?.data) {
        setRoles(rolesResponse.data.data);
      } else if (rolesResponse.success && rolesResponse.roles) {
        // Fallback for old API response format
        setRoles(rolesResponse.roles);
      } else {
        console.error('Failed to load roles:', rolesResponse.message);
        setRoles([]);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
    }

    setLoading(false);
  };

  // Smart refetch that handles empty pages after deletion  
  const refetchUsers = async () => {
    if (hasFilters) {
      // For filtered view, reload all data and let frontend handle filtering
      await loadData(1, 100); // Load more data for filtering
      // Also refresh all users
      await fetchAllUsers();
    } else {
      // For paginated view, check if we need to adjust page
      const response = await userApi.getAllUsers(currentPage, pageSize);
      if (response.success && response.data?.data) {
        const newTotalPages = response.data.totalPages || 1;
        const newTotalCount = response.data.totalCount || 0;

        if (currentPage > newTotalPages && newTotalCount > 0) {
          // Navigate to last available page
          setCurrentPage(newTotalPages);
          await loadData(newTotalPages, pageSize);
        } else if (newTotalCount === 0) {
          // If no users at all, go to page 1
          setCurrentPage(1);
          await loadData(1, pageSize);
        } else {
          // Current page is valid, just update data
          await loadData(currentPage, pageSize);
        }
      }
      // Also refresh all users
      await fetchAllUsers();
    }
  };

  // Refetch and navigate to first page (where new items should appear)
  const refetchAndGoToFirstPage = async () => {
    setCurrentPage(1);
    await loadData(1, pageSize);
    // Also refresh all users
    await fetchAllUsers();
  };

  useEffect(() => {
    loadData(1, pageSize);
    // Also fetch all users for client-side operations
    fetchAllUsers();
  }, []);

  // Use filtered/sorted users for display (when filters are active)
  // Use backend pagination when no filters are applied
  const hasFilters = searchTerm !== '' || filterRole !== 'all' || filterStatus !== 'all' || filterVerification !== 'all' || sortBy !== 'newest';

  // Use allUsers for filtering/sorting, users for backend pagination
  const sourceUsers = hasFilters ? allUsers : users;

  // Filter users
  const filteredUsers = sourceUsers.filter(user => {
    const matchesSearch = searchTerm === '' ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole.toLowerCase();

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);

    const matchesVerification = filterVerification === 'all' ||
      (filterVerification === 'verified' && !user.isTemporary) ||
      (filterVerification === 'unverified' && user.isTemporary);

    return matchesSearch && matchesRole && matchesStatus && matchesVerification;
  });

  // Sort users based on selected sort option
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'lastLoginNewest':
        if (!a.lastLogin && !b.lastLogin) return 0;
        if (!a.lastLogin) return 1; // Put users without login at the end
        if (!b.lastLogin) return -1;
        return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
      case 'lastLoginOldest':
        if (!a.lastLogin && !b.lastLogin) return 0;
        if (!a.lastLogin) return 1; // Put users without login at the end
        if (!b.lastLogin) return -1;
        return new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  let currentUsers: User[], displayTotalPages: number, displayTotalCount: number;
  if (hasFilters) {
    // Client-side pagination for filtered results
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    currentUsers = sortedUsers.slice(startIndex, endIndex);
    displayTotalPages = Math.ceil(sortedUsers.length / pageSize);
    displayTotalCount = sortedUsers.length;
  } else {
    // Backend pagination for unfiltered results
    currentUsers = users;
    displayTotalPages = totalPages;
    displayTotalCount = totalCount;
  }

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, filterVerification, sortBy]);

 

  const getRoleBadgeColor = (role: string) => {
    // Create a consistent color mapping based on role name
    const colors = ['primary', 'danger', 'warning', 'info', 'success', 'secondary'];
    const hash = role.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const lastLogin = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };


  const handleEmailUser = (user: User) => {
    // Open email client with pre-filled recipient
    window.location.href = `mailto:${user.email}`;
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {

      // Test if we can access a working endpoint first
      try {
        const testResponse = await userApi.getProfile();
      } catch (testError) {
        console.log('API test failed:', testError);
      }

      let response;

      if (deletingUser.isTemporary) {
        response = await userApi.deleteTemporaryUser(deletingUser.userId);
      } else {
        response = await userApi.deleteUser(deletingUser.userId);
      }

      if (response && response.success) {
        setDeleteSuccess(true);

        // Smart refetch to handle pagination after deletion
        refetchUsers();

        // Delete success modal will be closed manually by user clicking X
      } else {
        console.error('Failed to delete user:', response?.message);
        alert(`Failed to delete user: ${response?.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error deleting user - Full error object:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error response:', error.response);
      alert(`Error deleting user: ${error.message || error.status || 'Network error occurred'}`);
    }
  };

  const confirmDeleteUser = (user: User) => {
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light" style={{ overflowX: 'hidden' }}>
        <div className="container-fluid py-4" style={{ maxWidth: '100%' }}>
          {/* Header */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center">
                <Users className="text-primary me-3" size={32} />
                <div>
                  <h1 className="display-5 fw-bold text-dark mb-0">User Accounts</h1>
                  <p className="text-muted fs-6 mb-0">Manage user accounts and permissions</p>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary rounded-3 d-flex align-items-center" disabled>
                  <UserPlus className="me-2" size={18} />
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading accounts...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dropdown action handlers
  const handleFreezeUser = async (user: User) => {
    try {
      const updatedUser = {
        ...user,
        isActive: !user.isActive
      };

      const response = await userApi.updateUser(updatedUser);

      if (response && response.success) {
        // Update the user in the local state
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.userId === user.userId
              ? { ...u, isActive: !u.isActive }
              : u
          )
        );
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  return (
    <div className="min-vh-100 bg-light" style={{ overflowX: 'hidden' }}>
      <div className="container-fluid py-4" style={{ maxWidth: '100%' }}>
        {/* Header */}
        <div className="mb-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <Users className="text-primary me-3" size={32} />
              <div>
                <h1 className="display-5 fw-bold text-dark mb-0">User Accounts</h1>
                <p className="text-muted fs-6 mb-0">Manage user accounts and permissions</p>
              </div>
            </div>
            <div className="d-flex gap-2">
                <button className="btn btn-primary rounded-3 d-flex align-items-center" onClick={openCreateModal}>Add User</button>           
            </div>
          </div>
        </div>
        {/* Filters and Search */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 rounded-4 shadow-sm">
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-3">
                    <div className="position-relative">
                      <Search className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" size={18} />
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3 ps-5"
                        placeholder="Search users by name, username, .."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      {roles.map((role) => (
                        <option key={role.userRoleId} value={role.role.toLowerCase()}>
                          {role.role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={filterVerification}
                      onChange={(e) => setFilterVerification(e.target.value)}
                    >
                      <option value="all">All Users</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select
                      className="form-select form-select-lg rounded-3"
                      value={sortBy}
                      onChange={async (e) => {
                        const newSortBy = e.target.value;
                        setSortBy(newSortBy);
                        setCurrentPage(1); // Reset to first page when sorting changes

                        // If switching to a client-side sort and we don't have all users, fetch them
                        if (newSortBy !== 'newest' && allUsers.length === 0) {
                          await fetchAllUsers();
                        }
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="lastLoginNewest">Last Login (Recent)</option>
                      <option value="lastLoginOldest">Last Login (Oldest)</option>
                    </select>
                  </div>
                  <div className="col-md-1">
                    <div className="bg-light rounded-3 p-2 text-center">
                      <div className="fw-bold text-primary small">{displayTotalCount}</div>
                      <div className="small text-muted">Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="row g-4">
          {currentUsers.map((user) => (
            <div key={user.userId} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
              <div
                className="card border-0 rounded-4 shadow-sm h-100 dashboard-card"
                style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={(e) => {
                  // Don't open modal if clicking on dropdown
                  if (!(e.target as HTMLElement).closest('.dropdown')) {
                    setUserDetailModal(user);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-2">
                        <Users className="text-primary" size={20} />
                      </div>
                      <div>
                        <h6 className="fw-bold text-dark mb-0">
                          {user.firstName} {user.lastName}
                        </h6>
                        <p className="text-muted mb-0 small">@{user.username}</p>
                      </div>
                    </div>
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-3"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={16} />
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end" style={{ width: '190px' }}>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center w-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFreezeUser(user);
                            }}
                            style={{ whiteSpace: 'nowrap', textAlign: 'left' }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
                              {user.isActive ? (
                                <><Lock size={14} className="me-2 flex-shrink-0" /><span>Freeze Account</span></>
                              ) : (
                                <><Unlock size={14} className="me-2 flex-shrink-0" /><span>Unfreeze Account</span></>
                              )}
                            </span>
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center w-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEmailUser(user);
                            }}
                            style={{ whiteSpace: 'nowrap', textAlign: 'left' }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
                              <Mail size={14} className="me-2 flex-shrink-0" /><span>Send Email</span>
                            </span>
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button
                            className="dropdown-item text-danger d-flex align-items-center w-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteUser(user);
                            }}
                            style={{ whiteSpace: 'nowrap', textAlign: 'left' }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
                              <Trash2 size={14} className="me-2 flex-shrink-0" /><span>Delete User</span>
                            </span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mb-2">
                    <span className={`badge bg-${getRoleBadgeColor(user.role)} bg-opacity-10 text-${getRoleBadgeColor(user.role)} fw-semibold small`}>
                      {user.role}
                    </span>
                    {user.isActive ? (
                      <span className="badge bg-success bg-opacity-10 text-success fw-semibold ms-1 small">
                        <CheckCircle2 size={10} className="me-1" />
                        Active
                      </span>
                    ) : (
                      <span className="badge bg-secondary bg-opacity-10 text-secondary fw-semibold ms-1 small">
                        <XCircle size={10} className="me-1" />
                        Inactive
                      </span>
                    )}
                    {user.isTemporary ? (
                      <span className="badge bg-warning bg-opacity-10 text-warning fw-semibold ms-1 small">
                        <AlertTriangle size={10} className="me-1" />
                        Unverified
                      </span>
                    ) : (
                      <span className="badge bg-info bg-opacity-10 text-info fw-semibold ms-1 small">
                        <CheckCircle2 size={10} className="me-1" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="d-flex align-items-center mb-1">
                      <Mail className="text-muted me-2" size={12} />
                      <span className="small text-dark text-truncate" style={{ maxWidth: '150px' }} title={user.email}>{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="d-flex align-items-center mb-1">
                        <Phone className="text-muted me-2" size={12} />
                        <span className="small text-dark">{user.phoneNumber}</span>
                      </div>
                    )}
                    <div className="d-flex align-items-center">
                      <Calendar className="text-muted me-2" size={12} />
                      <span className="small text-muted">Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>

                  <div className="bg-light rounded-3 p-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small fw-semibold text-muted">Last Login</span>
                      <span className="small text-dark">{formatLastLogin(user.lastLogin)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && !loading && (
            <div className="col-12">
              <div className="card border-0 rounded-4 shadow-sm">
                <div className="card-body p-5 text-center">
                  <Users size={64} className="text-muted mb-3 opacity-50" />
                  <h3 className="fw-bold text-muted mb-2">No Users Found</h3>
                  <p className="text-muted mb-4">
                    {searchTerm || filterRole !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by adding your first user.'}
                  </p>
                  {(!searchTerm && filterRole === 'all') && (
                    <button
                      className="btn btn-primary rounded-3"
                      onClick={() => setShowAddUser(true)}
                    >
                      <UserPlus className="me-2" size={18} />
                      Add First User
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {(displayTotalCount > pageSize || sortBy === 'oldest' || sortBy === 'lastLoginNewest' || sortBy === 'lastLoginOldest') && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">
                {hasFilters ? (
                  `Showing ${currentUsers.length} of ${displayTotalCount} users (filtered)`
                ) : (
                  `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, displayTotalCount)} of ${displayTotalCount} users`
                )}
              </span>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Users per page:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: 'auto' }}
                  value={pageSize}
                  onChange={(e) => {
                    const newPageSize = Number(e.target.value);
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                    if (!hasFilters) {
                      loadData(1, newPageSize);
                    }
                  }}
                >
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => {
                      setCurrentPage(1);
                      if (!hasFilters) {
                        loadData(1, pageSize);
                      }
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft size={16} />
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      if (!hasFilters) {
                        loadData(newPage, pageSize);
                      }
                    }}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>
                </li>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, displayTotalPages) }, (_, i) => {
                  let pageNum: number;
                  if (displayTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= displayTotalPages - 2) {
                    pageNum = displayTotalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => {
                          setCurrentPage(pageNum);
                          if (!hasFilters) {
                            loadData(pageNum, pageSize);
                          }
                        }}
                      >
                        {pageNum}
                      </button>
                    </li>
                  );
                })}

                <li className={`page-item ${currentPage === displayTotalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      if (!hasFilters) {
                        loadData(newPage, pageSize);
                      }
                    }}
                    disabled={currentPage === displayTotalPages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </li>
                <li className={`page-item ${currentPage === displayTotalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => {
                      setCurrentPage(displayTotalPages);
                      if (!hasFilters) {
                        loadData(displayTotalPages, pageSize);
                      }
                    }}
                    disabled={currentPage === displayTotalPages}
                  >
                    <ChevronsRight size={16} />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}

        {/* User Detail Modal */}
        {userDetailModal && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 rounded-4">
                <div className="modal-header border-0 pb-0">
                  <div className="d-flex align-items-center">
                   <Link
                      to={`/accounts/${userDetailModal.userId}`}
                      onClick={() => setUserDetailModal(null)}
                      className="btn btn-link text-decoration-none"
                    >
                      View Full Profile
                    </Link>
                    <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                      <Users className="text-primary" size={20} />
                    </div>
                    <div>
                      <h5 className="modal-title fw-bold mb-0">
                        {userDetailModal.firstName} {userDetailModal.lastName}
                      </h5>
                      <p className="text-muted small mb-0">@{userDetailModal.username}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setUserDetailModal(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row g-4">
                    {/* Status and Role */}
                    <div className="col-12">
                      <div className="d-flex gap-2 mb-3">
                        <span className={`badge bg-${getRoleBadgeColor(userDetailModal.role)} bg-opacity-10 text-${getRoleBadgeColor(userDetailModal.role)} fw-semibold px-3 py-2`}>
                          <Shield size={14} className="me-1" />
                          {userDetailModal.role}
                        </span>
                        {userDetailModal.isActive ? (
                          <span className="badge bg-success bg-opacity-10 text-success fw-semibold px-3 py-2">
                            <CheckCircle2 size={14} className="me-1" />
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-secondary bg-opacity-10 text-secondary fw-semibold px-3 py-2">
                            <XCircle size={14} className="me-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="col-md-6">
                      <div className="bg-primary bg-opacity-10 rounded-4 p-4">
                        <h6 className="fw-bold text-primary mb-3">
                          <Users size={16} className="me-2" />
                          Basic Information
                        </h6>
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="small text-muted">User ID</div>
                            <div className="fw-semibold text-dark">{userDetailModal.userId}</div>
                          </div>
                          <div className="col-6">
                            <div className="small text-muted">First Name</div>
                            <div className="fw-semibold text-dark">{userDetailModal.firstName}</div>
                          </div>
                          <div className="col-6">
                            <div className="small text-muted">Last Name</div>
                            <div className="fw-semibold text-dark">{userDetailModal.lastName}</div>
                          </div>
                          <div className="col-12">
                            <div className="small text-muted">Username</div>
                            <div className="fw-semibold text-dark">@{userDetailModal.username}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="col-md-6">
                      <div className="bg-info bg-opacity-10 rounded-4 p-4">
                        <h6 className="fw-bold text-info mb-3">
                          <Mail size={16} className="me-2" />
                          Contact Information
                        </h6>
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="d-flex align-items-center mb-3">
                              <Mail className="text-info me-3" size={16} />
                              <div>
                                <div className="small text-muted">Email Address</div>
                                <div className="fw-semibold text-dark">{userDetailModal.email}</div>
                              </div>
                            </div>
                            {userDetailModal.phoneNumber && (
                              <div className="d-flex align-items-center">
                                <Phone className="text-info me-3" size={16} />
                                <div>
                                  <div className="small text-muted">Phone Number</div>
                                  <div className="fw-semibold text-dark">{userDetailModal.phoneNumber}</div>
                                </div>
                              </div>
                            )}
                            {!userDetailModal.phoneNumber && (
                              <div className="d-flex align-items-center">
                                <Phone className="text-muted me-3" size={16} />
                                <div>
                                  <div className="small text-muted">Phone Number</div>
                                  <div className="text-muted">Not provided</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Information */}
                    <div className="col-12">
                      <div className="bg-success bg-opacity-10 rounded-4 p-4">
                        <h6 className="fw-bold text-success mb-3">
                          <Calendar size={16} className="me-2" />
                          Activity Information
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="text-center">
                              <div className="small text-muted">Last Login</div>
                              <div className="fw-bold text-dark h5 mb-0">{formatLastLogin(userDetailModal.lastLogin)}</div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center">
                              <div className="small text-muted">Member Since</div>
                              <div className="fw-bold text-dark h5 mb-0">{formatDate(userDetailModal.createdAt)}</div>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center">
                              <div className="small text-muted">Account Status</div>
                              <div className="fw-bold text-dark h5 mb-0">
                                {userDetailModal.isActive ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


       

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingUser && (
          <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h3 className="modal-title fw-bold text-danger">
                    {deleteSuccess ? 'User Deleted' : 'Confirm Deletion'}
                  </h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletingUser(null);
                      setDeleteSuccess(false);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  {deleteSuccess ? (
                    <div className="text-center py-4">
                      <CheckCircle2 size={64} className="text-success mb-3" />
                      <h4 className="text-success fw-bold">User Deleted Successfully!</h4>
                      <p className="text-muted">
                        <strong>{deletingUser.firstName} {deletingUser.lastName}</strong> has been permanently removed.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertTriangle size={64} className="text-warning mb-3" />
                      <h4 className="fw-bold">Are you sure you want to delete this user?</h4>
                      <div className="bg-light rounded-3 p-3 my-3">
                        <h5 className="fw-bold text-dark mb-1">{deletingUser.firstName} {deletingUser.lastName}</h5>
                        <p className="text-muted small mb-1">
                          <Mail className="me-1" size={14} />
                          {deletingUser.email}
                        </p>
                        <p className="text-muted small mb-0">
                          <Shield className="me-1" size={14} />
                          Role: {deletingUser.role}
                        </p>
                      </div>
                      <p className="text-danger small fw-semibold">
                        ⚠️ This action cannot be undone. All user data and permissions will be permanently removed.
                      </p>
                    </div>
                  )}
                </div>
                {!deleteSuccess && (
                  <div className="modal-footer border-0 pt-0">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletingUser(null);
                      }}
                      className="btn btn-secondary rounded-3 fw-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="btn btn-danger rounded-3 fw-semibold d-flex align-items-center"
                    >
                      <Trash2 className="me-2" size={16} />
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}