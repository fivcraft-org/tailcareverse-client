import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Title, Text, Button, Stack, PasswordInput } from "@mantine/core";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import { resetPassword } from "../../api/api-auth";
import { useSettings } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiLock, FiShield, FiZap, FiArrowLeft } from "react-icons/fi";
import logo from "../../assets/tailcareverse-icon.png";
import authHero from "../../assets/tailcareverse_auth_otp.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();

  const { email, token } = location.state || {};

  useEffect(() => {
    if (!email || !token) navigate("/forgot-password");
  }, [email, token, navigate]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { notifyError("Passwords do not match"); return; }
    try {
      setLoading(true);
      await resetPassword({ email, newPassword: password, confirmPassword, token });
      notifySuccess("Password reset successful");
      navigate("/login");
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020202] flex overflow-hidden font-['Urbanist']">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[50%] relative h-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          src={authHero}
          alt="TailCareVerse Reset"
          className="absolute inset-0 w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#020202]" />

        <div className="relative z-10 p-10 flex flex-col justify-between h-full w-full">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
            <Link to="/" className="inline-flex items-center gap-4 no-underline group">
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
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

          <div>
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
              <Title className="text-7xl md:text-8xl font-semibold text-black leading-[0.85] tracking-tighter mb-8 uppercase  drop-shadow-2xl">
                CREATE <br/> NEW <br/> <span className="text-emerald-400">PASSWORD.</span>
              </Title>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="flex items-center gap-6">
              <div className="h-16 w-1 bg-emerald-500 rounded-full" />
              <p className="text-white text-xl font-semibold leading-relaxed max-w-sm  drop-shadow-xl">
                "Choose a strong new password to protect your Verse account going forward."
              </p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 1 }} className="flex justify-between lg:w-3/4">
            <div className="flex items-center gap-2">
              <FiShield className="text-white" size={12} />
              <span className="text-[10px] font-black tracking-[0.4em] text-white uppercase">End-to-end</span>
            </div>
            <div className="flex items-center gap-2">
              <FiLock className="text-white" size={12} />
              <span className="text-[10px] font-black tracking-[0.4em] text-white uppercase">Encrypted</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 md:p-10 lg:p-16 bg-[#020202]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <motion.div initial={{ width: 0 }} animate={{ width: 40 }} transition={{ delay: 0.5, duration: 1 }} className="h-[2px] bg-emerald-500 mb-5" />
            <Title className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
              RESET <span className="text-emerald-500 ">PASSWORD.</span>
            </Title>
            <p className="text-white/50 font-semibold text-sm ">
              Set a new strong password for your account.
            </p>
          </div>

          <div className="glass-dark p-8 md:p-10 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl">
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2 ml-1">New Password</p>
                  <PasswordInput
                    placeholder="New password"
                    leftSection={<FiLock size={16} className="text-emerald-500" />}
                    required
                    size="md"
                    classNames={{
                      input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                      innerInput: "text-white",
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2 ml-1">Confirm Password</p>
                  <PasswordInput
                    placeholder="Repeat new password"
                    leftSection={<FiShield size={16} className="text-emerald-500" />}
                    required
                    size="md"
                    classNames={{
                      input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                      innerInput: "text-white",
                    }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </motion.div>

                <motion.div className="pt-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 h-14 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-none transition-all duration-500 group"
                  >
                    Update Password
                  </Button>
                </motion.div>
              </Stack>
            </form>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <Link to="/login" className="inline-flex items-center gap-3 mt-8 text-white/30 hover:text-white transition-colors no-underline font-black uppercase tracking-widest text-[10px] group">
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
