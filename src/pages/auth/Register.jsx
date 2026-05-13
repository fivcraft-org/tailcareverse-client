import { useState } from "react";
import { registerUser } from "../../api/api-auth";

import { useNavigate, Link } from "react-router-dom";
import { PLATFORM_ROLES, ROLE_LABELS } from "../../utils/roles";
import {
  TextInput,
  PasswordInput,
  Select,
  Button,
  Title,
  Stack,
  Text,
  Divider,
} from "@mantine/core";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiShield, FiZap, FiLayers, FiArrowLeft } from "react-icons/fi";
import { useSettings } from "../../context/SettingsContext";
import logo from "../../assets/tailcareverse-icon.png";
import authHero from "../../assets/tailcareverse_auth_calm.png";

const Register = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const roles = PLATFORM_ROLES.map((r) => ({
    value: r,
    label: ROLE_LABELS[r] || r.toUpperCase(),
  }));
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      notifyError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const nameParts = form.fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const registrationData = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role,
        firstName,
        lastName,
      };
      await registerUser(registrationData);
      notifySuccess("Registration successful! Please verify your email.");
      navigate("/verify-otp", { state: { email: form.email, type: "REGISTER" } });
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020202] flex overflow-hidden font-['Urbanist']">
      {/* Left Panel: Impressive Calm Cinematic Image */}
      <div className="hidden lg:flex lg:w-[50%] relative h-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          src={authHero}
          alt="TailCareVerse Serenity"
          className="absolute inset-0 w-full h-full object-cover brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#020202]" />

        <div className="relative z-10 p-10 flex flex-col justify-between h-full w-full">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <Link to="/" className="inline-flex items-center gap-4 no-underline group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl shadow-black/20"
              >
                <img src={logo} alt="Logo" className="h-6 w-auto brightness-0 invert" />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter text-black uppercase">
                  TailCare<span className="text-emerald-600">Verse</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60">Pet Social App</span>
              </div>
            </Link>
          </motion.div>

          <div className="max-w-3xl">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <Title className="text-8xl md:text-9xl font-semibold text-white leading-[0.8] tracking-tighter mb-10 uppercase  drop-shadow-2xl">
                BEYOND <br /> <span className="text-emerald-600">BOUNDARIES.</span>
              </Title>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="flex items-center gap-8"
            >
              <div className="h-20 w-1 bg-white rounded-full shadow-lg" />
              <p className="text-white text-xl font-semibold leading-relaxed max-w-lg  drop-shadow-xl">
                "Join the world's most sophisticated and peaceful community for modern pet parents."
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 2, duration: 1 }}
            className="flex gap-12"
          >
            <div className="flex items-center gap-3">
              <FiShield className="text-black" />
              <span className="text-xs font-black tracking-[0.5em] text-black uppercase">V1.0.4 CORE</span>
            </div>
            <div className="flex items-center gap-3">
              <FiLayers className="text-black" />
              <span className="text-xs font-black tracking-[0.5em] text-black uppercase">SECURE VERSE</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: High-Visibility Form */}
      <div className="flex-1 h-full relative flex flex-col items-center justify-center p-6 md:p-10 lg:p-14 bg-[#020202] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-2xl"
        >
          <div className="mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-[2px] bg-emerald-500 mb-5"
            />
            <Title className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
              CREATE <span className="text-emerald-500 ">ACCOUNT.</span>
            </Title>
            <p className="text-white/50 font-semibold text-sm ">
              Enroll in the premium digital ecosystem.
            </p>
          </div>

          <div className="glass-dark p-8 lg:p-10 rounded-[2.5rem] border border-white/10 relative bg-white/[0.02] shadow-2xl">
            <form onSubmit={handleSubmit} className="relative">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
                <Stack gap="sm">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2 ml-1">Full Name</p>
                    <TextInput
                      placeholder="Full name"
                      leftSection={<FiUser size={15} className="text-emerald-500" />}
                      required
                      size="md"
                      classNames={{
                        input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                      }}
                      value={form.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2 ml-1">Email</p>
                    <TextInput
                      placeholder="Email address"
                      leftSection={<FiMail size={15} className="text-emerald-500" />}
                      required
                      size="md"
                      classNames={{
                        input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                      }}
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2 ml-1">Username</p>
                    <TextInput
                      placeholder="Username"
                      leftSection={<FiZap size={15} className="text-emerald-500" />}
                      required
                      size="md"
                      classNames={{
                        input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                      }}
                      value={form.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                    />
                  </motion.div>
                </Stack>

                <Stack gap="sm">
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2 ml-1">Account Type</p>
                    <Select
                      placeholder="Select role"
                      leftSection={<FiLayers size={15} className="text-emerald-500" />}
                      data={roles}
                      required
                      size="md"
                      classNames={{
                        input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                      }}
                      value={form.role}
                      onChange={(value) => handleChange("role", value)}
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2 ml-1">Password</p>
                    <PasswordInput
                      placeholder="Password"
                      leftSection={<FiLock size={15} className="text-emerald-500" />}
                      required
                      size="md"
                      classNames={{
                        input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                        innerInput: "text-white",
                      }}
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-400 mb-2 ml-1">Confirm Password</p>
                    <PasswordInput
                      placeholder="Repeat password"
                      leftSection={<FiShield size={15} className="text-emerald-500" />}
                      required
                      size="md"
                      classNames={{
                        input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                        innerInput: "text-white",
                      }}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    />
                  </motion.div>
                </Stack>
              </div>

              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 h-14 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-none transition-all duration-500 group"
                >
                  Create Account
                </Button>
              </motion.div>

              <motion.div
                className="mt-10 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                <p className="text-white/40 font-bold  text-sm">
                  Already a member of the Verse?{" "}
                  <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors no-underline font-black uppercase tracking-[0.2em]">
                    LOGIN ACCESS
                  </Link>
                </p>
              </motion.div>
            </form>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <Link to="/" className="inline-flex items-center gap-3 mt-8 text-white/30 hover:text-white transition-colors no-underline font-black uppercase tracking-widest text-[10px] group">
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Surface
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
