import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  updateProfile,
  updateAvatar,
  getUserRoles,
  updateCoverImage,
  removeAvatar,
  removeCoverImage,
  uploadDocs,
  getEditRequestStatus,
  createEditRequest,
  getUserProfile,
} from "../api/api-user";
import { isPlatformRole } from "../utils/roles";
import PhotoUpdateModal from "../components/common/PhotoUpdateModal";
import ImageCropModal from "../components/common/ImageCropModal";
import { getCroppedImgFile } from "../utils/image-crop-utils";
import {
  notifySuccess,
  notifyError,
} from "../utils/services/toast/toast-service";
import {
  FiCamera,
  FiCheck,
  FiChevronLeft,
  FiUser,
  FiType,
  FiEdit3,
  FiMapPin,
  FiBriefcase,
  FiInfo,
  FiHeart,
  FiShield,
  FiActivity,
  FiPhone,
  FiUpload,
  FiFileText,
  FiMap,
  FiExternalLink,
} from "react-icons/fi";
import CustomSelect from "../components/common/CustomSelect";

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
      {label}{" "}
      {props.required && <span className="text-red-500 ml-0.5 text-xs">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        {...props}
        className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-700 dark:text-gray-200 shadow-sm shadow-gray-100/20 dark:shadow-none ${props.disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/30" : ""}`}
      />
    </div>
  </div>
);

export default function EditProfile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState([]);
  const [photoModal, setPhotoModal] = useState({
    isOpen: false,
    type: "avatar",
    title: "",
  });
  const [editRequest, setEditRequest] = useState(null);
  const [showEditRequestForm, setShowEditRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    petName: "",
    breed: "",
    age: 0,
    gender: "",
    vaccinationStatus: "Unknown",
    healthStatus: "Unknown",
    role: "user",
    roleProfile: {},
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // Crop states
  const [tempImage, setTempImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState("");

  const isProfileLocked =
    user?.verificationStatus === "verified" &&
    editRequest?.status !== "approved";
  const isRoleLocked =
    (user?.role && user?.role !== "user") ||
    user?.verificationStatus === "verified";

  const isFieldDisabled = (fieldName) => {
    // Basic profile fields are always editable unless currently pending
    const basicFields = [
      "username",
      "firstName",
      "lastName",
      "bio",
      "location",
      "avatar",
      "coverImage",
    ];
    if (basicFields.includes(fieldName)) return false;

    if (user?.verificationStatus === "pending") return true;
    if (user?.verificationStatus !== "verified") return false;
    if (editRequest?.status === "approved") {
      const allowedInApproved = [
        "roleProfile.clinicName",
        "roleProfile.shopName",
        "roleProfile.kennelName",
        "roleProfile.breederName",
        "roleProfile.licenseNumber",
        "roleProfile.businessLicense",
        "roleProfile.clinicAddress",
        "roleProfile.contactInfo.phone",
        "roleProfile.googleMapsLink",
        "roleProfile.experience",
        "roleProfile.timing",
        "roleProfile.clinicFrontPhoto",
        "roleProfile.licenseCertificate",
      ];
      return !allowedInApproved.includes(fieldName);
    }

    return true; // Verified but no approved request, lock professional fields
  };

  useEffect(() => {
    if (user) {
      const firstPet = user.pets && user.pets.length > 0 ? user.pets[0] : {};
      const roleProf = { ...(user.roleProfile || {}) };

      // Initialize all possible professional fields to avoid uncontrolled input warnings
      const defaultFields = [
        "clinicName",
        "shopName",
        "kennelName",
        "breederName",
        "clinicAddress",
        "experience",
        "timing",
        "googleMapsLink",
        "licenseNumber",
        "businessLicense",
      ];
      defaultFields.forEach((field) => {
        if (roleProf[field] === undefined) roleProf[field] = "";
      });

      if (!roleProf.contactInfo) roleProf.contactInfo = { phone: "" };
      else if (!roleProf.contactInfo.phone) roleProf.contactInfo.phone = "";

      setFormData((prev) => {
        // If we already have some data and the update is just a reference change,
        // we might want to be careful. But on initial load/refresh, we must sync.
        return {
          ...prev,
          username: user.username || "",
          firstName: user.profile?.firstName || "",
          lastName: user.profile?.lastName || "",
          bio: user.profile?.bio || "",
          location: user.profile?.location || "",
          petName: firstPet.name || "",
          breed: firstPet.breed || "",
          age: firstPet.age || 0,
          gender: firstPet.gender || "",
          vaccinationStatus: firstPet.vaccinationStatus || "Unknown",
          healthStatus: firstPet.healthStatus || "Unknown",
          role: user.role || "user",
          roleProfile: roleProf,
        };
      });
      setAvatarPreview(user.profile?.avatar?.url || "");
    }
  }, [user]);

  useEffect(() => {
    const initData = async () => {
      await fetchRoles();
      if (user?._id) {
        // Fetch full profile to ensure roleProfile and verification status are up to date
        try {
          const res = await getUserProfile(user._id);
          if (res.success) {
            setUser(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch full profile", err);
        }
      }
      if (user?.verificationStatus === "verified") {
        await fetchEditRequestStatus();
      }
    };
    initData();
  }, [user?._id]);

  const fetchEditRequestStatus = async () => {
    try {
      const res = await getEditRequestStatus();
      setEditRequest(res.data);
    } catch (err) {
      console.error("Failed to fetch edit request status", err);
    }
  };

  const handleRequestEdit = async () => {
    if (!requestMessage.trim()) {
      notifyError("Please enter a reason for editing.");
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const res = await createEditRequest({ message: requestMessage });
      setEditRequest(res.data);
      setShowEditRequestForm(false);
      setRequestMessage("");
      notifySuccess("Edit request submitted!");
    } catch (err) {
      console.error("Failed to submit edit request", err);
      notifyError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await getUserRoles();
      if (res.success) {
        const rolesMap = new Map();
        Object.entries(res.data).forEach(([key, value]) => {
          if (!isPlatformRole(value)) return;

          let label = key;
          if (key === "SHOP") label = "SHOP (Pet Food & Accessories)";

          if (!rolesMap.has(label)) {
            rolesMap.set(label, value);
          }
        });

        const rolesArray = Array.from(rolesMap.entries()).map(
          ([label, id]) => ({
            id,
            label,
          }),
        );
        setRoles(rolesArray);
      }
    } catch (err) {
      console.error("Failed to fetch roles", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("roleProfile.")) {
      const fieldPath = name.split("roleProfile.")[1];
      if (fieldPath.includes(".")) {
        const [parent, child] = fieldPath.split(".");
        setFormData((prev) => ({
          ...prev,
          roleProfile: {
            ...prev.roleProfile,
            [parent]: {
              ...prev.roleProfile[parent],
              [child]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          roleProfile: {
            ...prev.roleProfile,
            [fieldPath]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDocUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append(fieldName, file);

    setImageUploading(true);
    try {
      const res = await uploadDocs(fd);
      if (res.success) {
        setFormData((prev) => ({
          ...prev,
          roleProfile: {
            ...prev.roleProfile,
            [fieldName]: res.data[fieldName],
          },
        }));
        notifySuccess(`${fieldName.replace(/([A-Z])/g, " $1")} uploaded!`);
      }
    } catch (err) {
      console.error("Doc upload failed", err);
      const errorMessage =
        err.response?.data?.message || "Failed to upload document.";
      notifyError(errorMessage);
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setTempImage(reader.result);
      setCropType(photoModal.type);
      setIsCropModalOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file, type) => {
    const fd = new FormData();
    fd.append("file", file);

    setImageUploading(true);

    try {
      if (type === "avatar") {
        const res = await updateAvatar(fd);
        setAvatarPreview(res.data.url);
        setUser({ ...user, profile: { ...user.profile, avatar: res.data } });
        notifySuccess("Profile photo updated!");
      } else {
        const res = await updateCoverImage(fd);
        setUser({
          ...user,
          profile: { ...user.profile, coverImage: res.data },
        });
        notifySuccess("Cover image updated!");
      }
      setPhotoModal({ ...photoModal, isOpen: false });
    } catch (err) {
      console.error(`${type} update failed`, err);
      const errorMessage =
        err.response?.data?.message ||
        `Failed to update ${type}. Please try again.`;
      notifyError(errorMessage);
    } finally {
      setImageUploading(false);
    }
  };

  const handleCropComplete = async (croppedAreaPixels) => {
    try {
      const croppedFile = await getCroppedImgFile(tempImage, croppedAreaPixels);
      setIsCropModalOpen(false);
      setTempImage(null);
      await uploadFile(croppedFile, cropType);
    } catch (err) {
      console.error("Crop failed", err);
      notifyError("Failed to crop image. Please try again.");
    }
  };

  const handleRemovePhoto = async () => {
    const type = photoModal.type;
    setImageUploading(true);
    try {
      if (type === "avatar") {
        await removeAvatar();
        setAvatarPreview("");
        setUser({
          ...user,
          profile: { ...user.profile, avatar: { url: "", publicId: "" } },
        });
        notifySuccess("Profile photo removed.");
      } else {
        await removeCoverImage();
        setUser({
          ...user,
          profile: { ...user.profile, coverImage: { url: "", publicId: "" } },
        });
        notifySuccess("Cover image removed.");
      }
      setPhotoModal({ ...photoModal, isOpen: false });
    } catch (err) {
      console.error(`Removing ${type} failed`, err);
      const errorMessage =
        err.response?.data?.message ||
        `Failed to remove ${type}. Please try again.`;
      notifyError(errorMessage);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation for Professional Roles
    const isVerified =
      user?.isAdminVerified || user?.verificationStatus === "verified";

    const profRoles = ["vet", "groomer", "shop", "kennel", "breeder"];

    if (!isVerified && profRoles.includes(formData.role)) {
      const { roleProfile } = formData;
      const roleLabel =
        formData.role.charAt(0) + formData.role.slice(1);

      const mandatoryFields = [];

      // Name field mapping
      if (formData.role === "vet")
        mandatoryFields.push({ key: "clinicName", label: "Clinic Name" });
      else if (formData.role === "kennel")
        mandatoryFields.push({ key: "kennelName", label: "Kennel Name" });
      else if (formData.role === "breeder")
        mandatoryFields.push({ key: "breederName", label: "Breeder Name" });
      else mandatoryFields.push({ key: "shopName", label: "Center/Shop Name" });

      // Common professional fields
      mandatoryFields.push({ key: "clinicAddress", label: "Physical Address" });

      if (
        formData.role === "vet" ||
        formData.role === "kennel" ||
        formData.role === "breeder"
      ) {
        mandatoryFields.push({ key: "licenseNumber", label: "License Number" });
      } else if (formData.role === "shop") {
        mandatoryFields.push({
          key: "businessLicense",
          label: "Business License",
        });
      }

      for (const field of mandatoryFields) {
        if (!roleProfile[field.key]) {
          notifyError(`${field.label} is mandatory for ${roleLabel} profile.`);
          return;
        }
      }

      if (!roleProfile.contactInfo?.phone) {
        notifyError(`Contact Number is mandatory for ${roleLabel} profile.`);
        return;
      }

      if (!roleProfile.clinicFrontPhoto?.url) {
        notifyError("Front Board Photo is mandatory for verification.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await updateProfile(formData);
      setUser(res.data);
      setSuccess(true);
      notifySuccess("Profile updated successfully");
      setTimeout(() => {
        setSuccess(false);
        navigate("/profile");
      }, 2000);
    } catch (err) {
      console.error("Profile update failed", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to save profile. Please try again.";
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gray-50/30 dark:bg-gray-900/10">
      {/* Premium Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-600 dark:text-gray-400"
          >
            <FiChevronLeft size={24} />
          </button>
          <h1 className="font-bold text-xl text-gray-800 dark:text-white tracking-tight">
            Edit Profile
          </h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              success
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                : "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            }`}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            ) : success ? (
              <>
                <FiCheck className="text-xl" /> Saved
              </>
            ) : (
              "Done"
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50 group/header relative">
          {/* Cover Image */}
          <div className="relative h-48 w-full bg-linear-to-r from-emerald-400/20 to-blue-400/20">
            {user?.profile?.coverImage?.url && (
              <img
                src={user.profile.coverImage.url}
                alt="cover"
                className={`w-full h-full object-cover ${imageUploading && photoModal.type === "cover" ? "opacity-30 blur-sm" : ""}`}
              />
            )}
            {imageUploading && photoModal.type === "cover" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            )}
            <button
              onClick={() =>
                !isFieldDisabled("coverImage") &&
                setPhotoModal({
                  isOpen: true,
                  type: "cover",
                  title: "Change Cover Image",
                })
              }
              className={`absolute top-4 right-4 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-xl backdrop-blur-md transition-all shadow-lg border border-white/20 ${isFieldDisabled("coverImage") ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <FiCamera size={18} />
            </button>
          </div>

          <div className="px-8 pb-8 flex flex-col items-center">
            {/* Avatar */}
            <div className="relative -mt-16">
              <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl rotate-3 group-hover/header:rotate-0 transition-transform duration-500">
                <img
                  src={avatarPreview || "https://via.placeholder.com/150"}
                  alt="avatar"
                  className={`w-full h-full object-cover ${imageUploading && photoModal.type === "avatar" ? "opacity-30 blur-sm" : ""}`}
                />
                {imageUploading && photoModal.type === "avatar" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() =>
                  !isFieldDisabled("avatar") &&
                  setPhotoModal({
                    isOpen: true,
                    type: "avatar",
                    title: "Change Profile Photo",
                  })
                }
                className={`absolute -bottom-2 -right-2 p-3 bg-emerald-500 text-white rounded-2xl shadow-lg border-4 border-white dark:border-gray-800 cursor-pointer hover:scale-110 transition-transform active:scale-95 z-10 ${isFieldDisabled("avatar") ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <FiCamera size={18} />
              </button>
            </div>

            <div className="mt-4 md:mt-8 text-center">
              <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                @{formData.username}
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                Update your identity
              </p>
            </div>
          </div>
        </div>

        {/* Identity Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none">
              <FiUser size={18} />
            </div>
            <h2 className="font-bold text-gray-800 dark:text-gray-200 tracking-tight">
              Account Identity
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-7">
            <InputField
              label="Username"
              icon={FiUser}
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="unique_username"
              disabled={isFieldDisabled("username")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                icon={FiType}
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                disabled={isFieldDisabled("firstName")}
              />
              <InputField
                label="Last Name"
                icon={FiType}
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={isFieldDisabled("lastName")}
              />
            </div>
          </div>
        </section>

        {/* Personal Details Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shadow-sm shadow-purple-100 dark:shadow-none">
              <FiEdit3 size={18} />
            </div>
            <h2 className="font-bold text-gray-800 dark:text-gray-200 tracking-tight">
              Profile Details
            </h2>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-7">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
                Bio
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <FiEdit3 size={18} />
                </div>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-gray-700 dark:text-gray-200 shadow-sm shadow-gray-100/20 dark:shadow-none resize-none"
                  placeholder="Tell your story..."
                  disabled={isFieldDisabled("bio")}
                />
              </div>
            </div>
            <InputField
              label="Location"
              icon={FiMapPin}
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              disabled={isFieldDisabled("location")}
            />
          </div>
        </section>

        {/* Role Selection Card */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="w-9 h-9 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 dark:text-orange-400 shadow-sm shadow-orange-100 dark:shadow-none">
              <FiBriefcase size={18} />
            </div>
            <h2 className="font-bold text-gray-800 dark:text-gray-200 tracking-tight">
              Role & Expertise
            </h2>
            {user?.verificationStatus === "pending" && (
              <div className="ml-auto flex flex-col items-end">
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-lg font-bold tracking-wider animate-pulse">
                  Under Review
                </span>
              </div>
            )}
            {(user?.verificationStatus === "rejected" ||
              user?.verificationStatus === "resubmit") && (
              <div className="ml-auto flex flex-col items-end">
                <span className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg font-bold tracking-wider">
                  Needs Correction
                </span>
              </div>
            )}
            {user?.verificationStatus === "verified" && (
              <div className="ml-auto flex flex-col items-end">
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg font-bold tracking-wider flex items-center gap-1">
                  <FiShield size={10} /> Verified Professional
                </span>
              </div>
            )}
          </div>

          {user?.verificationStatus === "pending" && (
            <div className="mx-2 mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <FiInfo size={16} />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                Professional details are locked while our team verifies your
                credentials. We'll notify you once approved!
              </p>
            </div>
          )}

          {user?.verificationStatus === "resubmit" && user?.reviewNotes && (
            <div className="mx-2 mb-4 p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50 rounded-2xl space-y-3">
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FiInfo size={16} />
                </div>
                <h4 className="font-bold text-xs tracking-wider">
                  Resubmission Feedback
                </h4>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 italic pl-11">
                "{user.reviewNotes}"
              </p>
            </div>
          )}

          {user?.verificationStatus === "verified" && (
            <div className="mx-2 mb-4 p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FiShield size={16} />
                  </div>
                  <h4 className="font-bold text-xs tracking-wider">
                    Edit Verified Profile
                  </h4>
                </div>
                {editRequest?.status === "pending" && (
                  <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-1 rounded-lg font-bold">
                    REQUEST PENDING
                  </span>
                )}
                {editRequest?.status === "approved" && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg font-bold">
                    EDITING ALLOWED
                  </span>
                )}
              </div>

              {!showEditRequestForm &&
                editRequest?.status !== "pending" &&
                editRequest?.status !== "approved" && (
                  <div className="pl-11 space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Professional identity and service details are locked to
                      maintain community trust. If you need to update these
                      specific details, please submit an edit request.
                    </p>
                    <button
                      onClick={() => setShowEditRequestForm(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
                    >
                      Request to edit details
                    </button>
                  </div>
                )}

              {showEditRequestForm && (
                <div className="pl-11 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Briefly explain why you need to edit your verified details..."
                    className="w-full p-4 text-sm bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    rows="3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleRequestEdit}
                      disabled={isSubmittingRequest}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmittingRequest ? "Submitting..." : "Submit Request"}
                    </button>
                    <button
                      onClick={() => setShowEditRequestForm(false)}
                      className="px-4 py-2 text-gray-400 text-xs font-bold hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {editRequest?.status === "pending" && (
                <div className="pl-11">
                  <p className="text-sm text-amber-600 font-medium">
                    Your edit request is being reviewed by our team.
                  </p>
                </div>
              )}

              {editRequest?.status === "approved" && (
                <div className="pl-11">
                  <p className="text-sm text-emerald-600 font-bold">
                    Request Approved! You can now update your details above.
                  </p>
                </div>
              )}
            </div>
          )}
          <div
            className={`bg-white dark:bg-gray-800/50 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-7 ${user?.verificationStatus === "pending" || (user?.verificationStatus === "verified" && editRequest?.status !== "approved") ? "opacity-90" : ""}`}
          >
            <CustomSelect
              label="Current Role"
              icon={FiBriefcase}
              name="role"
              value={formData.role}
              options={roles}
              onChange={handleChange}
              disabled={true}
            />

            {/* Role Specific Sub-Sections */}
            {formData.role === "user" && (
              <div className="pt-7 border-t border-gray-50 dark:border-gray-700/50 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <FiHeart size={16} />
                  <h4 className="font-bold text-[11px] tracking-[0.1em]">
                    Pet Profile Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Pet Name"
                    icon={FiHeart}
                    name="petName"
                    value={formData.petName}
                    onChange={handleChange}
                    disabled={user?.verificationStatus === "pending"}
                    placeholder="Buddy"
                  />
                  <InputField
                    label="Breed"
                    icon={FiInfo}
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    disabled={user?.verificationStatus === "pending"}
                    placeholder="Golden Retriever"
                  />
                  <InputField
                    label="Age"
                    icon={FiInfo}
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={user?.verificationStatus === "pending"}
                    placeholder="3"
                  />
                  <CustomSelect
                    label="Gender"
                    icon={FiInfo}
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={user?.verificationStatus === "pending"}
                    options={[
                      { id: "", label: "Select Gender" },
                      { id: "male", label: "Male" },
                      { id: "female", label: "Female" },
                      { id: "unknown", label: "Unknown" },
                    ]}
                  />
                  <CustomSelect
                    label="Vaccination"
                    icon={FiShield}
                    name="vaccinationStatus"
                    value={formData.vaccinationStatus}
                    onChange={handleChange}
                    options={[
                      { id: "Unknown", label: "Unknown" },
                      { id: "Up to date", label: "Up to date" },
                      { id: "Due soon", label: "Due soon" },
                      { id: "Overdue", label: "Overdue" },
                    ]}
                  />
                  <CustomSelect
                    label="Health Status"
                    icon={FiActivity}
                    name="healthStatus"
                    value={formData.healthStatus}
                    onChange={handleChange}
                    options={[
                      { id: "Unknown", label: "Unknown" },
                      { id: "Excellent", label: "Excellent" },
                      { id: "Good", label: "Good" },
                      { id: "Fair", label: "Fair" },
                      { id: "Critical", label: "Critical" },
                    ]}
                  />
                </div>
              </div>
            )}

            {formData.role === "vet" && (
              <div className="pt-4 border-t border-gray-50 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="font-bold text-sm text-emerald-600 tracking-wider">
                  Clinic & Verification Details
                </h4>

                <InputField
                  label="Clinic Name"
                  icon={FiBriefcase}
                  name="roleProfile.clinicName"
                  value={formData.roleProfile.clinicName}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.clinicName")}
                  placeholder="Pet Care Clinic"
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
                    Clinic Front Board Photo{" "}
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleDocUpload(e, "clinicFrontPhoto")}
                      accept="image/*"
                      className="hidden"
                      id="clinicFrontPhoto"
                      disabled={isFieldDisabled("roleProfile.clinicFrontPhoto")}
                    />
                    <label
                      htmlFor="clinicFrontPhoto"
                      className={`flex items-center gap-3 w-full px-5 py-4 bg-white dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl transition-all group ${isFieldDisabled("roleProfile.clinicFrontPhoto") ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.roleProfile.clinicFrontPhoto?.url ? (
                          <img
                            src={formData.roleProfile.clinicFrontPhoto.url}
                            className="w-full h-full object-cover"
                            alt="Clinic"
                          />
                        ) : (
                          <FiUpload
                            size={20}
                            className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {formData.roleProfile.clinicFrontPhoto?.url
                            ? "Board Photo Uploaded ✓"
                            : "Upload Clinic Board Photo"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isFieldDisabled("roleProfile.clinicFrontPhoto")
                            ? "Photo is verified and locked"
                            : "JPG, PNG up to 5MB"}
                        </p>
                      </div>
                      {formData.roleProfile.clinicFrontPhoto?.url && (
                        <a
                          href={formData.roleProfile.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-emerald-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink size={16} />
                        </a>
                      )}
                    </label>
                  </div>
                </div>

                <InputField
                  label="Clinic Address"
                  icon={FiMapPin}
                  name="roleProfile.clinicAddress"
                  value={formData.roleProfile.clinicAddress}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.clinicAddress")}
                  placeholder="Full Clinic Address"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Contact Number"
                    icon={FiPhone}
                    name="roleProfile.contactInfo.phone"
                    value={formData.roleProfile.contactInfo?.phone}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.contactInfo.phone")}
                    placeholder="+91 9876543210"
                    required
                  />
                  <InputField
                    label="Google Maps Link"
                    icon={FiMap}
                    name="roleProfile.googleMapsLink"
                    value={formData.roleProfile.googleMapsLink}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.googleMapsLink")}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <InputField
                  label="Clinic Hours (e.g. 9 AM - 8 PM)"
                  icon={FiActivity}
                  name="roleProfile.timing"
                  value={formData.roleProfile.timing}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.timing")}
                  placeholder="Mon - Sat: 10 AM - 7 PM"
                />

                <InputField
                  label="License Number"
                  icon={FiInfo}
                  name="roleProfile.licenseNumber"
                  value={formData.roleProfile.licenseNumber}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.licenseNumber")}
                  placeholder="VET-REG-XXXXX"
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
                    License Certificate{" "}
                    <span className="text-red-500 text-xs">*</span> (img/pdf)
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleDocUpload(e, "licenseCertificate")}
                      accept="image/*,.pdf"
                      className="hidden"
                      id="licenseCertificate"
                      disabled={isFieldDisabled(
                        "roleProfile.licenseCertificate",
                      )}
                    />
                    <label
                      htmlFor="licenseCertificate"
                      className={`flex items-center gap-3 w-full px-5 py-4 bg-white dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl transition-all group ${isFieldDisabled("roleProfile.licenseCertificate") ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.roleProfile.licenseCertificate?.url ? (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                            <FiFileText size={20} />
                          </div>
                        ) : (
                          <FiUpload
                            size={20}
                            className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {formData.roleProfile.licenseCertificate?.url
                            ? "Certificate Uploaded ✓"
                            : "Upload License Certificate"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isFieldDisabled("roleProfile.licenseCertificate")
                            ? "Document is verified and locked"
                            : "PDF, JPG, PNG up to 5MB"}
                        </p>
                      </div>
                      {formData.roleProfile.licenseCertificate?.url && (
                        <a
                          href={formData.roleProfile.licenseCertificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-emerald-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink size={16} />
                        </a>
                      )}
                    </label>
                  </div>
                </div>

                <InputField
                  label="Experience (Years)"
                  icon={FiActivity}
                  name="roleProfile.experience"
                  type="number"
                  value={formData.roleProfile.experience}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.experience")}
                  placeholder="5"
                  required
                />
              </div>
            )}

            {formData.role === "shop" && (
              <div className="pt-4 border-t border-gray-50 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="font-bold text-sm text-emerald-600 tracking-wider">
                  Shop & Verification Details
                </h4>

                <InputField
                  label="Shop Name"
                  icon={FiBriefcase}
                  name="roleProfile.shopName"
                  value={formData.roleProfile.shopName}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.shopName")}
                  placeholder="Pet Paradise Shop"
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
                    Shop Front Board Photo{" "}
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleDocUpload(e, "clinicFrontPhoto")}
                      accept="image/*"
                      className="hidden"
                      id="shopFrontPhoto"
                      disabled={
                        imageUploading ||
                        isFieldDisabled("roleProfile.clinicFrontPhoto")
                      }
                    />
                    <label
                      htmlFor="shopFrontPhoto"
                      className={`flex items-center gap-3 w-full px-5 py-4 bg-white dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl transition-all group ${isFieldDisabled("roleProfile.clinicFrontPhoto") ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.roleProfile.clinicFrontPhoto?.url ? (
                          <img
                            src={formData.roleProfile.clinicFrontPhoto.url}
                            className="w-full h-full object-cover"
                            alt="Shop"
                          />
                        ) : (
                          <FiUpload
                            size={20}
                            className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {formData.roleProfile.clinicFrontPhoto?.url
                            ? "Shop Board Uploaded ✓"
                            : "Upload Shop Board Photo"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isFieldDisabled("roleProfile.clinicFrontPhoto")
                            ? "Photo is verified and locked"
                            : "JPG, PNG up to 5MB"}
                        </p>
                      </div>
                      {formData.roleProfile.clinicFrontPhoto?.url && (
                        <a
                          href={formData.roleProfile.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-emerald-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink size={16} />
                        </a>
                      )}
                    </label>
                  </div>
                </div>

                <InputField
                  label="Shop Address"
                  icon={FiMapPin}
                  name="roleProfile.clinicAddress"
                  value={formData.roleProfile.clinicAddress}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.clinicAddress")}
                  placeholder="Full Shop Address"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Contact Number"
                    icon={FiPhone}
                    name="roleProfile.contactInfo.phone"
                    value={formData.roleProfile.contactInfo?.phone}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.contactInfo.phone")}
                    placeholder="+91 9876543210"
                    required
                  />
                  <InputField
                    label="Google Maps Link"
                    icon={FiMap}
                    name="roleProfile.googleMapsLink"
                    value={formData.roleProfile.googleMapsLink}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.googleMapsLink")}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <InputField
                  label="Business Hours (e.g. 10 AM - 9 PM)"
                  icon={FiActivity}
                  name="roleProfile.timing"
                  value={formData.roleProfile.timing}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.timing")}
                  placeholder="Mon - Sun: 10 AM - 9 PM"
                />

                <InputField
                  label="Business License"
                  icon={FiInfo}
                  name="roleProfile.businessLicense"
                  value={formData.roleProfile.businessLicense}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.businessLicense")}
                  placeholder="LIC-9988-SHOP"
                  required
                />
              </div>
            )}

            {formData.role === "kennel" && (
              <div className="pt-4 border-t border-gray-50 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="font-bold text-sm text-emerald-600 tracking-wider">
                  Kennel & Boarding Details
                </h4>

                <InputField
                  label="Kennel Name"
                  icon={FiBriefcase}
                  name="roleProfile.kennelName"
                  value={formData.roleProfile.kennelName}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.kennelName")}
                  placeholder="Royal Pet Boarding"
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
                    Kennel Front Board Photo{" "}
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleDocUpload(e, "clinicFrontPhoto")}
                      accept="image/*"
                      className="hidden"
                      id="kennelFrontPhoto"
                      disabled={
                        imageUploading ||
                        isFieldDisabled("roleProfile.clinicFrontPhoto")
                      }
                    />
                    <label
                      htmlFor="kennelFrontPhoto"
                      className={`flex items-center gap-3 w-full px-5 py-4 bg-white dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl transition-all group ${isFieldDisabled("roleProfile.clinicFrontPhoto") ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.roleProfile.clinicFrontPhoto?.url ? (
                          <img
                            src={formData.roleProfile.clinicFrontPhoto.url}
                            className="w-full h-full object-cover"
                            alt="Kennel"
                          />
                        ) : (
                          <FiUpload
                            size={20}
                            className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {formData.roleProfile.clinicFrontPhoto?.url
                            ? "Kennel Board Uploaded ✓"
                            : "Upload Kennel Board Photo"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isFieldDisabled("roleProfile.clinicFrontPhoto")
                            ? "Photo is verified and locked"
                            : "JPG, PNG up to 5MB"}
                        </p>
                      </div>
                      {formData.roleProfile.clinicFrontPhoto?.url && (
                        <a
                          href={formData.roleProfile.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-emerald-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink size={16} />
                        </a>
                      )}
                    </label>
                  </div>
                </div>

                <InputField
                  label="Kennel Address"
                  icon={FiMapPin}
                  name="roleProfile.clinicAddress"
                  value={formData.roleProfile.clinicAddress}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.clinicAddress")}
                  placeholder="Full Kennel Address"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Contact Number"
                    icon={FiPhone}
                    name="roleProfile.contactInfo.phone"
                    value={formData.roleProfile.contactInfo?.phone}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.contactInfo.phone")}
                    placeholder="+91 9876543210"
                    required
                  />
                  <InputField
                    label="Google Maps Link"
                    icon={FiMap}
                    name="roleProfile.googleMapsLink"
                    value={formData.roleProfile.googleMapsLink}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.googleMapsLink")}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <InputField
                  label="Working Hours (e.g. 24/7 or 9 AM - 9 PM)"
                  icon={FiActivity}
                  name="roleProfile.timing"
                  value={formData.roleProfile.timing}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.timing")}
                  placeholder="Open 24/7"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="License Number"
                    icon={FiInfo}
                    name="roleProfile.licenseNumber"
                    value={formData.roleProfile.licenseNumber}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.licenseNumber")}
                    placeholder="KEN-5544-REG"
                    required
                  />
                  <InputField
                    label="Pet Capacity"
                    icon={FiInfo}
                    name="roleProfile.capacity"
                    type="number"
                    value={formData.roleProfile.capacity}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.capacity")}
                    placeholder="20"
                  />
                </div>
              </div>
            )}

            {formData.role === "breeder" && (
              <div className="pt-4 border-t border-gray-50 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="font-bold text-sm text-emerald-600 tracking-wider">
                  Breeding & Verification Details
                </h4>

                <InputField
                  label="Breeder Name"
                  icon={FiBriefcase}
                  name="roleProfile.breederName"
                  value={formData.roleProfile.breederName}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.breederName")}
                  placeholder="Elite Pet Breeders"
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
                    Breeding Center Board Photo{" "}
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleDocUpload(e, "clinicFrontPhoto")}
                      accept="image/*"
                      className="hidden"
                      id="breederFrontPhoto"
                      disabled={
                        imageUploading ||
                        isFieldDisabled("roleProfile.clinicFrontPhoto")
                      }
                    />
                    <label
                      htmlFor="breederFrontPhoto"
                      className={`flex items-center gap-3 w-full px-5 py-4 bg-white dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl transition-all group ${isFieldDisabled("roleProfile.clinicFrontPhoto") ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.roleProfile.clinicFrontPhoto?.url ? (
                          <img
                            src={formData.roleProfile.clinicFrontPhoto.url}
                            className="w-full h-full object-cover"
                            alt="Breeder"
                          />
                        ) : (
                          <FiUpload
                            size={20}
                            className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {formData.roleProfile.clinicFrontPhoto?.url
                            ? "Center Board Uploaded ✓"
                            : "Upload Center Board Photo"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isFieldDisabled("roleProfile.clinicFrontPhoto")
                            ? "Photo is verified and locked"
                            : "JPG, PNG up to 5MB"}
                        </p>
                      </div>
                      {formData.roleProfile.clinicFrontPhoto?.url && (
                        <a
                          href={formData.roleProfile.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-emerald-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink size={16} />
                        </a>
                      )}
                    </label>
                  </div>
                </div>

                <InputField
                  label="Breeding Center Address"
                  icon={FiMapPin}
                  name="roleProfile.clinicAddress"
                  value={formData.roleProfile.clinicAddress}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.clinicAddress")}
                  placeholder="Full Center Address"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Contact Number"
                    icon={FiPhone}
                    name="roleProfile.contactInfo.phone"
                    value={formData.roleProfile.contactInfo?.phone}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.contactInfo.phone")}
                    placeholder="+91 9876543210"
                    required
                  />
                  <InputField
                    label="Google Maps Link"
                    icon={FiMap}
                    name="roleProfile.googleMapsLink"
                    value={formData.roleProfile.googleMapsLink}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.googleMapsLink")}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <InputField
                  label="Visiting Hours (e.g. 10 AM - 5 PM)"
                  icon={FiActivity}
                  name="roleProfile.timing"
                  value={formData.roleProfile.timing}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.timing")}
                  placeholder="Mon - Sat: 10 AM - 5 PM"
                />

                <InputField
                  label="License Number"
                  icon={FiInfo}
                  name="roleProfile.licenseNumber"
                  value={formData.roleProfile.licenseNumber}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.licenseNumber")}
                  placeholder="BRD-1122-REG"
                  required
                />
              </div>
            )}

            {formData.role === "groomer" && (
              <div className="pt-4 border-t border-gray-50 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="font-bold text-sm text-emerald-600 tracking-wider">
                  Grooming Center & Verification Details
                </h4>

                <InputField
                  label="Grooming Center Name"
                  icon={FiBriefcase}
                  name="roleProfile.shopName"
                  value={formData.roleProfile.shopName}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.shopName")}
                  placeholder="Royal Grooming Spa"
                  required
                />

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider ml-1">
                    Shop/Center Front Board Photo{" "}
                    <span className="text-red-500 text-xs">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => handleDocUpload(e, "clinicFrontPhoto")}
                      accept="image/*"
                      className="hidden"
                      id="shopFrontPhoto"
                      disabled={
                        imageUploading ||
                        isFieldDisabled("roleProfile.clinicFrontPhoto")
                      }
                    />
                    <label
                      htmlFor="shopFrontPhoto"
                      className={`flex items-center gap-3 w-full px-5 py-4 bg-white dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl transition-all group ${isFieldDisabled("roleProfile.clinicFrontPhoto") ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30"}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden shrink-0">
                        {formData.roleProfile.clinicFrontPhoto?.url ? (
                          <img
                            src={formData.roleProfile.clinicFrontPhoto.url}
                            className="w-full h-full object-cover"
                            alt="Groomer"
                          />
                        ) : (
                          <FiUpload
                            size={20}
                            className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                          {formData.roleProfile.clinicFrontPhoto?.url
                            ? "Grooming Center Uploaded ✓"
                            : "Upload Shop/Center Board Photo"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {isFieldDisabled("roleProfile.clinicFrontPhoto")
                            ? "Photo is verified and locked"
                            : "JPG, PNG up to 5MB"}
                        </p>
                      </div>
                      {formData.roleProfile.clinicFrontPhoto?.url && (
                        <a
                          href={formData.roleProfile.clinicFrontPhoto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-emerald-500 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink size={16} />
                        </a>
                      )}
                    </label>
                  </div>
                </div>

                <InputField
                  label="Grooming Center Address"
                  icon={FiMapPin}
                  name="roleProfile.clinicAddress"
                  value={formData.roleProfile.clinicAddress}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.clinicAddress")}
                  placeholder="Full Center Address"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Contact Number"
                    icon={FiPhone}
                    name="roleProfile.contactInfo.phone"
                    value={formData.roleProfile.contactInfo?.phone}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.contactInfo.phone")}
                    placeholder="+91 9876543210"
                    required
                  />
                  <InputField
                    label="Google Maps Link"
                    icon={FiMap}
                    name="roleProfile.googleMapsLink"
                    value={formData.roleProfile.googleMapsLink}
                    onChange={handleChange}
                    disabled={isFieldDisabled("roleProfile.googleMapsLink")}
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <InputField
                  label="Grooming Hours (e.g. 9 AM - 8 PM)"
                  icon={FiActivity}
                  name="roleProfile.timing"
                  value={formData.roleProfile.timing}
                  onChange={handleChange}
                  disabled={isFieldDisabled("roleProfile.timing")}
                  placeholder="Mon - Sun: 9 AM - 8 PM"
                />
              </div>
            )}
          </div>
        </section>

        {/* Global Save Button */}
        <div className="pt-8 pb-12 px-2">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-5 rounded-[2rem] font-bold text-lg transition-all shadow-xl active:scale-95 ${
              success
                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-gray-900 dark:bg-emerald-600 text-white hover:bg-black dark:hover:bg-emerald-700 shadow-gray-900/10 dark:shadow-emerald-900/20"
            } flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100`}
          >
            {loading ? (
              <>
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                Saving Updates...
              </>
            ) : success ? (
              <>
                <FiCheck size={24} /> Changes Saved!
              </>
            ) : (
              "Save Profile Changes"
            )}
          </button>
        </div>
      </div>

      {/* Photo Selection Modal */}
      <PhotoUpdateModal
        isOpen={photoModal.isOpen}
        onClose={() => setPhotoModal({ ...photoModal, isOpen: false })}
        title={photoModal.title}
        loading={imageUploading}
        onUpload={handleImageUpload}
        onRemove={handleRemovePhoto}
      />

      {isCropModalOpen && (
        <ImageCropModal
          image={tempImage}
          aspect={cropType === "cover" ? 3.5 / 1 : 1}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setIsCropModalOpen(false);
            setTempImage(null);
          }}
          title={cropType === "cover" ? "Adjust Cover Photo" : "Adjust Photo"}
        />
      )}
    </div>
  );
}
