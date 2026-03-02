import { User } from "../../types/User";
import { FaCamera } from "react-icons/fa";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import { useUpdateProfilePictureMutation } from "../../redux/api/userAPI";
import { useState } from "react";

const ProfilePicture = ({ user }: { user: User }) => {
  const initials = user?.fullName?.split(" ").map((n) => n[0].toUpperCase()).join("") || "?";
  const [updateProfilePicture, { isError, error, isSuccess }] = useUpdateProfilePictureMutation();
  const [pic, setPic] = useState<File | null>(null);
  const [picUrl, setPicUrl] = useState<string | null>(null);
  const [picChanged, setPicChanged] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPic(file);
      setPicChanged(true);
      setPicUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (pic && user?.id) {
      await updateProfilePicture({ id: user.id, file: pic });
      setPicChanged(false);
      setPic(null);
      setPicUrl(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="profilePicture"
        onChange={onFileChange}
      />
      <label htmlFor="profilePicture" className="relative block cursor-pointer group">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center ring-2 ring-white shadow-sm">
          {picUrl ? (
            <img className="w-full h-full object-cover" src={picUrl} alt="Preview" />
          ) : user?.profilePic ? (
            <img className="w-full h-full object-cover" src={user.profilePic} alt="" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-xl font-semibold text-slate-500">{initials}</span>
          )}
        </div>
        <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <FaCamera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        </span>
      </label>
      {picChanged && (
        <button
          type="button"
          onClick={handleSave}
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          Save photo
        </button>
      )}
      {isError && error && <FormError error={error} />}
      {isSuccess && <FormSuccess message="Photo updated." />}
    </div>
  );
};

export default ProfilePicture;
