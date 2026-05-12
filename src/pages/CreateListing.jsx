import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCamera, FiX, FiCheckCircle, FiChevronLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { listMarketplaceItem } from "../api/api-marketplace";
import {
  notifyError,
  notifySuccess,
} from "../utils/services/toast/toast-service";
import ImageCropper from "../components/common/ImageCropper";
import "../styles/marketplace.css";

const CreateListing = () => {
  const navigate = useNavigate();
  const { theme: t } = useTheme();
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [listingType, setListingType] = useState("sale"); // sale or adoption
  const [loading, setLoading] = useState(false);

  // Preview State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Cropper State
  const [imageQueue, setImageQueue] = useState([]);
  const [isCropping, setIsCropping] = useState(false);
  const [currentImageToCrop, setCurrentImageToCrop] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    condition: "Brand New",
    location: "",
    description: "",
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const remainingSlots = 5 - images.length;
      const imagesToProcess = files.slice(0, remainingSlots);
      setImageQueue(imagesToProcess);
      processNextImage(imagesToProcess);
    }
  };

  const processNextImage = (queue) => {
    if (queue.length > 0) {
      const nextFile = queue[0];
      setCurrentImageToCrop(URL.createObjectURL(nextFile));
      setIsCropping(true);
    } else {
      setIsCropping(false);
      setCurrentImageToCrop(null);
    }
  };

  const onCropComplete = (croppedFile, croppedUrl, selectedAspect) => {
    setImages((prev) => {
      const newImages = [
        ...prev,
        {
          file: croppedFile,
          url: croppedUrl,
          aspect: selectedAspect,
        },
      ];
      setSelectedImageIndex(newImages.length - 1);
      return newImages;
    });

    const updatedQueue = imageQueue.slice(1);
    setImageQueue(updatedQueue);
    processNextImage(updatedQueue);
  };

  const onCropCancel = () => {
    const updatedQueue = imageQueue.slice(1);
    setImageQueue(updatedQueue);
    processNextImage(updatedQueue);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (selectedImageIndex >= newImages.length) {
      setSelectedImageIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      notifyError("Please upload at least one image");
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("category", category);

      // Determine listing 'type' for backend
      if (category === "pets") {
        formDataToSend.append("type", listingType); // sale or adoption
        formDataToSend.append(
          "price",
          listingType === "adoption" ? 0 : formData.price,
        );
      } else {
        formDataToSend.append(
          "type",
          category === "products" ? "product" : "sale",
        );
        formDataToSend.append("price", formData.price);
        formDataToSend.append("condition", formData.condition);
      }

      images.forEach((img) => {
        formDataToSend.append("files", img.file);
      });

      await listMarketplaceItem(formDataToSend);
      notifySuccess("Listing created successfully!");
      navigate("/marketplace");
    } catch (err) {
      console.error("Failed to create listing", err);
      notifyError(
        err.response?.data?.message ||
          "Error creating listing. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pb-32"
    >
      <div
        className="sticky top-0 z-50 px-5 py-5 flex items-center justify-between backdrop-blur-xl border-b"
        style={{
          background:
            t.background === "#0d1117"
              ? "rgba(13,17,23,0.85)"
              : "rgba(255,255,255,0.85)",
          borderColor: t.border,
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl transition-all active:scale-90"
            style={{ background: t.surface, border: `1px solid ${t.border}` }}
          >
            <FiChevronLeft size={22} />
          </button>
          <h1 className="text-xl font-black tracking-tight">
            Sales / Purchase
          </h1>
        </div>
      </div>

      <div className="px-6 py-8 md:max-w-xl md:mx-auto">
        {/* Image Upload Section */}
        <div className="mb-10">
          <label className="block text-sm font-black tracking-widest opacity-40 mb-4 ml-1">
            Photos ({images.length}/5)
          </label>

          {/* Main Large Preview */}
          <div
            className={`relative w-full rounded-[32px] overflow-hidden mb-6 bg-black/5 border-2 border-dashed transition-all duration-500 ${
              images.length > 0 ? "border-transparent" : "border-white/10"
            } ${images.length === 0 ? "aspect-square" : ""}`}
            style={{
              background: t.surface,
              borderColor: t.border,
              aspectRatio: images[selectedImageIndex]?.aspect || "1 / 1",
            }}
          >
            {images.length > 0 ? (
              <>
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={images[selectedImageIndex]?.url}
                  className="w-full h-full object-contain"
                  alt="selected preview"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(selectedImageIndex);
                    }}
                    className="p-3 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-500/20 active:scale-90 transition-all"
                  >
                    <FiX size={18} />
                  </button>
                </div>
                {/* Image Counter Badge */}
                <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-black tracking-widest border border-white/10">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="p-8 rounded-[30px] bg-[#2FBF9F]/10 text-[#2FBF9F] group-hover:scale-110 transition-all duration-300">
                  <FiCamera size={40} />
                </div>
                <span className="mt-4 font-black tracking-tight opacity-40 group-hover:opacity-100 transition-all">
                  Tap to add photos
                </span>
              </label>
            )}
          </div>

          {/* Thumbnail Grid */}
          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                    selectedImageIndex === index
                      ? "border-[#2FBF9F] scale-105 shadow-lg shadow-[#2FBF9F]/20"
                      : "border-transparent opacity-60"
                  }`}
                >
                  <img
                    src={img.url}
                    alt="thumb"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
              {images.length < 5 && (
                <label
                  className="flex-shrink-0 w-20 h-20 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-[#2FBF9F]/5 transition-all"
                  style={{ borderColor: t.border, background: t.surface }}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <FiCamera size={20} className="opacity-30" />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="block text-sm font-black tracking-widest opacity-40 mb-2.5 ml-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-4.5 rounded-3xl outline-none font-bold transition-all border appearance-none"
              style={{ background: t.surface, borderColor: t.border }}
              required
            >
              <option value="">Choose active category</option>
              <option value="pets">Pets for Sale / Adoption</option>
              <option value="products">Pet Products</option>
            </select>
          </div>

          {category === "pets" && (
            <div className="form-group animate-fadeIn">
              <label className="block text-sm font-black tracking-widest opacity-40 mb-2.5 ml-1">
                Listing Type
              </label>
              <div className="flex gap-4">
                {["sale", "adoption"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setListingType(type)}
                    className={`flex-1 py-4 rounded-2xl font-bold capitalize transition-all border ${
                      listingType === type
                        ? "bg-[#2FBF9F15] border-[#2FBF9F] text-[#2FBF9F]"
                        : "opacity-60"
                    }`}
                    style={{
                      background:
                        listingType === type ? "#2FBF9F15" : t.surface,
                      borderColor: listingType === type ? "#2FBF9F" : t.border,
                      color: listingType === type ? "#2FBF9F" : t.text,
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="block text-sm font-black tracking-widest opacity-40 mb-2.5 ml-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder={
                category === "pets"
                  ? "e.g. Friendly Golden Retriever"
                  : "e.g. Dog Harness"
              }
              className="w-full p-4.5 rounded-3xl outline-none font-bold transition-all border focus:border-[#2FBF9F] focus:ring-4 focus:ring-[#2FBF9F]/10"
              style={{ background: t.surface, borderColor: t.border }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {listingType === "sale" && (
              <div className="form-group animate-fadeIn">
                <label className="block text-sm font-black tracking-widest opacity-40 mb-2.5 ml-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                  className="w-full p-4.5 rounded-3xl outline-none font-bold transition-all border focus:border-[#2FBF9F] focus:ring-4 focus:ring-[#2FBF9F]/10"
                  style={{ background: t.surface, borderColor: t.border }}
                />
              </div>
            )}

            {(category === "products" || category === "") && (
              <div className="form-group animate-fadeIn">
                <label className="block text-sm font-black tracking-widest opacity-40 mb-2.5 ml-1">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full p-4.5 rounded-3xl outline-none font-bold transition-all border appearance-none"
                  style={{ background: t.surface, borderColor: t.border }}
                >
                  <option>Brand New</option>
                  <option>Like New</option>
                  <option>Used / Good</option>
                </select>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="block text-sm font-black tracking-widest opacity-40 mb-2.5 ml-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder="City, Area"
              className="w-full p-4.5 rounded-3xl outline-none font-bold transition-all border focus:border-[#2FBF9F] focus:ring-4 focus:ring-[#2FBF9F]/10"
              style={{ background: t.surface, borderColor: t.border }}
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-black tracking-widest opacity-40 mb-2.5 ml-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="5"
              placeholder="Describe your item, pet or service in detail..."
              className="w-full p-5 rounded-[32px] outline-none font-bold transition-all border resize-none focus:border-[#2FBF9F] focus:ring-4 focus:ring-[#2FBF9F]/10"
              style={{ background: t.surface, borderColor: t.border }}
            ></textarea>
          </div>

          <div
            className="my-10 p-5 rounded-3xl flex gap-4 items-start"
            style={{ background: "#2FBF9F15", border: "1px solid #2FBF9F30" }}
          >
            <FiCheckCircle className="text-[#2FBF9F] mt-0.5" size={20} />
            <p className="text-sm font-bold text-[#208a73] leading-relaxed">
              Your listing will be reviewed by our team before going public. We
              prioritize animal safety and community trust.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-[24px] font-black text-xl shadow-2xl active:scale-[0.97] transition-all tracking-tight disabled:opacity-50"
            style={{ background: t.buttonBg, color: t.buttonText }}
          >
            {loading ? "Publishing..." : "Publish Listing"}
          </button>
        </form>
      </div>

      {isCropping && (
        <ImageCropper
          image={currentImageToCrop}
          onCropComplete={onCropComplete}
          onCancel={onCropCancel}
        />
      )}
    </motion.div>
  );
};

export default CreateListing;
