import type { Area } from "react-easy-crop";

/** Load an image URL into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (e) => reject(e));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/**
 * Crop the source image to `pixelCrop` and return a JPEG File
 * suitable for profile-picture upload (square, reasonably sized).
 */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName = "profile.jpg",
  maxSize = 512
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = Math.min(maxSize, Math.round(pixelCrop.width), Math.round(pixelCrop.height));
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.92
    );
  });

  return new File([blob], fileName.replace(/\.\w+$/, ".jpg"), {
    type: "image/jpeg",
  });
}
