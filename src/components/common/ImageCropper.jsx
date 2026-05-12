import React, { useState } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { FiX, FiCheck, FiMaximize } from "react-icons/fi";
import { getCroppedImgFile } from "../../utils/image-crop-utils";
import { useTheme } from "../../context/ThemeContext";

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const { theme: t } = useTheme();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1); // Default to 1:1
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleDone = async () => {
    try {
      const croppedFile = await getCroppedImgFile(image, croppedAreaPixels);
      onCropComplete(croppedFile, URL.createObjectURL(croppedFile), aspect);
    } catch (e) {
      console.error(e);
    }
  };

  const aspectRatios = [
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:4", value: 3 / 4 },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-xl"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div className="relative w-full max-w-lg aspect-square bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(47,191,159,0.15)] border border-white/10">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropAreaComplete}
          onZoomChange={onZoomChange}
        />
      </div>

      <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md px-6">
        {/* Zoom Control */}
        <div className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-2xl p-4 rounded-3xl border border-white/10">
          <FiMaximize className="text-[#2FBF9F]" size={18} />
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(e.target.value)}
            className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2FBF9F]"
          />
        </div>

        {/* Aspect Ratio Selection */}
        <div className="flex gap-3 justify-center w-full">
          {aspectRatios.map((ratio) => (
            <button
              key={ratio.label}
              onClick={() => setAspect(ratio.value)}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs tracking-widest transition-all duration-300 ${
                aspect === ratio.value
                  ? "bg-[#2FBF9F] text-white shadow-[0_10px_20px_rgba(47,191,159,0.3)] scale-105"
                  : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              {ratio.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between w-full gap-4 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-4.5 bg-white/5 text-white font-black rounded-[24px] border border-white/10 flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all duration-300"
          >
            <FiX size={20} />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleDone}
            className="flex-1 py-4.5 bg-[#2FBF9F] text-white font-black rounded-[24px] flex items-center justify-center gap-2 shadow-[0_20px_40px_rgba(47,191,159,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            <FiCheck size={20} />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageCropper;
