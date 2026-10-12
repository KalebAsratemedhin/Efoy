import { User } from "../../types/User";
import { FaCamera } from "react-icons/fa";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import { useUpdateProfilePictureMutation } from "../../redux/api/userAPI";
import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { getCroppedImageFile } from "../../lib/cropImage";
import { InlineSpinner } from "../utils/Spinner";
import { toast } from "sonner";

const ProfilePicture = ({ user }: { user: User }) => {
  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0].toUpperCase())
      .join("") || "?";
  const [updateProfilePicture, { isError, error, isSuccess, isLoading }] =
    useUpdateProfilePictureMutation();

  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const closeCropper = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleApplyCrop = async () => {
    if (!cropSrc || !croppedAreaPixels || !user?.id) return;
    setIsCropping(true);
    try {
      const file = await getCroppedImageFile(cropSrc, croppedAreaPixels);
      const preview = URL.createObjectURL(file);
      setDisplayUrl(preview);
      closeCropper();
      await updateProfilePicture({ id: user.id, file }).unwrap();
      toast.success("Photo updated.");
    } catch {
      toast.error("Could not process or upload the photo.");
    } finally {
      setIsCropping(false);
    }
  };

  const avatarSrc = displayUrl || user?.profilePic || null;

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
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center ring-2 ring-white shadow-sm">
          {avatarSrc ? (
            <img
              className="w-full h-full object-cover"
              src={avatarSrc}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xl font-semibold text-slate-500">{initials}</span>
          )}
        </div>
        <span className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <FaCamera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        </span>
      </label>
      <p className="text-xs text-slate-500">Click to upload & crop</p>
      {(isLoading || isCropping) && (
        <span className="inline-flex items-center gap-2 text-sm text-slate-600">
          <InlineSpinner /> Saving…
        </span>
      )}
      {isError && error && <FormError error={error} />}
      {isSuccess && !isLoading && <FormSuccess message="Photo updated." />}

      {cropSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crop-title"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 id="crop-title" className="text-lg font-semibold text-ink">
                Crop profile photo
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Drag to position. Use zoom to frame your face.
              </p>
            </div>

            <div className="relative h-72 sm:h-80 bg-slate-900">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="px-5 py-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="mt-2 w-full accent-accent"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCropper}
                  disabled={isCropping}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={isCropping || !croppedAreaPixels}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
                >
                  {isCropping && <InlineSpinner className="text-white" />}
                  Apply & save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
