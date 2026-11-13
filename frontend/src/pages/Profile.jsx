import React, { useState } from 'react';
import { User, Mail, MapPin, Phone, Lock, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUserProfile } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status flags
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileError(null);
      setProfileSuccess(false);

      const res = await api.put('/users/profile', {
        name,
        email,
        address,
        phone,
      });

      updateUserProfile(res.data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(false);

      await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal profile and security credentials</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Profile Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-xs text-slate-500">{user?.email}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 555-0199"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Delivery Address</label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 hover:shadow disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-4">
            <Shield className="w-5 h-5 text-brand-600" />
            <span>Security & Password</span>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Password changed successfully!</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {savingPassword ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
