export const USER_ROLES = {
  // Platform users
  USER: "user",
  VET: "vet",
  SHOP: "shop",
  KENNEL: "kennel",
  BREEDER: "breeder",
  GROOMER: "groomer",

  SUPER_ADMIN: "super_admin",
  VERIFICATION_ADMIN: "verification_admin",
  CONTENT_MODERATOR: "content_moderator",
  MARKETPLACE_ADMIN: "marketplace_admin",
  VET_NETWORK_ADMIN: "vet_network_admin",
  ANALYTICS: "analytics",
};

export const ADMIN_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.VERIFICATION_ADMIN,
  USER_ROLES.CONTENT_MODERATOR,
  USER_ROLES.MARKETPLACE_ADMIN,
  USER_ROLES.VET_NETWORK_ADMIN,
  USER_ROLES.ANALYTICS,
];

export const PLATFORM_ROLES = [
  USER_ROLES.USER,
  USER_ROLES.VET,
  USER_ROLES.SHOP,
  USER_ROLES.KENNEL,
  USER_ROLES.BREEDER,
  USER_ROLES.GROOMER,
];

// ── Helpers ──────────────────────────────────────────────────────────────────
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
export const isPlatformRole = (role) => PLATFORM_ROLES.includes(role);
export const isSuperAdmin = (role) => role === USER_ROLES.SUPER_ADMIN;

export const ROLE_MODULE_ACCESS = {
  [USER_ROLES.SUPER_ADMIN]: [
    "overview",
    "verification",
    "marketplace",
    "content",
    "vet-network",
    "analytics",
    "admin-management",
    "users",
    "settings",
    "edit-requests",
  ],
  [USER_ROLES.VERIFICATION_ADMIN]: [
    "overview",
    "verification",
    "edit-requests",
  ],
  [USER_ROLES.CONTENT_MODERATOR]: ["overview", "content"],
  [USER_ROLES.MARKETPLACE_ADMIN]: ["overview", "marketplace"],
  [USER_ROLES.VET_NETWORK_ADMIN]: ["overview", "vet-network"],
  [USER_ROLES.ANALYTICS]: ["overview", "analytics"],
};

export const canAccess = (role, module) => {
  const allowed = ROLE_MODULE_ACCESS[role] ?? [];
  return allowed.includes(module);
};

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: "Super Admin",
  [USER_ROLES.VERIFICATION_ADMIN]: "Verification Admin",
  [USER_ROLES.CONTENT_MODERATOR]: "Content Moderator",
  [USER_ROLES.MARKETPLACE_ADMIN]: "Marketplace Admin",
  [USER_ROLES.VET_NETWORK_ADMIN]: "Vet Network Admin",
  [USER_ROLES.ANALYTICS]: "Analytics",
  [USER_ROLES.USER]: "User",
  [USER_ROLES.VET]: "Vet",
  [USER_ROLES.SHOP]: "Shop",
  [USER_ROLES.KENNEL]: "Kennel",
  [USER_ROLES.BREEDER]: "Breeder",
  [USER_ROLES.GROOMER]: "Groomer",
};
