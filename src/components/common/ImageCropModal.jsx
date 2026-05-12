import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FiX, FiCheck, FiRotateCw, FiMaximize, FiMinimize } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ImageCropModal = ({
  image,
  aspect = 3 / 1,
  onCropComplete,
  onClose,
  title = "Crop Image",
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCropAreaComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = () => {
    onCropComplete(croppedAreaPixels);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#1e2124] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col h-[80vh] md:h-[70vh]"
        >
          {/* Header */}
          <div className="py-4 px-6 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Cropper Container */}
          <div className="relative flex-1 bg-black/40">
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={onCropChange}
              onCropComplete={onCropAreaComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              classes={{
                containerClassName: "rounded-lg",
              }}
            />
          </div>

          {/* Controls */}
          <div className="p-6 bg-[#181a1d] space-y-6">
            <div className="flex flex-col gap-4">
              {/* Zoom Control */}
              <div className="flex items-center gap-4">
                <FiMinimize className="text-gray-500" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#4facfe]"
                />
                <FiMaximize className="text-gray-500" />
              </div>

              {/* Rotation Control */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500 tracking-wider w-12">Rotate</span>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => setRotation(e.target.value)}
                  className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#4facfe]"
                />
                <button 
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-2 text-gray-400 hover:text-[#4facfe] transition-colors"
                >
                  <FiRotateCw />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-6 rounded-xl font-bold bg-linear-to-r from-[#4facfe] to-[#00f2fe] text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <FiCheck />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageCropModal;
