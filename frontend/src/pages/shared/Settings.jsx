import { useState, useContext } from 'react';
import {
  User, Phone, Mail, Shield, Lock,
  Eye, EyeOff, CheckCircle, Pencil, ChevronRight, Bell, Globe, Camera, ArrowRight, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../api/auth.api';

// ── Constants ──────────────────────────────────────────────────────────────────

const ROLE_LABELS = {
  ADMIN:     'Administrator',
  HOME_USER: 'Home User',
  COLLECTOR: 'Collector',
  BUYER:     'Buyer',
};

// ── PasswordInput ──────────────────────────────────────────────────────────────

function PasswordInput({ id, label, value, onChange, show, onToggle, placeholder }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm border-none rounded-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] pr-12 font-medium"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 px-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Settings() {
  const { user, setUser } = useContext(AuthContext);

  // Profile editing state
  const [isEditing,     setIsEditing]     = useState(false);
  const [name,          setName]          = useState(user?.name  ?? '');
  const [phone,         setPhone]         = useState(user?.phone ?? '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password section visibility + state
  const [showPwSection,   setShowPwSection]   = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword,     setNewPassword]      = useState('');
  const [confirmPassword, setConfirmPassword]  = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving,    setPwSaving]    = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEditCancel = () => {
    setName(user?.name  ?? '');
    setPhone(user?.phone ?? '');
    setIsEditing(false);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Name must be at least 2 characters.');
      return;
    }
    setProfileSaving(true);
    try {
      const res = await updateProfile({ name: name.trim(), phone: phone.trim() });
      setUser((prev) => ({ ...prev, name: res.data.user.name, phone: res.data.user.phone }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPwSection(false);
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your logistical profile and security preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* ── Personal Information Card (Left Column, span 2) ─────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 lg:p-8 flex flex-col">
          
          {/* Card Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Personal Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Basic details for identification and communication.
              </p>
            </div>
            
            {/* Edit / Save Toggle */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#1A7A4A] dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
              >
                <Pencil size={16} />
                Edit
              </button>
            ) : (
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1A7A4A] hover:bg-green-700 disabled:opacity-70 transition-colors shadow-sm"
              >
                {profileSaving ? (
                   <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                   <Check size={16} />
                )}
                Save Changes
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12 items-start mt-4">
            {/* Avatar Section */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-3xl bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                 {/* Placeholder for avatar - matching the grey square look */}
                 <span className="text-4xl font-bold text-gray-400">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                 </span>
              </div>
              {/* Camera Icon Overlay */}
              <button className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#1A7A4A] text-white flex items-center justify-center border-4 border-white dark:border-gray-800 hover:bg-green-700 transition-colors shadow-sm">
                <Camera size={16} />
              </button>
            </div>

            {/* Fields Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6 w-full">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Full Name
                </label>
                {!isEditing ? (
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {user?.name || '—'}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium transition-colors"
                  />
                )}
              </div>

              {/* Employee / Account ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {['ADMIN', 'COLLECTOR'].includes(user?.role) ? 'Employee ID' : 'Account ID'}
                </label>
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {user?.id ? (
                    `${
                      user.role === 'ADMIN' ? 'ADM' :
                      user.role === 'COLLECTOR' ? 'COL' :
                      user.role === 'BUYER' ? 'BUY' : 'USR'
                    }-${user.id.substring(0, 6).toUpperCase()}`
                  ) : (
                    ROLE_LABELS[user?.role] || '—'
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Email Address
                </label>
                {!isEditing ? (
                  <div className="text-base font-semibold text-gray-900 dark:text-white break-all">
                    {user?.email || '—'}
                  </div>
                ) : (
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full text-sm border border-transparent rounded-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed font-medium"
                  />
                )}
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Phone Number
                </label>
                {!isEditing ? (
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    {user?.phone || '—'}
                  </div>
                ) : (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium transition-colors"
                  />
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Change Password Card (Right Column) ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
              <Lock size={24} className="text-gray-700 dark:text-gray-300" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
              Change Password
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              It's a good idea to use a strong password that you're not using elsewhere.
            </p>

            {!showPwSection ? (
              <button
                onClick={() => setShowPwSection(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200/60 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors mb-6"
              >
                Change Password <ArrowRight size={16} />
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 mb-6">
                <PasswordInput
                  id="settings-current-password"
                  label="Current Password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  show={showCurrent}
                  onToggle={() => setShowCurrent((v) => !v)}
                  placeholder="Enter current password"
                />
                <PasswordInput
                  id="settings-new-password"
                  label="New Password"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNew}
                  onToggle={() => setShowNew((v) => !v)}
                  placeholder="Min. 6 characters"
                />
                <PasswordInput
                  id="settings-confirm-password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  onToggle={() => setShowConfirm((v) => !v)}
                  placeholder="Re-enter new password"
                />

                <div className="flex gap-3 pt-2">
                   <button
                    type="submit"
                    disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200/60 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60 rounded-full text-sm font-bold transition-colors shadow-sm"
                   >
                     {pwSaving ? 'Updating...' : 'Update Password'} <CheckCircle size={16} className="text-gray-500 dark:text-gray-400" />
                   </button>
                   <button
                    type="button"
                    onClick={() => {
                       setShowPwSection(false);
                       setCurrentPassword('');
                       setNewPassword('');
                       setConfirmPassword('');
                    }}
                    className="px-4 py-3 rounded-full text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                   >
                     Cancel
                   </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* ── System Preferences Divider ─────────────────────────────────────────── */}
      <div className="relative flex py-10 items-center">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
        <span className="flex-shrink-0 mx-6 text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase">
          System Preferences
        </span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700/60"></div>
      </div>

      {/* ── System Preferences Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Notifications */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group flex flex-col justify-between border border-transparent dark:border-gray-700/30">
          <div className="flex items-center justify-between mb-8">
             <Bell size={20} className="text-[#1A7A4A] dark:text-green-400" />
             <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Notifications</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configure alert delivery methods.</p>
          </div>
        </div>

        {/* Language */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group flex flex-col justify-between border border-transparent dark:border-gray-700/30">
          <div className="flex items-center justify-between mb-8">
             <Globe size={20} className="text-[#1A7A4A] dark:text-green-400" />
             <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Language</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Set your preferred locale and timezone.</p>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-6 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group flex flex-col justify-between border border-transparent dark:border-gray-700/30">
          <div className="flex items-center justify-between mb-8">
             <Shield size={20} className="text-[#1A7A4A] dark:text-green-400" />
             <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Privacy</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage data export and visibility.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
