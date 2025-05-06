import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, User, Key, Plus, Trash2, Check, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'viewer';
  status: 'active' | 'pending';
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer' as TeamMember['role'],
  });
  
  // Mock team members data
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      email: 'team.member@example.com',
      name: 'Team Member',
      role: 'manager',
      status: 'active',
    },
    {
      id: '2',
      email: 'pending.user@example.com',
      name: 'Pending User',
      role: 'viewer',
      status: 'pending',
    },
  ]);
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update logic here
    setIsEditing(false);
  };
  
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle team member invite logic here
    setTeamMembers([...teamMembers, {
      id: (teamMembers.length + 1).toString(),
      email: inviteForm.email,
      name: inviteForm.email.split('@')[0],
      role: inviteForm.role,
      status: 'pending',
    }]);
    setInviteForm({ email: '', role: 'viewer' });
    setShowInviteForm(false);
  };
  
  const handleRemoveMember = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(teamMembers.filter(member => member.id !== id));
    }
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Profile & Team</h2>
        <p className="text-gray-500 mt-1">
          Manage your profile and team members
        </p>
      </div>
      
      {/* Profile Section */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
          <Button
            variant={isEditing ? 'outline' : 'primary'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
        
        <form onSubmit={handleProfileSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Input
                label="Name"
                name="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                disabled={!isEditing}
                icon={<User size={18} className="text-gray-500" />}
              />
            </div>
            
            <div>
              <Input
                label="Email"
                type="email"
                name="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                disabled={!isEditing}
                icon={<Mail size={18} className="text-gray-500" />}
              />
            </div>
            
            {isEditing && (
              <>
                <div>
                  <Input
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                    icon={<Key size={18} className="text-gray-500" />}
                  />
                </div>
                
                <div>
                  <Input
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    icon={<Key size={18} className="text-gray-500" />}
                  />
                </div>
                
                <div>
                  <Input
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    icon={<Key size={18} className="text-gray-500" />}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Save Changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
      
      {/* Team Management Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setShowInviteForm(true)}
          >
            Invite Member
          </Button>
        </div>
        
        {/* Invite Form */}
        {showInviteForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="Enter team member's email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as TeamMember['role'] })}
                  className="w-full rounded-md shadow-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Send Invite
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {/* Team Members List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">{member.role}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status === 'active' ? (
                        <Check size={14} className="mr-1" />
                      ) : (
                        <Mail size={14} className="mr-1" />
                      )}
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;