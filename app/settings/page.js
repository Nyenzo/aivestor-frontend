'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Trash2,
  Save,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  setUserPreferences,
  deleteUserData
} from '../lib/firestore.service';
import { ProfileFormSkeleton, CardSkeleton } from '../components/Skeletons';
import { showSuccess, showError } from '../lib/toast';

export default function SettingsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    risk_level: 'medium'
  });
  
  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    priceAlerts: true,
    portfolioUpdates: true,
    marketNews: false,
    weeklyReports: true
  });
  
  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [message, setMessage] = useState({ type: '', text: '' });

  // Initialize
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!storedToken) {
      router.push('/login');
      return;
    }
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const uid = user.id || user.uid;
        setUserId(uid);
        
        // Load profile and preferences
        Promise.all([
          getUserProfile(uid),
          getUserPreferences(uid)
        ]).then(([profileData, prefsData]) => {
          if (profileData) {
            setProfile({
              displayName: profileData.displayName || '',
              email: profileData.email || user.email || '',
              phone: profileData.phone || '',
              risk_level: profileData.risk_level || 'medium'
            });
          }
          
          if (prefsData) {
            setPreferences({
              emailNotifications: prefsData.emailNotifications ?? true,
              priceAlerts: prefsData.priceAlerts ?? true,
              portfolioUpdates: prefsData.portfolioUpdates ?? true,
              marketNews: prefsData.marketNews ?? false,
              weeklyReports: prefsData.weeklyReports ?? true
            });
          }
          
          setLoading(false);
        }).catch(err => {
          console.error('Error loading settings:', err);
          setLoading(false);
        });
      } catch (e) {
        console.error('Error parsing user:', e);
        setLoading(false);
      }
    }
  }, [router]);

  const handleProfileUpdate = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateUserProfile(userId, {
        displayName: profile.displayName,
        phone: profile.phone,
        risk_level: profile.risk_level
      });
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.displayName = profile.displayName;
      storedUser.risk_level = profile.risk_level;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await setUserPreferences(userId, preferences);
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (err) {
      console.error('Error updating preferences:', err);
      setMessage({ type: 'error', text: 'Failed to update preferences: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // In production, this would call an API endpoint to change password
      // For now, we'll show a placeholder message
      setMessage({ type: 'info', text: 'Password change feature requires backend authentication service.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      return;
    }
    
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await deleteUserData(userId);
      localStorage.clear();
      router.push('/register');
    } catch (err) {
      console.error('Error deleting account:', err);
      setMessage({ type: 'error', text: 'Failed to delete account: ' + err.message });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>
          <div className="space-y-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-500/20 border border-green-500 text-green-200' :
            message.type === 'error' ? 'bg-red-500/20 border border-red-500 text-red-200' :
            'bg-blue-500/20 border border-blue-500 text-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-6 h-6" />
            Profile Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Display Name</label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full bg-gray-700 text-gray-500 px-4 py-3 rounded-lg cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Phone (optional)</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 mb-2">Risk Tolerance</label>
              <select
                value={profile.risk_level}
                onChange={(e) => setProfile({ ...profile, risk_level: e.target.value })}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low - Conservative investments</option>
                <option value="medium">Medium - Balanced portfolio</option>
                <option value="high">High - Aggressive growth</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleProfileUpdate}
            disabled={saving}
            className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Notification Preferences */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notification Preferences
          </h2>
          
          <div className="space-y-4">
            {Object.entries({
              emailNotifications: 'Email Notifications',
              priceAlerts: 'Price Alerts',
              portfolioUpdates: 'Portfolio Updates',
              marketNews: 'Market News',
              weeklyReports: 'Weekly Reports'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-white">{label}</span>
                <input
                  type="checkbox"
                  checked={preferences[key]}
                  onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
          
          <button
            onClick={handlePreferencesUpdate}
            disabled={saving}
            className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Password Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Security
          </h2>
          
          {!showPasswordSection ? (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-400 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Account Section */}
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Danger Zone
          </h2>
          
          {!showDeleteConfirm ? (
            <div>
              <p className="text-gray-300 mb-4">
                Once you delete your account, there is no going back. This will permanently delete your profile, portfolio, and all associated data.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-300 mb-4">
                This action cannot be undone. Please type <strong className="text-white">DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving || deleteConfirmText !== 'DELETE'}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {saving ? 'Deleting...' : 'Permanently Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
