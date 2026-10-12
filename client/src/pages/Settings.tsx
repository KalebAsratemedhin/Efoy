import Profile from "../components/settings/Profile";

const Settings = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-slate-700 text-2xl font-bold mb-6">Settings</p>
      <p className="text-slate-600 text-sm mb-6">Manage your account and preferences.</p>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-ink">Profile</h2>
          <p className="text-slate-500 text-sm mt-0.5">Update your personal and professional information</p>
        </div>
        <div className="p-5 sm:p-6">
          <Profile />
        </div>
      </div>
    </div>
  );
};

export default Settings;
