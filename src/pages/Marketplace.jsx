import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiMapPin,
  FiList,
  FiCheckCircle,
  FiStar,
  FiClock,
  FiShield,
  FiMessageCircle,
  FiAward,
  FiUser,
  FiX,
  FiCrosshair,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { fetchMarketplaceItems } from "../api/api-marketplace";
import {
  fetchVets,
  fetchGroomers,
  fetchShops,
  fetchKennels,
  fetchBreeders,
} from "../api/api-service";
import "../styles/marketplace.css";

const categories = [
  { id: "all", label: "All" },
  { id: "pets", label: "Pets / Adoption" },
  { id: "products", label: "Pet Products" },
  { id: "shop", label: "Pet Shop" },
  { id: "doctor", label: "Doctor" },
  { id: "groomer", label: "Groomer" },
  { id: "boarding", label: "Kennel" },
  { id: "breeders", label: "Breeder" },
];

const popularCities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Gurgaon",
  "Noida",
  "Chandigarh",
  "Indore",
  "Bhopal",
];

const mockListings = [
  {
    id: 1,
    category: "pets",
    title: "Golden Retriever Puppy",
    price: "25,000",
    location: "Mumbai, MH",
    seller: "Raj Pet Shop",
    isVerified: true,
    time: "2h ago",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    category: "products",
    title: "Premium Dog Food 10kg Pack",
    price: "1,200",
    location: "Bangalore, KA",
    seller: "TailCare Store",
    isVerified: true,
    time: "5h ago",
    image:
      "https://images.unsplash.com/photo-1589924691106-073b19f553a7?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 8,
    category: "products",
    title: "Eco-Friendly Pet Toy Bundle",
    price: "450",
    location: "Hyderabad, TS",
    seller: "GreenPet Co.",
    isVerified: true,
    time: "2h ago",
    image:
      "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    category: "pets",
    title: "Persian Cat for Adoption",
    price: "Free",
    location: "Delhi, NCR",
    seller: "Anita Sharma",
    isVerified: false,
    time: "1h ago",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 4,
    category: "boarding",
    title: "Professional Pet Grooming & Boarding",
    price: "800",
    location: "Pune, MH",
    seller: "Grooming Pro",
    isVerified: true,
    time: "10h ago",
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 5,
    category: "breeders",
    title: "Certified Labrador Breeder",
    price: "15,000",
    location: "Chennai, TN",
    seller: "K9 Kennels",
    isVerified: true,
    time: "3h ago",
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 6,
    category: "doctor",
    title: "Dr. Smith Pet Clinic",
    price: "500",
    location: "Mumbai, MH",
    seller: "Dr. Smith",
    isVerified: true,
    time: "1h ago",
    image:
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=400",
    specialization: "General Vet",
    experience: "10+ Years",
  },
  {
    id: 7,
    category: "doctor",
    title: "Global Pet Hospital",
    price: "800",
    location: "Delhi, NCR",
    seller: "Dr. Khanna",
    isVerified: true,
    time: "30m ago",
    image:
      "https://images.unsplash.com/photo-1576202733227-cf70e065bc52?auto=format&fit=crop&q=80&w=400",
    specialization: "Surgeon",
    experience: "15+ Years",
  },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const locationRef = React.useRef(null);
  const sortRef = React.useRef(null);
  const tabsRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { user: currentUser } = useContext(AuthContext);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [debouncedLocation, setDebouncedLocation] = useState("");
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({});
  const { theme: t } = useTheme();
  const isDark = t.background === "#0d1117";

  // Debounce location search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(location);
    }, 500);
    return () => clearTimeout(timer);
  }, [location]);

  // Click outside handlers
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationSuggestions(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categoryCounts]);

  const scroll = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleGeolocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Using a free reverse geocoding API (BigDataCloud or similar)
            // For production, you'd use Google Maps or Mapbox
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
            );
            const data = await response.json();
            const city =
              data.city || data.locality || data.principalSubdivision;
            if (city) {
              setLocation(city);
            }
          } catch (error) {
            console.error("Error getting location name", error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error", error);
          setLoading(false);
        },
      );
    }
  };

  const searchBg = isDark ? "rgba(13,17,23,0.94)" : "rgba(255,255,255,0.94)";
  const inputBg = isDark ? "#1a1f27" : "#f4f4f4";
  const btnBg = isDark ? "#1a1f27" : "#f0f0f0";

  const sortOptions = [
    {
      id: "createdAt-desc",
      label: "Newest First",
      sortBy: "createdAt",
      order: "desc",
    },
    {
      id: "price-asc",
      label: "Price: Low to High",
      sortBy: "price",
      order: "asc",
    },
    {
      id: "price-desc",
      label: "Price: High to Low",
      sortBy: "price",
      order: "desc",
    },
    { id: "views-desc", label: "Most Popular", sortBy: "views", order: "desc" },
  ];

  const handleSortChange = (option) => {
    setSortBy(option.sortBy);
    setOrder(option.order);
    setShowSortMenu(false);
  };

  const handleLocationSelect = (city) => {
    setLocation(city);
    setShowLocationSuggestions(false);
  };

  // Fetch Category Totals
  React.useEffect(() => {
    const fetchTotals = async () => {
      try {
        const params = { location: debouncedLocation, limit: 1 };
        const [mRes, vRes, sRes, gRes, kRes, bRes] = await Promise.all([
          fetchMarketplaceItems(params),
          fetchVets(params),
          fetchShops(params),
          fetchGroomers(params),
          fetchKennels(params),
          fetchBreeders(params),
        ]);

        // Note: mRes total is shared between pets and products
        // For accurate split, we'd need separate category calls
        // or just accept the combined total for marketplace.
        // Let's do a quick split fetch for accuracy as requested by UX
        const [petsRes, prodsRes] = await Promise.all([
          fetchMarketplaceItems({ ...params, category: "pets" }),
          fetchMarketplaceItems({ ...params, category: "products" }),
        ]);

        const totals = {
          all: 0,
          pets: petsRes.data.data.pagination.total,
          products: prodsRes.data.data.pagination.total,
          doctor: vRes.data.data.pagination.total,
          shop: sRes.data.data.pagination.total,
          groomer: gRes.data.data.pagination.total,
          boarding: kRes.data.data.pagination.total,
          breeders: bRes.data.data.pagination.total,
        };
        totals.all = Object.values(totals).reduce((a, b) => a + b, 0);
        setCategoryCounts(totals);
      } catch (err) {
        console.error("Failed to fetch totals", err);
      }
    };
    fetchTotals();
  }, [debouncedLocation]);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let res;
        const params = { sortBy, order };
        if (debouncedLocation) {
          params.location = debouncedLocation;
        }

        switch (activeCategory) {
          case "doctor":
            res = await fetchVets(params);
            setListings(
              res.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "vet",
              })),
            );
            break;
          case "shop":
            res = await fetchShops(params);
            setListings(
              res.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "shop",
              })),
            );
            break;
          case "groomer":
            res = await fetchGroomers(params);
            setListings(
              res.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "groomer",
              })),
            );
            break;
          case "boarding":
            res = await fetchKennels(params);
            setListings(
              res.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "kennel",
              })),
            );
            break;
          case "breeders":
            res = await fetchBreeders(params);
            setListings(
              res.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "breeder",
              })),
            );
            break;
          case "all":
            const [mRes, vRes, sRes, gRes, kRes, bRes] = await Promise.all([
              fetchMarketplaceItems(params),
              fetchVets(params),
              fetchShops(params),
              fetchGroomers(params),
              fetchKennels(params),
              fetchBreeders(params),
            ]);

            const combined = [
              ...(mRes.data.data.listings || []),
              ...vRes.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "vet",
              })),
              ...sRes.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "shop",
              })),
              ...gRes.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "groomer",
              })),
              ...kRes.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "kennel",
              })),
              ...bRes.data.data.profiles.map((p) => ({
                ...p,
                isService: true,
                type: "breeder",
              })),
            ];

            // Client-side sort for 'all' as it combines multiple sources
            combined.sort((a, b) => {
              let valA = a[sortBy] || 0;
              let valB = b[sortBy] || 0;

              if (sortBy === "price") {
                valA = parseFloat(a.price) || 0;
                valB = parseFloat(b.price) || 0;
              }

              if (order === "asc") return valA > valB ? 1 : -1;
              return valA < valB ? 1 : -1;
            });

            setListings(combined);
            break;
          default:
            res = await fetchMarketplaceItems({
              ...params,
              category: activeCategory,
            });
            setListings(res.data.data.listings || []);
            break;
        }
      } catch (err) {
        console.error("Failed to fetch marketplace data", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeCategory, sortBy, order, debouncedLocation]);

  const filtered = Array.isArray(listings)
    ? listings.filter((l) => {
        const title =
          l.title ||
          l.shopName ||
          l.clinicName ||
          l.kennelName ||
          l.breederName ||
          "";
        const loc = l.location || l.clinicAddress || "";
        const matchSearch =
          title.toLowerCase().includes(search.toLowerCase()) ||
          loc.toLowerCase().includes(search.toLowerCase());
        return matchSearch;
      })
    : [];

  return (
    <div
      className="marketplace-container"
      style={{ background: t.background, color: t.text }}
    >
      {/* ── Search Section ── */}
      <div className="search-section" style={{ background: t.background }}>
        <div className="search-top-row">
          <div className="search-bar-wrapper">
            <FiSearch
              className="search-icon"
              size={15}
              style={{ color: t.textDimmed }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pets, products..."
              style={{
                background: inputBg,
                color: t.text,
                borderColor: t.border,
              }}
            />
          </div>

          <div className="location-bar-wrapper" ref={locationRef}>
            <FiMapPin
              className="search-icon"
              size={15}
              style={{ color: "#2FBF9F" }}
            />
            <input
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              placeholder="Location"
              style={{
                background: inputBg,
                color: t.text,
                borderColor: t.border,
              }}
            />
            <div className="location-actions">
              {location && (
                <button
                  className="location-action-btn"
                  onClick={() => setLocation("")}
                  style={{ color: t.textDimmed }}
                >
                  <FiX size={14} />
                </button>
              )}
              <button
                className="location-action-btn"
                onClick={handleGeolocation}
                style={{ color: "#2FBF9F" }}
                title="Use current location"
              >
                <FiCrosshair size={14} />
              </button>
            </div>
            <AnimatePresence>
              {showLocationSuggestions && location.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="location-suggestions shadow-xl"
                  style={{ background: t.surface, borderColor: t.border }}
                >
                  <div className="suggestion-list">
                    {popularCities
                      .filter((city) =>
                        city.toLowerCase().includes(location.toLowerCase()),
                      )
                      .map((city) => (
                        <div
                          key={city}
                          className="suggestion-item"
                          onClick={() => handleLocationSelect(city)}
                          style={{ color: t.text }}
                        >
                          <FiMapPin size={12} className="mr-2" />
                          {city}
                        </div>
                      ))}
                    {location && (
                      <div
                        className="suggestion-item font-bold"
                        onClick={() => setShowLocationSuggestions(false)}
                        style={{ color: "#2FBF9F" }}
                      >
                        Search for "{location}"
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/marketplace/my-listings"
            className="filter-btn"
            title="My Listings"
            style={{ background: btnBg, borderColor: t.border, color: t.text }}
          >
            <FiList size={18} />
          </Link>
          <div className="relative" ref={sortRef}>
            <div
              className={`filter-btn ${showSortMenu ? "active" : ""}`}
              onClick={() => setShowSortMenu(!showSortMenu)}
              style={{
                background: showSortMenu ? "#2FBF9F" : btnBg,
                borderColor: showSortMenu ? "#2FBF9F" : t.border,
                color: showSortMenu ? "#ffffff" : t.text,
              }}
            >
              <FiFilter size={18} />
            </div>

            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="sort-menu-dropdown shadow-2xl"
                  style={{
                    background: t.surface,
                    borderColor: t.border,
                    color: t.text,
                  }}
                >
                  <p
                    className="sort-menu-header"
                    style={{ color: t.textDimmed }}
                  >
                    Sort By
                  </p>
                  {sortOptions.map((opt) => (
                    <div
                      key={opt.id}
                      className={`sort-option ${sortBy === opt.sortBy && order === opt.order ? "active" : ""}`}
                      onClick={() => handleSortChange(opt)}
                      style={{
                        background:
                          sortBy === opt.sortBy && order === opt.order
                            ? "#2FBF9F15"
                            : "transparent",
                      }}
                    >
                      <span
                        style={{
                          color:
                            sortBy === opt.sortBy && order === opt.order
                              ? "#2FBF9F"
                              : t.text,
                        }}
                      >
                        {opt.label}
                      </span>
                      {sortBy === opt.sortBy && order === opt.order && (
                        <FiCheckCircle size={14} className="text-[#2FBF9F]" />
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Category Chips (Now inside sticky header) ── */}
        <div className="category-tabs-wrapper">
          <AnimatePresence>
            {canScrollLeft && (
              <>
                <div className="scroll-fade left" style={{ background: `linear-gradient(to right, ${t.background}, transparent)` }} />
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="scroll-btn left"
                  onClick={() => scroll("left")}
                  style={{ background: t.surface, color: t.text, borderColor: t.border }}
                >
                  <FiChevronLeft size={20} />
                </motion.button>
              </>
            )}
          </AnimatePresence>

          <div
            className="category-tabs"
            ref={tabsRef}
            onScroll={checkScroll}
            style={{ background: t.background }}
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                whileTap={{ scale: 0.92 }}
                className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: activeCategory === cat.id ? "#2FBF9F" : btnBg,
                  color: activeCategory === cat.id ? "#ffffff" : t.textDimmed,
                  borderColor:
                    activeCategory === cat.id ? "#2FBF9F" : "transparent",
                }}
              >
                <span>{cat.label}</span>
                {categoryCounts[cat.id] !== undefined && (
                  <span className="opacity-60 text-[10px] ml-1">
                    ({categoryCounts[cat.id]})
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {canScrollRight && (
              <>
                <div className="scroll-fade right" style={{ background: `linear-gradient(to left, ${t.background}, transparent)` }} />
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="scroll-btn right"
                  onClick={() => scroll("right")}
                  style={{ background: t.surface, color: t.text, borderColor: t.border }}
                >
                  <FiChevronRight size={20} />
                </motion.button>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="marketplace-section-label">
        <span className="text-lg font-black tracking-tight">
          {activeCategory === "all"
            ? "All Listings"
            : categories.find((c) => c.id === activeCategory)?.label}
        </span>
        {sortBy !== "createdAt" && (
          <span
            className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold"
            style={{ fontSize: "8px" }}
          >
            {sortOptions.find((o) => o.sortBy === sortBy && o.order === order)
              ?.label || "Sorted"}
          </span>
        )}
      </div>

      {/* ── Grid Layout ── */}
      <div className="listings-grid">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              key="loading-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-center py-20"
            >
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
              <p className="mt-4 text-emerald-500 font-bold">
                Fetching latest info...
              </p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="no-items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center py-20"
            >
              <div className="text-4xl mb-3">🐾</div>
              <p className="font-bold opacity-40" style={{ color: t.text }}>
                No verified providers found in this category
              </p>
            </motion.div>
          ) : (
            filtered.map((item, i) => {
              // Service Card Style (Doctor, Groomer, Boarding, Breeders)
              if (item.isService) {
                const cover =
                  item.clinicFrontPhoto?.url ||
                  item.logo?.url ||
                  "https://placehold.co/600x400?text=Service+Photo";
                const name =
                  item.clinicName ||
                  item.shopName ||
                  item.kennelName ||
                  item.breederName;
                const addr =
                  item.clinicAddress ||
                  (item.address
                    ? `${item.address.city}, ${item.address.state}`
                    : "Location N/A");
                const profileLink = `/profile/${item.user?._id || item.user}`;

                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="service-card group cursor-pointer flex flex-col h-full"
                    style={{ background: t.surface, borderColor: t.border }}
                    onClick={() => navigate(profileLink)}
                  >
                    <div className="service-cover-wrapper overflow-hidden relative rounded-2xl">
                      <img
                        src={cover}
                        alt={name}
                        className="service-cover h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Link
                          to={`${profileLink}?tab=reviews`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm hover:bg-white dark:hover:bg-gray-900 transition-colors cursor-pointer"
                        >
                          <FiStar
                            className="text-amber-400 fill-amber-400"
                            size={12}
                          />
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: t.text }}
                          >
                            {item.rating && item.rating > 0
                              ? item.rating.toFixed(1)
                              : "New"}
                          </span>
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-lg leading-tight flex items-center gap-1.5"
                            style={{ color: t.text }}
                          >
                            {name}
                            <FiShield
                              className="text-emerald-500 shrink-0"
                              size={16}
                            />
                          </h3>
                          <div
                            className="flex items-center gap-1.5 text-xs mt-1"
                            style={{ color: t.textDimmed }}
                          >
                            <FiMapPin
                              size={12}
                              className="text-emerald-500 shrink-0"
                            />
                            <span className="truncate">{addr}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {(item.timing || item.workingHours) && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100/50 dark:border-emerald-900/30">
                            <FiClock size={12} />
                            {item.timing || "Open Today"}
                          </div>
                        )}
                        {item.experience && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-[10px] font-bold text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100/50 dark:border-blue-900/30">
                            <FiAward size={12} />
                            {item.experience} yrs exp
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                        {item.user?._id === currentUser?._id ||
                        item.user === currentUser?._id ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(profileLink);
                            }}
                            className="w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm group-hover:shadow-md"
                          >
                            <FiUser size={18} />
                            My Profile
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/messages?userId=${item.user?._id || item.user}`,
                                );
                              }}
                              className="w-full flex items-center justify-center gap-2.5 px-6 py-3 bg-emerald-500 text-white text-sm font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 dark:shadow-none translate-y-0 group-hover:-translate-y-1"
                            >
                              <FiMessageCircle size={18} />
                              Message
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="listing-card-outer h-full"
                >
                  <Link
                    to={`/marketplace/item/${item._id}`}
                    className="listing-card flex flex-col h-full"
                    style={{ background: t.surface, borderColor: t.border }}
                  >
                    <div className="listing-image-wrapper h-40 overflow-hidden shrink-0">
                      <img
                        src={
                          item.images?.[0]?.url ||
                          item.image ||
                          "https://placehold.co/400"
                        }
                        alt={item.title}
                        className="listing-image w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="listing-info flex-1 flex flex-col p-4">
                      <div className="listing-price-row mb-1">
                        <span
                          className="listing-price font-black text-lg"
                          style={{ color: "#10b981" }}
                        >
                          {item.type === "adoption" || item.price === 0
                            ? "Free / Adoption"
                            : `₹ ${item.price}`}
                        </span>
                      </div>

                      <h3
                        className="listing-title font-bold text-sm mb-0.5 line-clamp-1"
                        style={{ color: t.text }}
                      >
                        {item.title}
                      </h3>

                      <p
                        className="listing-description text-[11px] mb-2 line-clamp-2"
                        style={{ color: t.text }}
                      >
                        {item.description}
                      </p>

                      <div
                        className="listing-location-compact flex items-center gap-1 text-[10px] mb-4"
                        style={{ color: t.text }}
                      >
                        <FiMapPin size={10} />
                        <span className="uppercase font-bold">
                          {item.location}
                        </span>
                      </div>

                      <div className="mt-auto pt-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/marketplace/item/${item._id}`);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white text-sm font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 dark:shadow-none translate-y-0 hover:-translate-y-1"
                        >
                          View More
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Marketplace;
