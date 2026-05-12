import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  getUserProfile,
  updateAvatar,
  updateCoverImage,
  removeAvatar,
  removeCoverImage,
} from "../api/api-user";
import { followUser, unfollowUser } from "../api/api-follow";
import { getUserPosts, getTaggedPosts } from "../api/api-post";
import FollowModal from "../components/common/FollowModal";
import PhotoUpdateModal from "../components/common/PhotoUpdateModal";
import ImageCropModal from "../components/common/ImageCropModal";
import PostDetailModal from "../components/common/PostDetailModal";
import PetEditModal from "../components/common/PetEditModal";
import DeleteConfirmationModal from "../components/common/DeleteConfirmationModal";
import { updatePet, deletePet } from "../api/api-pet";
import { getCroppedImgFile } from "../utils/image-crop-utils";
import ReviewSection from "../components/common/ReviewSection";
import { useTheme } from "../context/ThemeContext";
import {
  notifySuccess,
  notifyError,
} from "../utils/services/toast/toast-service";
import {
  FiCamera,
  FiMapPin,
  FiSettings,
  FiBriefcase,
  FiAward,
  FiShoppingBag,
  FiHome,
  FiPlay,
  FiCopy,
  FiCalendar,
  FiShield,
  FiActivity,
  FiUser,
  FiStar,
  FiMoreVertical,
  FiEdit3,
  FiTrash2,
  FiPhone,
  FiMail,
  FiGlobe,
  FiMap,
  FiChevronDown,
  FiChevronUp,
  FiHeart,
  FiUsers,
} from "react-icons/fi";
import { MdVerified, MdPets } from "react-icons/md";

const PetInfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-gray-400 tracking-widest leading-none mb-1.5">
      {label}
    </p>
    <p className="font-bold text-gray-700 dark:text-gray-200 text-sm leading-tight">
      {value || "Not specified"}
    </p>
  </div>
);

const formatAddress = (address) => {
  if (typeof address === "string") return address;
  if (!address) return null;
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);
  return parts.join(", ");
};

