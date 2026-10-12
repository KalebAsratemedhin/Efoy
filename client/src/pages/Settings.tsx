import Profile from "../components/settings/Profile";

const Settings = () => {
  return (
    <div className="max-w-7xl mx-auto text-left">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account details and how you appear on Efoy.
        </p>
      </header>
      <Profile />
    </div>
  );
};

export default Settings;
