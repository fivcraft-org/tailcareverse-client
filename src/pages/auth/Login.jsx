import { useState } from "react";
import { loginUser } from "../../api/api-auth";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Stack,
  Text,
  Divider,
} from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiZap, FiArrowLeft, FiShield } from "react-icons/fi";
import { useSettings } from "../../context/SettingsContext";
import logo from "../../assets/tailcareverse-icon.png";
import authHero from "../../assets/tailcareverse_auth_calm.png";

const Login = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await loginUser(form);
      if (data.data?.requireOtp) {
        notifySuccess(data.data.message);
        navigate("/verify-otp", { state: { email: form.email, type: "LOGIN" } });
        return;
      }
      login(data.data);
      notifySuccess(data.message);
      navigate("/home", { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
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
          transition={{ duration: 2, ease: "easeOut" }}
          src={authHero} 
          alt="TailCareVerse Serenity" 
          className="absolute inset-0 w-full h-full object-cover brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#020202]" />
        
        <div className="relative z-10 p-24 flex flex-col justify-between h-full w-full">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <Link to="/" className="inline-flex items-center gap-6 no-underline group">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center shadow-2xl shadow-black/20"
              >
                <img src={logo} alt="Logo" className="h-9 w-auto brightness-0 invert" />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="text-3xl font-black tracking-tighter text-black uppercase">
                  TailCare<span className="text-emerald-600">Verse</span>
                </span>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-dark/60">Pet Social App</span>
              </div>
            </Link>
          </motion.div>

          <div className="max-w-3xl">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
            >
              <Title className="text-8xl md:text-9xl font-semibold text-black leading-[0.8] tracking-tighter mb-10 uppercase drop-shadow-2xl">
                PEACE <br/> OF <span className="text-emerald-600">MIND.</span>
              </Title>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="flex items-center gap-8"
            >
              <div className="h-20 w-1 bg-white rounded-full shadow-lg" />
              <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600, lineHeight: 1.6, maxWidth: '28rem', textShadow: '0 4px 24px rgba(0,0,0,0.4)', margin: 0 }}>
                "Experience the world's most serene and advanced digital home for you and your legends."
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
              <FiZap className="text-black" />
              <span className="text-xs font-black tracking-[0.5em] text-black uppercase">SERENE INTERFACE</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: High-Visibility Form */}
      <div className="flex-1 h-full relative flex flex-col items-center justify-center p-6 md:p-10 lg:p-16 bg-[#020202] overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-[2px] bg-emerald-500 mb-5" 
            />
            <Title className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
              WELCOME <span className="text-emerald-500">BACK.</span>
            </Title>
            <p className="text-white/50 font-semibold text-sm">
              Access your personalized Verse dashboard.
            </p>
          </div>

          <div className="glass-dark p-8 md:p-10 rounded-[2rem] border border-white/10 relative bg-white/[0.02] shadow-2xl">
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2 ml-1">Email</p>
                  <TextInput
                    placeholder="Email address"
                    leftSection={<FiMail size={16} className="text-emerald-500" />}
                    required
                    size="md"
                    classNames={{
                      input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                    }}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <p className="text-[14px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2 ml-1">Password</p>
                  <PasswordInput
                    placeholder="Password"
                    leftSection={<FiLock size={16} className="text-emerald-500" />}
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

                <motion.div 
                  className="pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 h-14 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-none transition-all duration-500 group"
                  >
                    Login
                  </Button>
                </motion.div>

                <motion.div 
                  className="flex flex-col gap-6 text-center mt-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <Link to="/forgot-password" size="xs" className="text-white/40 hover:text-emerald-400 font-black uppercase tracking-widest text-[10px] transition-colors no-underline">
                    Reset Password?
                  </Link>
                  
                  <Divider label="OR" labelPosition="center" classNames={{ label: "bg-transparent text-white/20 font-black text-[10px]" }} className="border-white/5" />

                  <p className="text-white/40 font-bold text-sm">
                    New to the Universe?{" "}
                    <Link to="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors no-underline font-black uppercase tracking-[0.2em]">
                      JOIN THE FAMILY
                    </Link>
                  </p>
                </motion.div>
              </Stack>
            </form>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
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

export default Login;
