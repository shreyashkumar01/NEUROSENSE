
import React from 'react';
import { PatientProfile, UserAccount, UserRole } from '../types';
import { Icons } from '../components/Icons';

interface ProfileViewProps {
  profile: UserAccount;
  onLogout: () => void;
  onUpdate: (updatedProfile: UserAccount) => void;
  darkMode: boolean;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onLogout, onUpdate, darkMode }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState<UserAccount>(profile);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync with prop updates
  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // VALIDATION: Image Type Check
    if (!file.type.startsWith('image/')) {
      setSaveMessage("Failed: Please upload a valid image file (JPG, PNG).");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // VALIDATION: File Size Check (Max 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      setSaveMessage("Failed: Image is too large. Max size is 2MB.");
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // OPTIMISTIC UPDATE: Show image immediately
    const objectUrl = URL.createObjectURL(file);
    const previousAvatarUrl = formData.avatarUrl;

    // Update local UI immediately
    setFormData(prev => ({ ...prev, avatarUrl: objectUrl }));

    setIsSaving(true);
    setSaveMessage("Uploading image...");

    try {
      const { dataService } = await import('../services/supabase.service');
      const publicUrl = await dataService.uploadAvatar(file);

      // Update with actual server URL
      const updatedProfile = { ...formData, avatarUrl: publicUrl };
      setFormData(updatedProfile);

      // Auto-save the new avatar URL to user profile immediately
      await dataService.updateUser(updatedProfile);

      // SYNC: Update global app state immediately
      onUpdate(updatedProfile);

      setSaveMessage("Avatar updated successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      // REVERT: If failed, go back to previous image
      setFormData(prev => ({ ...prev, avatarUrl: previousAvatarUrl }));
      setSaveMessage(`Failed: ${err.message || "Unknown error occurred"}`);
    } finally {
      setIsSaving(false);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    // VALIDATION: Phone Number
    if (formData.phone) {
      const { validatePhoneNumber } = await import('../utils/validation');
      const validation = validatePhoneNumber(formData.phone);
      if (!validation.isValid) {
        setSaveMessage(`Failed: ${validation.error}`);
        setTimeout(() => setSaveMessage(null), 3000);
        setIsSaving(false);
        return;
      }
      // Update with sanitized value
      formData.phone = validation.value;
    }

    try {
      // Lazy import to avoid circular dependency issues if any, or just direct import if fine
      const { dataService } = await import('../services/supabase.service');
      await dataService.updateUser(formData);

      // SYNC: Update global app state
      onUpdate(formData);

      setSaveMessage("Profile updated successfully.");
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error("Update failed:", err);
      setSaveMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-700 resolve-ui">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-[#1a365d] dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your clinical identity and secure session parameters.</p>
        </div>
      </header>

      {saveMessage && (
        <div className={`p-4 rounded-xl text-center text-xs font-bold uppercase tracking-widest ${saveMessage.includes('Failed') ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
          {saveMessage}
        </div>
      )}

      <section className="p-10 rounded-[3rem] border bg-white dark:bg-[#050505] border-slate-200 dark:border-white/5 shadow-xl transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-8 mb-12 pb-12 border-b border-slate-100 dark:border-white/5">
          {/* Avatar Section */}
          <div className="relative group">
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl overflow-hidden ${formData.avatarUrl ? 'bg-white dark:bg-slate-800' : 'bg-[#48c1cf] text-white text-5xl font-black shadow-[#48c1cf]/20'}`}>
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.classList.add('bg-[#48c1cf]', 'text-white', 'text-5xl', 'font-black');
                    e.currentTarget.parentElement!.textContent = formData.name.charAt(0);
                  }}
                />
              ) : (
                formData.name.charAt(0)
              )}
            </div>
            {/* Upload Trigger Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 bg-[#1a365d] dark:bg-white text-white dark:text-[#1a365d] p-3 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all border-4 border-white dark:border-[#050505] group/btn"
              title="Upload Profile Photo"
            >
              <Icons.Camera size={18} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="text-center sm:text-left w-full">
            {isEditing ? (
              <div className="mb-2">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Full Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-2xl font-black text-[#1a365d] dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 w-full focus:outline-none focus:border-[#48c1cf]"
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-black text-[#1a365d] dark:text-white">
                    {formData.name}
                  </h2>
                  {/* Verification Badges */}
                  {formData.role === UserRole.DOCTOR && formData.isVerified && (
                    <div className="flex-shrink-0 text-[#1DA1F2]" title="Medically Verified">
                      <Icons.Verified size={24} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-prism-accent hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-transparent"
                  title="Edit Profile"
                >
                  <Icons.Edit size={18} />
                </button>
              </div>
            )}

            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#48c1cf] bg-[#48c1cf]/10 px-3 py-1 rounded-full border border-[#48c1cf]/10">
                {formData.role}
              </span>
              {formData.caseId && <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">ID: {formData.caseId}</span>}
              {formData.licenseId && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">License: {formData.licenseId}</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Locked Email Card */}
          <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 cursor-not-allowed">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Lock size={12} className="text-slate-400" />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Identity (Locked)</p>
            </div>
            <p className="font-bold text-sm text-[#1a365d] dark:text-slate-200 opacity-70">{formData.email}</p>
          </div>

          {/* Editable Phone Card */}
          <div className={`p-6 rounded-2xl border border-slate-100 dark:border-white/10 transition-colors ${isEditing ? 'bg-white dark:bg-[#0B1221] border-[#48c1cf]/30 ring-1 ring-[#48c1cf]/30' : 'bg-slate-50 dark:bg-white/5'}`}>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Contact Number</p>
            {isEditing ? (
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="font-bold text-sm text-[#1a365d] dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 w-full focus:outline-none focus:border-[#48c1cf]"
              />
            ) : (
              <p className="font-bold text-sm text-[#1a365d] dark:text-slate-200">{formData.phone}</p>
            )}
          </div>

          {formData.diagnosis && (
            <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Diagnosis Protocol</p>
              <p className="font-bold text-sm text-[#1a365d] dark:text-slate-200">{formData.diagnosis}</p>
            </div>
          )}

          <div className="p-6 rounded-2xl border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Clinical Enrollment</p>
            <p className="font-bold text-sm text-[#1a365d] dark:text-slate-200">{formData.startDate}</p>
          </div>
        </div>

        {isEditing && (
          <div className="pt-12 border-t border-slate-100 dark:border-white/5 flex gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <button
              onClick={() => { setIsEditing(false); setFormData(profile); }}
              className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-transparent"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
            >
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileView;