const InfoItem = ({ label, value, icon: Icon, href }) => {
  const content = (
    <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-gray-100/50 dark:border-gray-700/50 font-bold text-gray-700 dark:text-gray-200 transition-all hover:border-emerald-500/30 group-hover:shadow-sm">
      <span className="break-words w-full leading-relaxed block text-sm">
        {value || "Not provided"}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 w-full group">
      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest leading-none ml-1">
        {Icon && <Icon size={12} className="text-emerald-500/70" />}
        {label}
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
};

export default function Profile() {
  const { user: currentUser, setUser: setAuthUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "posts",
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [followModal, setFollowModal] = useState({
    isOpen: false,
    type: "followers",
  });

  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Modal state
  const [photoModal, setPhotoModal] = useState({
    isOpen: false,
    type: "",
    title: "",
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [petMenuOpen, setPetMenuOpen] = useState(false);
  const [isPetEditModalOpen, setIsPetEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [petUpdating, setPetUpdating] = useState(false);
  const [isProfProfileOpen, setIsProfProfileOpen] = useState(
    id && user?.role !== "user" ? true : false,
  );
  const [isPetInfoOpen, setIsPetInfoOpen] = useState(true);
  
  // Crop states
  const [tempImage, setTempImage] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState("");

  const petMenuRef = useRef(null);

  const isOwnProfile = !id || id === currentUser?._id;

  // Handle click outside pet menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (petMenuRef.current && !petMenuRef.current.contains(event.target)) {
        setPetMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const targetId = id || currentUser?._id;
      if (!targetId) return;

      try {
        setLoading(true);
        const [profileRes, postsRes, taggedRes] = await Promise.all([
          getUserProfile(targetId),
          getUserPosts(targetId),
          getTaggedPosts(targetId),
        ]);

        setUser(profileRes.data);
        setIsFollowing(profileRes.data.isFollowing);

        const allPosts = postsRes.data?.posts || [];
        const allTagged = taggedRes.data?.posts || [];

        // Filter posts and reels
        const imagePosts = allPosts.filter(
          (p) =>
            p.media?.[0]?.type !== "video" &&
            !p.media?.[0]?.url?.match(/\.(mp4|mov|avi|wmv)$/),
        );
        const videoPosts = allPosts.filter(
          (p) =>
            p.media?.[0]?.type === "video" ||
            p.media?.[0]?.url?.match(/\.(mp4|mov|avi|wmv)$/),
        );

        setPosts(imagePosts);
        setReels(videoPosts);
        setTaggedPosts(allTagged);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser?._id]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setTempImage(reader.result);
      setCropType(type);
      setIsCropModalOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const uploadFile = async (file, type) => {
    const fd = new FormData();
    fd.append("file", file);

    setImageUploading(true);

    try {
      const res =
        type === "avatar" ? await updateAvatar(fd) : await updateCoverImage(fd);
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          [type]: res.data,
        },
      };
      setUser(updatedUser);
      if (isOwnProfile) setAuthUser(updatedUser);
      notifySuccess(
        `${type === "avatar" ? "Profile photo" : "Cover image"} updated successfully`,
      );
      setPhotoModal({ ...photoModal, isOpen: false });
    } catch (err) {
      console.error(`${type} update failed`, err);
      notifyError(`Failed to update ${type}. Please try again.`);
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
    const { type } = photoModal;
    setImageUploading(true);
    try {
      if (type === "avatar") {
        await removeAvatar();
      } else {
        await removeCoverImage();
      }

      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          [type]: { url: "", publicId: "" },
        },
      };
      setUser(updatedUser);
      if (isOwnProfile) setAuthUser(updatedUser);
      notifySuccess(
        `${type === "avatar" ? "Profile photo" : "Cover image"} removed successfully.`,
      );
      setPhotoModal({ ...photoModal, isOpen: false });
    } catch (err) {
      console.error(`Remove ${type} failed`, err);
      notifyError(`Failed to remove ${type}. Please try again.`);
    } finally {
      setImageUploading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user || isOwnProfile) return;

    try {
      const prevFollowing = isFollowing;
      setIsFollowing(!prevFollowing);
      setUser((prev) => ({
        ...prev,
        followersCount: prevFollowing
          ? prev.followersCount - 1
          : prev.followersCount + 1,
      }));

      if (prevFollowing) {
        await unfollowUser(user._id);
      } else {
        await followUser(user._id);
      }
    } catch (err) {
      console.error("Follow/Unfollow failed", err);

      setIsFollowing((prev) => !prev);
      setUser((prev) => ({
        ...prev,
        followersCount: !isFollowing
          ? prev.followersCount - 1
          : prev.followersCount + 1,
      }));
    }
  };

  const handleMessage = () => {
    navigate(`/messages?userId=${user._id}`);
  };

  const handlePetDelete = () => {
    if (!user.pets?.[0]?._id) return;
    setIsDeleteModalOpen(true);
    setPetMenuOpen(false);
  };

  const confirmPetDelete = async () => {
    try {
      setPetUpdating(true);
      await deletePet(user.pets[0]._id);

      const updatedUser = {
        ...user,
        pets: user.pets.slice(1),
      };

      setUser(updatedUser);
      if (isOwnProfile) setAuthUser(updatedUser);

      notifySuccess("Pet deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Pet delete failed", err);
      notifyError("Failed to delete pet. Please try again.");
    } finally {
      setPetUpdating(false);
    }
  };

  const handlePetUpdate = async (updatedData) => {
    if (!user.pets?.[0]?._id) return;

    try {
      setPetUpdating(true);
      const res = await updatePet(user.pets[0]._id, updatedData);

      const updatedUser = {
        ...user,
        pets: [res.data.data, ...user.pets.slice(1)],
      };

      setUser(updatedUser);
      if (isOwnProfile) setAuthUser(updatedUser);

      notifySuccess("Pet updated successfully");
      setIsPetEditModalOpen(false);
    } catch (err) {
      console.error("Pet update failed", err);
      notifyError("Failed to update pet. Please try again.");
    } finally {
      setPetUpdating(false);
    }
  };

  if (loading)
    return <div className="flex justify-center p-10">Loading...</div>;
  if (!user)
    return (
      <div className="flex justify-center p-10 text-gray-400">
        User not found
      </div>
    );

  return (
    <div className="flex justify-center min-h-screen pb-10">
      <div className="w-full">
        {/* Header - Cover & Avatar */}
        <div className="relative group mb-16 md:mb-8">
          <div className="rounded-none md:rounded-[2.5rem] overflow-hidden shadow-sm border-b md:border border-gray-100 dark:border-gray-800 relative h-52 md:h-80 w-full bg-linear-to-b from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-900/20">
            {user.profile?.coverImage?.url ? (
              <img
                src={user.profile.coverImage.url}
                alt="cover"
                className={`w-full h-full object-cover ${imageUploading && photoModal.type === "coverImage" ? "opacity-30 blur-sm" : ""}`}
              />
            ) : (
              <div className="w-full h-full bg-linear-to-r from-emerald-400/20 to-teal-400/20 dark:from-emerald-600/10 dark:to-teal-600/10" />
            )}

            {imageUploading && photoModal.type === "coverImage" && (
              <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin shadow-lg" />
              </div>
            )}

            {isOwnProfile && (
              <>
                <div
                  onClick={() =>
                    setPhotoModal({
                      isOpen: true,
                      type: "coverImage",
                      title: "Change Cover Photo",
                    })
                  }
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white shadow-lg">
                    <FiCamera className="text-2xl" />
                  </div>
                </div>

                <button
                  onClick={() => navigate("/settings")}
                  className="absolute top-4 right-4 z-20 p-2.5 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-xl border border-white/30 transition-all shadow-lg group-hover:opacity-100 md:opacity-100"
                >
                  <FiSettings size={20} />
                </button>
              </>
            )}
          </div>

          {/* Avatar Positioned to Overlap - Outside overflow-hidden */}
          <div className="absolute -bottom-14 left-6 md:left-10 z-30">
            <div className="relative group/avatar">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl md:rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none">
                <img
                  src={
                    user.profile?.avatar?.url ||
                    `https://ui-avatars.com/api/?name=${user.username}&background=random`
                  }
                  alt="avatar"
                  className={`w-full h-full object-cover ${imageUploading && photoModal.type === "avatar" ? "opacity-30 blur-sm" : ""}`}
                />
                {imageUploading && photoModal.type === "avatar" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <div
                  onClick={() =>
                    setPhotoModal({
                      isOpen: true,
                      type: "avatar",
                      title: "Change Profile Photo",
                    })
                  }
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-opacity shadow-inner"
                >
                  <FiCamera className="text-white text-xl" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Header - Profile Info Section */}
        <div className="relative pt-2 md:pt-0 px-6 flex flex-col items-start">
          <div className="mt-4 md:mt-8 text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold flex justify-start gap-2 items-center text-gray-800 dark:text-white tracking-tight">
                {user.username}
                {user.isAdminVerified && (
                  <MdVerified
                    className="text-blue-500 text-xl md:text-2xl"
                    title="Verified Account"
                  />
                )}
              </h2>
              {user.role !== "user" && user.isAdminVerified && (
                <div className="flex justify-start">
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg font-black tracking-wider shadow-sm border border-emerald-200/30 dark:border-emerald-800/20">
                    {user.role}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm md:text-lg font-bold text-gray-700 dark:text-gray-200">
              {user.profile?.firstName} {user.profile?.lastName}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed whitespace-pre-wrap">
              {user.profile?.bio || "No bio yet."}
            </p>

            {/* Collapsible Professional Profile Section */}
            {user.roleProfile && (user.isAdminVerified || isOwnProfile) && (
              <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
                <button
                  onClick={() => setIsProfProfileOpen(!isProfProfileOpen)}
                  className="w-full flex items-center justify-between group py-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      {user.role === "shop" && <FiShoppingBag size={18} />}
                      {user.role === "vet" && <FiUser size={18} />}
                      {user.role === "groomer" && <FiBriefcase size={18} />}
                      {(user.role === "breeder" || user.role === "kennel") && (
                        <FiHome size={18} />
                      )}
                    </div>
                    <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">
                      {user.role === "vet"
                        ? "Professional Profile"
                        : user.role === "groomer"
                          ? "Grooming Information"
                          : `${user.role} Information`}
                    </span>
                    {isOwnProfile && !user.isAdminVerified && (
                      <span className="text-[10px] bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold border border-amber-100 dark:border-amber-900/30">
                        Pending Verification
                      </span>
                    )}
                    {user.roleProfile?.rating > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab("reviews");
                          document
                            .getElementById("profile-tabs-anchor")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 rounded-full border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
                      >
                        <FiStar
                          className="text-amber-400 fill-amber-400"
                          size={12}
                        />
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">
                          {user.roleProfile.rating?.toFixed(1)}
                        </span>
                      </button>
                    )}
                  </div>
                  <div
                    className={`text-gray-400 transition-transform duration-300 ${isProfProfileOpen ? "rotate-180" : ""}`}
                  >
                    <FiChevronDown size={20} />
                  </div>
                </button>

                {isProfProfileOpen && (
                  <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    {user.role === "vet" && (
                      <>
                        <InfoItem
                          label="Clinic Name"
                          value={user.roleProfile.clinicName}
                          icon={FiHome}
                        />
                        <InfoItem
                          label="Experience"
                          value={`${user.roleProfile.experience} Years`}
                          icon={FiBriefcase}
                        />
                        <InfoItem
                          label="Contact Number"
                          value={user.roleProfile.contactInfo?.phone}
                          icon={FiPhone}
                          href={`tel:${user.roleProfile.contactInfo?.phone}`}
                        />
                        <InfoItem
                          label="Timing"
                          value={user.roleProfile.timing}
                          icon={FiActivity}
                        />
                        <div className="md:col-span-2">
                          <InfoItem
                            label="Address"
                            value={
                              user.roleProfile.clinicAddress ||
                              formatAddress(user.roleProfile.address)
                            }
                            icon={FiMapPin}
                            href={user.roleProfile.googleMapsLink}
                          />
                        </div>
                        {user.roleProfile.googleMapsLink && (
                          <div className="md:col-span-2">
                            <InfoItem
                              label="Google Maps URL"
                              value={user.roleProfile.googleMapsLink}
                              icon={FiMap}
                              href={user.roleProfile.googleMapsLink}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {user.role === "shop" && (
                      <>
                        <InfoItem
                          label="Shop Name"
                          value={user.roleProfile.shopName}
                          icon={FiShoppingBag}
                        />
                        <InfoItem
                          label="Contact Number"
                          value={user.roleProfile.contactInfo?.phone}
                          icon={FiPhone}
                          href={`tel:${user.roleProfile.contactInfo?.phone}`}
                        />
                        <InfoItem
                          label="Timing"
                          value={user.roleProfile.timing}
                          icon={FiActivity}
                        />
                        <div className="md:col-span-2">
                          <InfoItem
                            label="Location"
                            value={
                              user.roleProfile.clinicAddress ||
                              formatAddress(user.roleProfile.address)
                            }
                            icon={FiMapPin}
                            href={user.roleProfile.googleMapsLink}
                          />
                        </div>
                        {user.roleProfile.googleMapsLink && (
                          <div className="md:col-span-2">
                            <InfoItem
                              label="Google Maps URL"
                              value={user.roleProfile.googleMapsLink}
                              icon={FiMap}
                              href={user.roleProfile.googleMapsLink}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {user.role === "kennel" && (
                      <>
                        <InfoItem
                          label="Kennel Name"
                          value={user.roleProfile.kennelName}
                          icon={FiHome}
                        />
                        <InfoItem
                          label="Capacity"
                          value={`${user.roleProfile.capacity} Pets`}
                          icon={FiActivity}
                        />
                        <InfoItem
                          label="Contact Number"
                          value={user.roleProfile.contactInfo?.phone}
                          icon={FiPhone}
                          href={`tel:${user.roleProfile.contactInfo?.phone}`}
                        />
                        <InfoItem
                          label="Timing"
                          value={user.roleProfile.timing}
                          icon={FiActivity}
                        />
                        <div className="md:col-span-2">
                          <InfoItem
                            label="Location"
                            value={
                              user.roleProfile.clinicAddress ||
                              formatAddress(user.roleProfile.address)
                            }
                            icon={FiMapPin}
                            href={user.roleProfile.googleMapsLink}
                          />
                        </div>
                        {user.roleProfile.googleMapsLink && (
                          <div className="md:col-span-2">
                            <InfoItem
                              label="Google Maps URL"
                              value={user.roleProfile.googleMapsLink}
                              icon={FiMap}
                              href={user.roleProfile.googleMapsLink}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {user.role === "breeder" && (
                      <>
                        <InfoItem
                          label="Breeder Name"
                          value={user.roleProfile.breederName}
                          icon={FiHome}
                        />
                        <InfoItem
                          label="Contact Number"
                          value={user.roleProfile.contactInfo?.phone}
                          icon={FiPhone}
                          href={`tel:${user.roleProfile.contactInfo?.phone}`}
                        />
                        <InfoItem
                          label="Timing"
                          value={user.roleProfile.timing}
                          icon={FiActivity}
                        />
                        <div className="md:col-span-2">
                          <InfoItem
                            label="Location"
                            value={
                              user.roleProfile.clinicAddress ||
                              formatAddress(user.roleProfile.address)
                            }
                            icon={FiMapPin}
                            href={user.roleProfile.googleMapsLink}
                          />
                        </div>
                        {user.roleProfile.googleMapsLink && (
                          <div className="md:col-span-2">
                            <InfoItem
                              label="Google Maps URL"
                              value={user.roleProfile.googleMapsLink}
                              icon={FiMap}
                              href={user.roleProfile.googleMapsLink}
                            />
                          </div>
                        )}
                      </>
                    )}
                    {user.role === "groomer" && (
                      <>
                        <InfoItem
                          label="Grooming Center"
                          value={user.roleProfile.shopName}
                          icon={FiBriefcase}
                        />
                        <InfoItem
                          label="Contact Number"
                          value={user.roleProfile.contactInfo?.phone}
                          icon={FiPhone}
                          href={`tel:${user.roleProfile.contactInfo?.phone}`}
                        />
                        <InfoItem
                          label="Timing"
                          value={user.roleProfile.timing}
                          icon={FiActivity}
                        />
                        <div className="md:col-span-2">
                          <InfoItem
                            label="Location"
                            value={user.roleProfile.clinicAddress}
                            icon={FiMapPin}
                            href={user.roleProfile.googleMapsLink}
                          />
                        </div>
                        {user.roleProfile.googleMapsLink && (
                          <div className="md:col-span-2">
                            <InfoItem
                              label="Google Maps URL"
                              value={user.roleProfile.googleMapsLink}
                              icon={FiMap}
                              href={user.roleProfile.googleMapsLink}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Pet Information Section */}
            {user.pets?.length > 0 &&
              (user.role === "user" || user.isAdminVerified) && (
                <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <div className="flex items-center justify-between py-1">
                    <button
                      onClick={() => setIsPetInfoOpen(!isPetInfoOpen)}
                      className="flex-1 flex items-center justify-between group py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <MdPets size={18} />
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          Pet Information
                        </span>
                      </div>
                    </button>
                    <div className="flex items-center gap-3">
                      {isOwnProfile && (
                        <div className="relative" ref={petMenuRef}>
                          <button
                            onClick={() => setPetMenuOpen(!petMenuOpen)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
                          >
                            <FiMoreVertical size={20} />
                          </button>
                          {petMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                              <button
                                onClick={() => {
                                  setPetMenuOpen(false);
                                  setIsPetEditModalOpen(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                              >
                                <FiEdit3 size={16} />
                                Edit Pet
                              </button>
                              <button
                                onClick={() => {
                                  setPetMenuOpen(false);
                                  handlePetDelete();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium border-t border-gray-50 dark:border-gray-700/50"
                              >
                                <FiTrash2 size={16} />
                                Delete Pet
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      <button
                        onClick={() => setIsPetInfoOpen(!isPetInfoOpen)}
                        className={`text-gray-400 transition-transform duration-300 ${isPetInfoOpen ? "rotate-180" : ""}`}
                      >
                        <FiChevronDown size={20} />
                      </button>
                    </div>
                  </div>

                  {isPetInfoOpen && (
                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <InfoItem
                        label="Pet Name"
                        value={user.pets[0].name}
                        icon={FiHeart}
                      />
                      <InfoItem
                        label="Breed"
                        value={user.pets[0].breed}
                        icon={MdPets}
                      />
                      <InfoItem
                        label="Gender"
                        value={
                          user.pets[0].gender
                            ? user.pets[0].gender.charAt(0) +
                              user.pets[0].gender.slice(1)
                            : "Unknown"
                        }
                        icon={FiUser}
                      />
                      <InfoItem
                        label="Age"
                        value={`${user.pets[0].age} Years Old`}
                        icon={FiCalendar}
                      />
                      <InfoItem
                        label="Vaccination"
                        value={user.pets[0].vaccinationStatus}
                        icon={FiShield}
                      />
                      <InfoItem
                        label="Health Status"
                        value={user.pets[0].healthStatus}
                        icon={FiActivity}
                      />
                    </div>
                  )}
                </div>
              )}

            {isOwnProfile &&
              user.role !== "user" &&
              user.verificationStatus === "none" && (
                <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <FiShield size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-200">
                        Complete Professional Setup
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Fill in your professional details to get verified and
                        access exclusive features.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/edit-profile")}
                    className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 transition-all shadow-md shadow-emerald-200/50 dark:shadow-none whitespace-nowrap"
                  >
                    Start Verification
                  </button>
                </div>
              )}

            <div className="flex gap-3 mt-8 w-full">
              {isOwnProfile ? (
                <button
                  onClick={() => navigate("/edit-profile")}
                  className="flex-1 md:flex-none md:px-12 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-sm font-black hover:bg-black dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-200/50 dark:shadow-none flex items-center justify-center gap-2"
                >
                  <FiEdit3 size={16} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFollowToggle}
                    className={`flex-1 md:flex-none md:px-12 py-3 rounded-2xl text-sm font-black transition-all shadow-lg ${
                      isFollowing
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-none border border-gray-200 dark:border-gray-700"
                        : "bg-emerald-600 text-white shadow-emerald-200 dark:shadow-emerald-950/20 hover:bg-emerald-500"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <button
                    onClick={handleMessage}
                    className="flex-1 md:flex-none md:px-12 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-black hover:bg-gray-50 dark:hover:bg-gray-700 transition-all bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 shadow-sm flex items-center justify-center gap-2"
                  >
                    <FiMail size={16} />
                    Message
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 mt-10">
          {/* Stats */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-sm p-4 mt-6 grid grid-cols-3 text-center text-sm border border-gray-50 dark:border-gray-700/50">
            <div>
              <p className="font-bold text-gray-800 dark:text-white">
                {(user.postsCount || 0) + (user.reelsCount || 0)}
              </p>
              <p className="text-gray-400 dark:text-gray-500 font-medium text-[10px] tracking-wider">
                Posts
              </p>
            </div>

            <div
              className="cursor-pointer"
              onClick={() =>
                setFollowModal({ isOpen: true, type: "followers" })
              }
            >
              <p className="font-bold text-gray-800 dark:text-white">
                {user.followersCount || 0}
              </p>
              <p className="text-gray-400 dark:text-gray-500 font-medium text-[10px] tracking-wider">
                Followers
              </p>
            </div>

            <div
              className="cursor-pointer"
              onClick={() =>
                setFollowModal({ isOpen: true, type: "following" })
              }
            >
              <p className="font-bold text-gray-800 dark:text-white">
                {user.followingCount || 0}
              </p>
              <p className="text-gray-400 dark:text-gray-500 font-medium text-[10px] tracking-wider">
                Following
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div
            id="profile-tabs-anchor"
            className="flex justify-around border-b border-gray-100 dark:border-gray-700 mt-10 text-sm font-bold"
          >
            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-3 px-4 transition-all ${activeTab === "posts" ? "border-b-2 border-emerald-500 text-emerald-600" : "text-gray-400 dark:text-gray-500"}`}
            >
              Posts {user.postsCount > 0 && `(${user.postsCount})`}
            </button>

            <button
              onClick={() => setActiveTab("reels")}
              className={`pb-3 px-4 transition-all ${activeTab === "reels" ? "border-b-2 border-emerald-500 text-emerald-600" : "text-gray-400 dark:text-gray-500"}`}
            >
              Reels {user.reelsCount > 0 && `(${user.reelsCount})`}
            </button>
            
            <button
              onClick={() => setActiveTab("tagged")}
              className={`pb-3 px-4 transition-all ${activeTab === "tagged" ? "border-b-2 border-emerald-500 text-emerald-600" : "text-gray-400 dark:text-gray-500"}`}
            >
              Tagged {user.taggedCount > 0 && `(${user.taggedCount})`}
            </button>


            {user.roleProfile && user.isAdminVerified && (
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 px-4 transition-all ${activeTab === "reviews" ? "border-b-2 border-emerald-500 text-emerald-600" : "text-gray-400 dark:text-gray-500"}`}
              >
                Reviews
              </button>
            )}
          </div>

          {activeTab === "reviews" && (
            <ReviewSection
              targetId={user.roleProfile._id}
              targetModel={
                user.role === "vet"
                  ? "VetProfile"
                  : user.role === "groomer"
                    ? "GroomerProfile"
                    : user.role === "shop"
                      ? "ShopProfile"
                      : user.role === "kennel"
                        ? "KennelProfile"
                        : "BreederProfile"
              }
              currentUserId={currentUser?._id}
              targetOwnerId={user._id}
            />
          )}

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4 mt-6 pb-20">
            {activeTab === "posts" &&
              (posts.length > 0 ? (
                posts.map((post, i) => (
                  <div
                    key={post._id || i}
                    onClick={() => {
                      setSelectedPost(post);
                      setIsPostModalOpen(true);
                    }}
                    className="relative group aspect-square overflow-hidden rounded-xl cursor-pointer bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={post.media?.[0]?.url || "https://placehold.co/500"}
                      alt="post"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {post.media?.length > 1 && (
                      <div className="absolute top-2 right-2 text-white">
                        <FiCopy />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-sm">
                      <span className="flex items-center gap-1">
                        ❤️ {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {post.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <FiCamera size={24} className="opacity-40 text-gray-400" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-bold text-gray-500 dark:text-gray-300">
                      No posts yet
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate("/create-post")}
                        className="mt-2 px-6 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-xs tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-100/50 dark:border-emerald-800/30"
                      >
                        Share your first post
                      </button>
                    )}
                  </div>
                </div>
              ))}

            {activeTab === "reels" &&
              (reels.length > 0 ? (
                reels.map((reel, i) => (
                  <div
                    key={reel._id || i}
                    onClick={() => {
                      setSelectedPost(reel);
                      setIsPostModalOpen(true);
                    }}
                    className="relative group aspect-square overflow-hidden rounded-xl cursor-pointer bg-gray-100 dark:bg-gray-800"
                  >
                    <video
                      src={reel.media?.[0]?.url}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      muted
                      playsInline
                    />
                    <div className="absolute top-2 right-2 text-white">
                      <FiPlay />
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-sm">
                      <span className="flex items-center gap-1">
                        ❤️ {reel.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {reel.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <FiPlay size={24} className="opacity-40 text-gray-400" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-bold text-gray-500 dark:text-gray-300">
                      No reels yet
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate("/create-post")}
                        className="mt-2 px-6 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-black text-xs tracking-wider hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all border border-emerald-100/50 dark:border-emerald-800/30"
                      >
                        Share your first reel
                      </button>
                    )}
                  </div>
                </div>
              ))}

            {activeTab === "tagged" &&
              (taggedPosts.length > 0 ? (
                taggedPosts.map((post, i) => (
                  <div
                    key={post._id || i}
                    onClick={() => {
                      setSelectedPost(post);
                      setIsPostModalOpen(true);
                    }}
                    className="relative group aspect-square overflow-hidden rounded-xl cursor-pointer bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={post.media?.[0]?.url || "https://placehold.co/500"}
                      alt="tagged post"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {post.media?.length > 1 && (
                      <div className="absolute top-2 right-2 text-white">
                        <FiCopy />
                      </div>
                    )}
                    {post.media?.[0]?.type === "video" && (
                      <div className="absolute top-2 right-2 text-white">
                        <FiPlay />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold text-sm">
                      <span className="flex items-center gap-1">
                        ❤️ {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {post.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center">
                    <FiUsers size={24} className="opacity-40 text-gray-400" />
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="font-bold text-gray-500 dark:text-gray-300">
                      No tagged posts
                    </p>
                    <p className="text-xs text-center max-w-[200px] mt-1">
                      When people tag you in photos and videos, they'll appear here.
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <FollowModal
        isOpen={followModal.isOpen}
        onClose={() => setFollowModal({ ...followModal, isOpen: false })}
        userId={user._id}
        type={followModal.type}
        currentUserId={currentUser?._id}
      />

      <PhotoUpdateModal
        isOpen={photoModal.isOpen}
        title={photoModal.title}
        loading={imageUploading}
        onClose={() => setPhotoModal({ ...photoModal, isOpen: false })}
        onUpload={(e) => handleImageUpload(e, photoModal.type)}
        onRemove={handleRemovePhoto}
      />

      <PostDetailModal
        post={selectedPost}
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onUpdate={(postId, updates) => {
          setPosts((prev) =>
            prev.map((p) => (p._id === postId ? { ...p, ...updates } : p)),
          );
          setReels((prev) =>
            prev.map((p) => (p._id === postId ? { ...p, ...updates } : p)),
          );
        }}
        onDeleted={(postId) => {
          setPosts((prev) => prev.filter((p) => p._id !== postId));
          setReels((prev) => prev.filter((p) => p._id !== postId));
          setIsPostModalOpen(false);
        }}
      />

      {user.pets?.length > 0 && (
        <PetEditModal
          isOpen={isPetEditModalOpen}
          onClose={() => setIsPetEditModalOpen(false)}
          pet={user.pets[0]}
          onSave={handlePetUpdate}
          loading={petUpdating}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmPetDelete}
        title="Delete Pet"
        message={`Are you sure you want to delete ${user.pets?.[0]?.name || "this pet"}? This action will permanently remove all details from the database.`}
        loading={petUpdating}
      />

      {isCropModalOpen && (
        <ImageCropModal
          image={tempImage}
          aspect={cropType === "coverImage" ? 3.5 / 1 : 1}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setIsCropModalOpen(false);
            setTempImage(null);
          }}
          title={cropType === "coverImage" ? "Adjust Cover Photo" : "Adjust Photo"}
        />
      )}
    </div>
  );
}
