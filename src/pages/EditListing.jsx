import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiCamera,
  FiX,
  FiCheckCircle,
  FiChevronLeft,
  FiLoader,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { fetchMarketplaceItemById } from "../api/api-marketplace";
import axios from "../api/axios";
import { notifications } from "@mantine/notifications";
import "../styles/marketplace.css";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme: t } = useTheme();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [category, setCategory] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    condition: "Brand New",
    location: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    const loadListing = async () => {
      try {
        const res = await fetchMarketplaceItemById(id);
        const data = res.data.data;
        setFormData({
          title: data.title,
          price: data.price,
          condition: data.condition || "Brand New",
          location: data.location,
          description: data.description,
          status: data.status,
        });
        setCategory(data.category);
      } catch (err) {
        console.error("Failed to fetch listing", err);
        notifications.show({
          title: "Error",
          message: "Could not load listing data",
          color: "red",
        });
        navigate("/marketplace/my-listings");
      } finally {
        setLoading(false);
      }
    };
    loadListing();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await axios.put(`/marketplace/${id}`, formData);
      notifications.show({
        title: "Success",
        message: "Listing updated successfully",
        color: "emerald",
      });
      navigate("/marketplace/my-listings");
    } catch (err) {
      console.error("Failed to update listing", err);
      notifications.show({
        title: "Error",
        message: "Failed to update listing. Please try again.",
        color: "red",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-32"
    >
      <div
        className="sticky top-0 z-50 px-5 py-5 flex items-center gap-4 backdrop-blur-xl border-b"
        style={{
          background:
            t.background === "#0d1117"
              ? "rgba(13,17,23,0.85)"
              : "rgba(255,255,255,0.85)",
          borderColor: t.border,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-2xl transition-all active:scale-90"
          style={{
            background: t.surface,
            border: `1px solid ${t.border}`,
            color: t.text,
          }}
        >
          <FiChevronLeft size={22} />
        </button>
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ color: t.text }}
        >
          Edit Listing
        </h1>
      </div>

      <div className="px-6 py-8 md:max-w-xl md:mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label
              className="block text-sm font-bold mb-2 ml-1"
              style={{ color: t.text }}
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full p-4 rounded-2xl outline-none font-medium transition-all border focus:border-emerald-500"
              style={{
                background: t.surface,
                borderColor: t.border,
                color: t.text,
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label
                className="block text-sm font-bold mb-2 ml-1"
                style={{ color: t.text }}
              >
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className="w-full p-4 rounded-2xl outline-none font-medium transition-all border focus:border-emerald-500"
                style={{
                  background: t.surface,
                  borderColor: t.border,
                  color: t.text,
                }}
              />
            </div>

            {category === "products" && (
              <div className="form-group">
                <label
                  className="block text-sm font-bold mb-2 ml-1"
                  style={{ color: t.text }}
                >
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-2xl outline-none font-medium transition-all border appearance-none"
                  style={{
                    background: t.surface,
                    borderColor: t.border,
                    color: t.text,
                  }}
                >
                  <option>Brand New</option>
                  <option>Like New</option>
                  <option>Used / Good</option>
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label
              className="block text-sm font-bold mb-2 ml-1"
              style={{ color: t.text }}
            >
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full p-4 rounded-2xl outline-none font-medium transition-all border focus:border-emerald-500"
              style={{
                background: t.surface,
                borderColor: t.border,
                color: t.text,
              }}
            />
          </div>

          <div className="form-group">
            <label
              className="block text-sm font-bold mb-2 ml-1"
              style={{ color: t.text }}
            >
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="5"
              className="w-full p-4 rounded-2xl outline-none font-medium transition-all border resize-none focus:border-emerald-500"
              style={{
                background: t.surface,
                borderColor: t.border,
                color: t.text,
              }}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
            style={{ background: "#2FBF9F", color: "#fff" }}
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default EditListing;
