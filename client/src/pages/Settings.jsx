import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useMutation } from '@apollo/client';
import { UPDATE_SETTINGS, UPDATE_EMAIL_CONFIG, ENABLE_TWO_FACTOR, VERIFY_TWO_FACTOR, DISABLE_TWO_FACTOR, REQUEST_PASSWORD_CHANGE, CHANGE_PASSWORD } from '../lib/graphql';
import { Bell, BellOff, Bot, Camera, FileText, Clock, Save, Loader2, Mail, Shield, Key, Copy, CheckCircle, Moon, Sun, Lock } from 'lucide-react';

const Settings = () => {
  const { user, refetchUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  
  // 2FA state
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeCode, setPasswordChangeCode] = useState('');
  const [passwordChangeStep, setPasswordChangeStep] = useState(1); // 1: enter current password, 2: verify code and set new password
  const [settings, setSettings] = useState({
    notifications: {
      enabled: user?.settings?.notifications?.enabled ?? true,
      quietHours: {
        start: user?.settings?.notifications?.quietHours?.start || '22:00',
        end: user?.settings?.notifications?.quietHours?.end || '07:00'
      },
      types: {
        partnerComplete: user?.settings?.notifications?.types?.partnerComplete ?? true,
        dailyReminder: user?.settings?.notifications?.types?.dailyReminder ?? true,
        streakMilestone: user?.settings?.notifications?.types?.streakMilestone ?? true
      }
    },
    ai: {
      coachEnabled: user?.settings?.ai?.coachEnabled ?? true,
      photoVerification: user?.settings?.ai?.photoVerification ?? true,
      recommendations: user?.settings?.ai?.recommendations ?? true,
      weeklyReports: user?.settings?.ai?.weeklyReports ?? true
    }
  });
  
  const [emailConfig, setEmailConfig] = useState({
    gmailUser: user?.emailConfig?.gmailUser || '',
    gmailAppPassword: '',
    enabled: user?.emailConfig?.enabled ?? false
  });

  const [updateSettings] = useMutation(UPDATE_SETTINGS, {
    onCompleted: () => {
      setSaving(false);
      refetchUser();
      alert('Settings saved successfully!');
    },
    onError: (error) => {
      setSaving(false);
      alert('Failed to save settings: ' + error.message);
    }
  });

  const [updateEmailConfig] = useMutation(UPDATE_EMAIL_CONFIG, {
    onCompleted: () => {
      setSavingEmail(false);
      refetchUser();
      alert('Email configuration saved successfully!');
      setShowEmailPassword(false);
    },
    onError: (error) => {
      setSavingEmail(false);
      alert('Failed to save email config: ' + error.message);
    }
  });

  const [enableTwoFactor] = useMutation(ENABLE_TWO_FACTOR, {
    onCompleted: (data) => {
      setTwoFactorData(data.enableTwoFactor);
    },
    onError: (error) => {
      alert('Failed to enable 2FA: ' + error.message);
      setShow2FASetup(false);
    }
  });

  const [verifyTwoFactor] = useMutation(VERIFY_TWO_FACTOR, {
    onCompleted: () => {
      alert('Two-factor authentication enabled successfully!');
      setShow2FASetup(false);
      setTwoFactorData(null);
      setTwoFactorCode('');
      refetchUser();
    },
    onError: (error) => {
      alert('Verification failed: ' + error.message);
    }
  });

  const [disableTwoFactor] = useMutation(DISABLE_TWO_FACTOR, {
    onCompleted: () => {
      alert('Two-factor authentication disabled');
      setShowDisable2FA(false);
      setDisableCode('');
      refetchUser();
    },
    onError: (error) => {
      alert('Failed to disable 2FA: ' + error.message);
    }
  });

  const [requestPasswordChange] = useMutation(REQUEST_PASSWORD_CHANGE, {
    onCompleted: () => {
      alert('Verification code sent to your email!');
      setPasswordChangeStep(2);
    },
    onError: (error) => {
      alert('Failed to send verification code: ' + error.message);
    }
  });

  const [changePasswordMutation] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      alert('Password changed successfully!');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordChangeCode('');
      setPasswordChangeStep(1);
    },
    onError: (error) => {
      alert('Failed to change password: ' + error.message);
    }
  });

  const handleSave = async () => {
    setSaving(true);
    await updateSettings({
      variables: { settings }
    });
  };

  const handleSaveEmail = async () => {
    if (!emailConfig.gmailUser || !emailConfig.gmailAppPassword) {
      alert('Please fill in both Gmail address and App Password');
      return;
    }
    setSavingEmail(true);
    await updateEmailConfig({
      variables: {
        gmailUser: emailConfig.gmailUser,
        gmailAppPassword: emailConfig.gmailAppPassword,
        enabled: emailConfig.enabled
      }
    });
  };

  const handleEnable2FA = async () => {
    setShow2FASetup(true);
    await enableTwoFactor();
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }
    await verifyTwoFactor({ variables: { code: twoFactorCode } });
  };

  const handleDisable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }
    await disableTwoFactor({ variables: { code: disableCode } });
  };

  const handleRequestPasswordChange = async () => {
    if (!currentPassword) {
      alert('Please enter your current password');
      return;
    }
    await requestPasswordChange({ variables: { currentPassword } });
  };

  const handleChangePassword = async () => {
    if (!passwordChangeCode || passwordChangeCode.length !== 6) {
      alert('Please enter the 6-digit verification code');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match');
      return;
    }
    await changePasswordMutation({ variables: { code: passwordChangeCode, newPassword } });
  };

  const copyBackupCodes = () => {
    if (twoFactorData?.backupCodes) {
      navigator.clipboard.writeText(twoFactorData.backupCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const toggleNotification = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        types: {
          ...prev.notifications.types,
          [key]: !prev.notifications.types[key]
        }
      }
    }));
  };

  const toggleAI = (key) => {
    setSettings(prev => ({
      ...prev,
      ai: {
        ...prev.ai,
        [key]: !prev.ai[key]
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings & Preferences</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your notification and AI preferences</p>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          {theme === 'dark' ? (
            <Moon className="w-6 h-6 text-cyan-600 dark:text-indigo-400 mr-3" />
          ) : (
            <Sun className="w-6 h-6 text-cyan-600 mr-3" />
          )}
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Appearance</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-cyan-600 dark:text-indigo-400 mr-3" />
            ) : (
              <Sun className="w-5 h-5 text-cyan-600 mr-3" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark themes</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Bell className="w-6 h-6 text-cyan-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
          <div className="flex items-center">
            {settings.notifications.enabled ? (
              <Bell className="w-5 h-5 text-green-600 mr-3" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400 mr-3" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Enable Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications and reminders</p>
            </div>
          </div>
          <button
            onClick={() => setSettings(prev => ({
              ...prev,
              notifications: {
                ...prev.notifications,
                enabled: !prev.notifications.enabled
              }
            }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.notifications.enabled ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.notifications.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Quiet Hours */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center mb-3">
            <Clock className="w-5 h-5 text-gray-600 mr-2" />
            <p className="font-medium text-gray-900 dark:text-gray-100">Quiet Hours</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={settings.notifications.quietHours.start}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    quietHours: {
                      ...prev.notifications.quietHours,
                      start: e.target.value
                    }
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={settings.notifications.quietHours.end}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    quietHours: {
                      ...prev.notifications.quietHours,
                      end: e.target.value
                    }
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-3">
          <p className="font-medium text-gray-900 mb-3">Notification Types</p>
          
          <label className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <span className="text-gray-900 dark:text-gray-100">Partner completed challenge</span>
            <input
              type="checkbox"
              checked={settings.notifications.types.partnerComplete}
              onChange={() => toggleNotification('partnerComplete')}
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <span className="text-gray-900 dark:text-gray-100">Daily check-in reminder</span>
            <input
              type="checkbox"
              checked={settings.notifications.types.dailyReminder}
              onChange={() => toggleNotification('dailyReminder')}
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <span className="text-gray-900 dark:text-gray-100">Streak milestone achievements</span>
            <input
              type="checkbox"
              checked={settings.notifications.types.streakMilestone}
              onChange={() => toggleNotification('streakMilestone')}
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
          </label>
        </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Bot className="w-6 h-6 text-cyan-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">AI Features</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:bg-gray-700">
            <div className="flex items-center">
              <Bot className="w-5 h-5 text-cyan-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">AI Coach</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized motivation and guidance</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.ai.coachEnabled}
              onChange={() => toggleAI('coachEnabled')}
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:bg-gray-700">
            <div className="flex items-center">
              <Camera className="w-5 h-5 text-cyan-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Photo Verification</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered check-in photo analysis</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.ai.photoVerification}
              onChange={() => toggleAI('photoVerification')}
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:bg-gray-700">
            <div className="flex items-center">
              <Bot className="w-5 h-5 text-cyan-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Smart Recommendations</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Challenge suggestions based on your goals</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.ai.recommendations}
              onChange={() => toggleAI('recommendations')}
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:bg-gray-700">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-cyan-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Weekly Reports</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Detailed AI-generated progress analysis</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.ai.weeklyReports}
              onChange={() => toggleAI('weeklyReports')}
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
          </label>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Mail className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Email Notifications (Gmail)</h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 mb-2">
            <strong>📧 Configure your Gmail to send email notifications</strong>
          </p>
          <p className="text-sm text-blue-700">
            You need to create a Gmail App Password. Go to your Google Account → Security → 2-Step Verification → App Passwords. 
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline ml-1">
              Create App Password →
            </a>
          </p>
        </div>

        <div className="space-y-4">
          {/* Enable Email Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Enable Email Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Send emails for invites, check-ins, and updates</p>
            </div>
            <button
              onClick={() => setEmailConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailConfig.enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Gmail Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gmail Address
            </label>
            <input
              type="email"
              placeholder="your-email@gmail.com"
              value={emailConfig.gmailUser}
              onChange={(e) => setEmailConfig(prev => ({ ...prev, gmailUser: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Gmail App Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gmail App Password
            </label>
            <input
              type={showEmailPassword ? "text" : "password"}
              placeholder="16-character app password"
              value={emailConfig.gmailAppPassword}
              onChange={(e) => setEmailConfig(prev => ({ ...prev, gmailAppPassword: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowEmailPassword(!showEmailPassword)}
              className="text-sm text-blue-600 hover:text-blue-700 mt-1"
            >
              {showEmailPassword ? 'Hide' : 'Show'} password
            </button>
          </div>

          {/* Save Email Config Button */}
          <button
            onClick={handleSaveEmail}
            disabled={savingEmail}
            className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {savingEmail ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Email Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Security Settings - 2FA & Password Change */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-green-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Security</h2>
        </div>

        {/* Password Change */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Change Password</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Update your account password with email verification</p>
          </div>
          <button
            onClick={() => setShowPasswordChange(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center font-medium"
          >
            <Lock className="w-4 h-4 mr-2" />
            Change Password
          </button>
        </div>

        {/* 2FA */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication (2FA)</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
            {user?.twoFactorEnabled && (
              <span className="inline-flex items-center mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                <CheckCircle className="w-3 h-3 mr-1" />
                Enabled
              </span>
            )}
          </div>
          {user?.twoFactorEnabled ? (
            <button
              onClick={() => setShowDisable2FA(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={handleEnable2FA}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center font-medium"
            >
              <Key className="w-4 h-4 mr-2" />
              Enable 2FA
            </button>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetup && twoFactorData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Set Up Two-Factor Authentication</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                </p>
                <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
                  <img src={twoFactorData.qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Or enter this secret manually:</p>
                <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                  {twoFactorData.secret}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Backup Codes (Save these!):</p>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <p className="text-xs text-yellow-800 mb-2">
                    Save these codes in a safe place. You can use them to access your account if you lose your authenticator.
                  </p>
                  <div className="bg-white p-2 rounded font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                    {twoFactorData.backupCodes.map((code, i) => (
                      <div key={i}>{code}</div>
                    ))}
                  </div>
                  <button
                    onClick={copyBackupCodes}
                    className="mt-2 text-xs text-cyan-600 hover:text-indigo-700 flex items-center"
                  >
                    {copiedCodes ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Codes
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter verification code from your app:
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShow2FASetup(false);
                    setTwoFactorData(null);
                    setTwoFactorCode('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerify2FA}
                  disabled={twoFactorCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>
            
            {passwordChangeStep === 1 ? (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Enter your current password. We'll send a verification code to your email.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password:
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setPasswordChangeStep(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestPasswordChange}
                    disabled={!currentPassword}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Code
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Enter the 6-digit code sent to your email and your new password.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Code:
                  </label>
                  <input
                    type="text"
                    value={passwordChangeCode}
                    onChange={(e) => setPasswordChangeCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password:
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="At least 8 characters"
                    minLength={8}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setPasswordChangeCode('');
                      setPasswordChangeStep(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={!passwordChangeCode || !newPassword || !confirmNewPassword}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Change Password
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {showDisable2FA && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Disable Two-Factor Authentication</h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Enter a verification code from your authenticator app or use a backup code to disable 2FA:
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code:
              </label>
              <input
                type="text"
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDisable2FA(false);
                  setDisableCode('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={disableCode.length !== 6}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center space-x-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;

