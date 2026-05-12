import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Send,
  User,
  Cpu,
  Sparkles,
  History,
  MoreHorizontal,
  Info,
  ChevronDown,
  ArrowLeft,
  Trash2,
  Settings,
  ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, Menu, Text, Button, ActionIcon, Tooltip, Stack, Group, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import api from "../api/axios";
import { useSettings } from "../context/SettingsContext";

const AIAssistant = () => {
  const navigate = useNavigate();
  const { theme: t, themeConfig: config } = useTheme();
  const { settings } = useSettings();
  const platformName = settings.general.platformName || "TailCareVerse";
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hello! I am ${platformName} AI, your friendly pet care assistant. How can I help you and your furry friends today? 🐾`,
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [clearOpened, { open: openClear, close: closeClear }] = useDisclosure(false);
  const scrollRef = useRef(null);

  const getGeoLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation access denied or failed:", error.message);
      }
    );
  };

  // Get Location on Mount
  useEffect(() => {
    getGeoLocation();
  }, []);

  // Fetch History
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get("/ai/history");
        if (response.data.success && response.data.data.length > 0) {
          setMessages(response.data.data.map(m => ({
            role: m.role,
            text: m.text,
            timestamp: m.timestamp || new Date()
          })));
        }
      } catch (error) {
        console.error("Error fetching AI history:", error);
      }
    };
    fetchHistory();
  }, []);

  // Auto Scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  const handleClearChat = async () => {
    closeClear();
    try {
      const response = await api.delete("/ai/history");
      if (response.data.success) {
        setMessages([
          {
            role: "assistant",
            text: `Hello! I am ${platformName} AI, your friendly pet care assistant. How can I help you and your furry friends today? 🐾`,
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");

    // Proactive context enhancement: Ask for location if vet-related
    let currentLoc = userLocation;
    if (!currentLoc && /vet|doctor|nearby|clinic|hospital/i.test(userMsg)) {
      // Just try one more time if not set
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserLocation(loc);
          currentLoc = loc;
        });
      }
    }

    setMessages((prev) => [...prev, { role: "user", text: userMsg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await api.post("/ai/assist", {
        message: userMsg,
        latitude: currentLoc?.latitude || userLocation?.latitude,
        longitude: currentLoc?.longitude || userLocation?.longitude
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: response.data.data, timestamp: new Date() },
        ]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I'm having a little nap... 🐾 Please check your internet or try again later. 🩺",
          timestamp: new Date()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden relative pb-20 md:pb-0"
      style={{ background: t.background }}
    >
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header - Glassmorphic */}
      <div
        className="p-3 md:p-6 border-b z-20 sticky top-0 backdrop-blur-md flex items-center justify-between"
        style={{ borderColor: t.border, background: `${t.sidebar}ee` }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => navigate(-1)}
            className="md:hidden p-2 rounded-xl"
            style={{ color: t.textDimmed }}
          >
            <ArrowLeft size={20} />
          </button>
          <div
            className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center relative overflow-hidden group shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${t.buttonBg}, ${t.buttonBg}dd)`,
              color: t.buttonText
            }}
          >
            <Cpu size={20} className="md:size-[24px] group-hover:scale-110 transition-transform duration-300" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-white/20 rounded-xl md:rounded-2xl scale-125 pointer-events-none"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-xl" style={{ color: t.text, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {(settings.general.platformName ? settings.general.platformName + " AI" : "TailCare AI")}
              </h2>
              <div className="px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] md:text-[10px] font-bold text-green-500 uppercase tracking-wider">Online</span>
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Info Modal Trigger */}
          <Tooltip label="About this AI" position="bottom" withArrow>
            <ActionIcon
              variant="subtle"
              size="lg"
              radius="xl"
              onClick={open}
              style={{ color: t.textDimmed }}
              className="hover:bg-white/5"
            >
              <Info size={20} />
            </ActionIcon>
          </Tooltip>

          {/* Settings Menu (Three Dots) */}
          <Menu shadow="md" width={200} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
            <Menu.Target>
              <ActionIcon variant="subtle" size="lg" radius="xl" style={{ color: t.textDimmed }} className="hover:bg-white/5">
                <MoreHorizontal size={20} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown style={{ backgroundColor: t.sidebar, borderColor: t.border }}>
              <Menu.Label style={{ color: t.textDimmed }}>Assistant Settings</Menu.Label>
              <Menu.Item
                leftSection={<History size={16} />}
                onClick={getGeoLocation}
                style={{ color: userLocation ? "#22c55e" : t.text }}
              >
                {userLocation ? "Location Active" : "Enable Location"}
              </Menu.Item>
              <Menu.Item
                leftSection={<Trash2 size={16} />}
                color="red"
                onClick={openClear}
                style={{ fontWeight: 600 }}
              >
                Clear Conversation
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>

        {/* AI Information Modal */}
        <Modal
          opened={opened}
          onClose={close}
          title={<Title order={3} style={{ color: t.text }}>AI Assistant Information</Title>}
          centered
          radius="lg"
          padding="xl"
          overlayProps={{ blur: 5 }}
          styles={{
            content: { backgroundColor: t.background, border: `1px solid ${t.border}` },
            header: { backgroundColor: t.background, color: t.text }
          }}
        >
          <Stack gap="md">
            <Text style={{ color: t.text, lineHeight: 1.6 }}>
              This AI assistant is here to help you with your pet care journey! 🐾
            </Text>

            <Group align="flex-start" wrap="nowrap" gap="md">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 flex-shrink-0">
                <Sparkles size={20} />
              </div>
              <Text size="sm" style={{ color: t.textDimmed }}>
                Get instant answers to pet care questions, from feeding schedules to grooming tips.
              </Text>
            </Group>

            <Group align="flex-start" wrap="nowrap" gap="md">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500 flex-shrink-0">
                <ShieldCheck size={20} />
              </div>
              <Text size="sm" style={{ color: t.textDimmed }}>
                Safety first: We always recommend visiting a vet for emergencies and serious symptoms.
              </Text>
            </Group>

            <Group align="flex-start" wrap="nowrap" gap="md">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 flex-shrink-0">
                <User size={20} />
              </div>
              <Text size="sm" style={{ color: t.textDimmed }}>
                The assistant uses your location (if enabled) to suggest nearby veterinarians and services.
              </Text>
            </Group>

            <Button fullWidth onClick={close} variant="light" color="blue" radius="md" mt="lg">
              Got it, thanks! 🐾
            </Button>
          </Stack>
        </Modal>

        {/* Clear History Confirmation Modal */}
        <Modal
          opened={clearOpened}
          onClose={closeClear}
          title={<Title order={4} style={{ color: t.text }}>Clear Chat History?</Title>}
          centered
          radius="md"
          size="sm"
          styles={{
            content: { backgroundColor: t.background, border: `1px solid ${t.border}` },
            header: { backgroundColor: t.background, color: t.text }
          }}
        >
          <Stack gap="md">
            <Text size="sm" style={{ color: t.textDimmed }}>
              This will permanently delete your conversation with {platformName} AI. This action cannot be undone.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={closeClear}>Cancel</Button>
              <Button color="red" onClick={handleClearChat} leftSection={<Trash2 size={16} />}>Clear All</Button>
            </Group>
          </Stack>
        </Modal>
      </div>

      {/* Chat Space */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6 custom-scrollbar z-10"
        ref={scrollRef}
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                {/* Avatar Shadow Effect */}
                <div
                  className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md"
                  style={{
                    background: msg.role === "user" ? t.buttonBg : t.sidebar,
                    color: msg.role === "user" ? t.buttonText : t.text,
                    border: `1px solid ${t.border}`
                  }}
                >
                  {msg.role === "user" ? <User size={16} /> : <Cpu size={16} />}
                </div>

                <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start gap-1"}`}>
                  <div
                    className={`p-3 md:p-5 rounded-2xl md:rounded-3xl shadow-sm relative group transition-all duration-300 ${msg.role === "user"
                        ? "rounded-tr-none text-right"
                        : "rounded-tl-none text-left"
                      }`}
                    style={{
                      background: msg.role === "user"
                        ? `linear-gradient(135deg, ${t.buttonBg}, ${t.buttonBg}ee)`
                        : `${t.card}ee`,
                      color: msg.role === "user" ? t.buttonText : t.text,
                      border: `1px solid ${t.border}`,
                      backdropFilter: msg.role === "assistant" ? "blur(10px)" : "none",
                    }}
                  >
                    <p className="text-sm md:text-base" style={{
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      fontWeight: 400
                    }}>
                      {msg.text}
                    </p>

                    {/* Hover indicator for AI messages */}
                    {msg.role === "assistant" && (
                      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-1 rounded-lg bg-yellow-500/20 text-yellow-500">
                          <Sparkles size={10} />
                        </div>
                      </div>
                    )}
                  </div>
                  <span
                    className="mt-1.5 px-2 text-[10px] font-medium tracking-tight opacity-40"
                    style={{ color: t.text }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center animate-pulse">
              <Cpu size={16} className="text-blue-500" />
            </div>
            <div
              className="p-4 rounded-2xl rounded-tl-none border flex items-center gap-3"
              style={{ background: t.card, borderColor: t.border }}
            >
              <div className="flex gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <motion.div
                    key={delay}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
                    className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  />
                ))}
              </div>
              <span style={{ fontSize: "0.85rem", color: t.textDimmed, fontWeight: 500 }}>
                Generating paw-some advice...
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Deck */}
      <div
        className="px-4 py-3 md:p-8 z-20 w-full sticky bottom-0"
        style={{
          background: `linear-gradient(to top, ${t.background}, ${t.background}99, transparent)`
        }}
      >
        <div
          className="max-w-5xl mx-auto relative flex items-center rounded-2xl md:rounded-[32px] border shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20 px-2 md:px-3"
          style={{ borderColor: t.border, background: "transparent" }}
        >
          <input
            type="text"
            placeholder="Ask your pet care questions..."
            className="flex-1 py-3 px-3 md:py-5 md:px-5 bg-transparent outline-none border-none text-sm md:text-[1.05rem] appearance-none"
            style={{ color: t.text, background: "transparent", backgroundColor: "transparent" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-lg group"
            style={{
              background: `linear-gradient(135deg, ${t.buttonBg}, ${t.buttonBg}dd)`,
              color: t.buttonText,
              opacity: !input.trim() || isLoading ? 0.3 : 1,
              cursor: !input.trim() || isLoading ? "not-allowed" : "pointer",
            }}
          >
            <Send size={18} className="md:size-[20px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        </div>

        <div className="mt-2 md:mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-6">
          <p className="flex items-center gap-1.5 text-[9px] md:text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: t.textDimmed }}>
            <Info size={10} className="md:size-[12px]" /> Disclaimer
          </p>
          <span className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
          <p className="text-[9px] md:text-[11px] font-medium opacity-60 text-center" style={{ color: t.text }}>
            Consult a vet for emergencies. 🩺
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
