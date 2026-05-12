import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { useSettings } from "../../context/SettingsContext";
import Icon from "../../assets/tailcareverse-icon.png";

const InitialLoader = () => {
  const { theme: t, isDarkMode } = useTheme();
  const { settings } = useSettings();

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-colors duration-500 px-6"
      style={{ backgroundColor: t.background }}
    >
      <div className="relative mb-12">
        {/* Multipulse Ambient Effect */}
        {[1, 1.4, 1.8].map((scaleFactor, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: `${t.accent}${idx === 0 ? "40" : idx === 1 ? "20" : "10"}`,
            }}
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, scaleFactor, 1],
              opacity: [0, 0.4 - idx * 0.1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: idx * 0.5,
            }}
          />
        ))}

        {/* Central Icon HERO */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 15,
          }}
          className="relative z-10"
        >
          <div
            className="p-1 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500"
            style={{
              backgroundColor: isDarkMode ? "#1e293b" : "#ffffff",
              boxShadow: `0 30px 70px ${t.accent}25`,
              border: `3px solid ${t.accent}20`,
            }}
          >
            <motion.img
              src={settings.general.logoUrl || Icon}
              alt={`${settings.general.platformName || "TailCareVerse"} Icon`}
              className="w-36 h-36 md:w-44 md:h-44 object-cover"
              animate={{
                scale: [1, 1.04, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Accent glow behind icon */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 blur-[60px] opacity-20 rounded-full pointer-events-none"
            style={{ backgroundColor: t.accent }}
          />
        </motion.div>
      </div>

      {/* Loading Experience */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2.5 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 1, 0.3],
                backgroundColor: [`${t.accent}40`, t.accent, `${t.accent}40`],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-3"
        >
          <span
            className="text-[13px] font-black tracking-[0.8em] uppercase"
            style={{ color: t.text }}
          >
            {settings.general.platformName || "TailCareVerse"}
          </span>
          <div className="h-[1.5px] w-20 rounded-full overflow-hidden bg-white/5">
            <motion.div
              className="h-full"
              style={{ backgroundColor: t.accent }}
              animate={{ x: [-80, 80] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InitialLoader;
