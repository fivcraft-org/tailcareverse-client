import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Title, Text, Button, Stack, TextInput } from "@mantine/core";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import { sendForgotPasswordOTP } from "../../api/api-auth";
import { useSettings } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiMail, FiZap, FiArrowLeft, FiShield } from "react-icons/fi";
import logo from "../../assets/tailcareverse-icon.png";
import authHero from "../../assets/tailcareverse_auth_otp.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await sendForgotPasswordOTP({ email });
      notifySuccess("OTP sent to your email");
      navigate("/verify-otp", { state: { email, type: "FORGOT" } });
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to send OTP");
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
          alt="TailCareVerse Recovery"
          className="absolute inset-0 w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202]/60 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#020202]" />

        <div className="relative z-10 p-16 flex flex-col justify-between h-full w-full">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
            <Link to="/" className="inline-flex items-center gap-5 no-underline group">
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-2xl">
                <img src={logo} alt="Logo" className="h-8 w-auto brightness-0 invert" />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tighter text-black uppercase italic">
                  TailCare<span className="text-emerald-600">Verse</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60">Premium Ecosystem</span>
              </div>
            </Link>
          </motion.div>

          <div>
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
              <Title className="text-7xl md:text-8xl font-semibold text-white leading-[0.85] tracking-tighter mb-8 uppercase italic drop-shadow-2xl">
                RECOVER <br/> YOUR <br/> <span className="text-emerald-400 not-italic">ACCOUNT.</span>
              </Title>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="flex items-center gap-6">
              <div className="h-16 w-1 bg-white rounded-full" />
              <Text className="text-white text-lg font-semibold leading-relaxed max-w-sm italic drop-shadow-xl">
                "We'll send a secure OTP to get you back into your Verse account quickly."
              </Text>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 1 }} className="flex gap-8">
            <div className="flex items-center gap-2">
              <FiShield className="text-black" size={12} />
              <span className="text-[10px] font-black tracking-[0.4em] text-black uppercase">Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMail className="text-black" size={12} />
              <span className="text-[10px] font-black tracking-[0.4em] text-black uppercase">Email OTP</span>
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
              FORGOT <span className="text-emerald-500 italic">PASSWORD.</span>
            </Title>
            <Text className="text-white/50 font-semibold text-sm italic">
              Enter your email to receive a reset code.
            </Text>
          </div>

          <div className="glass-dark p-8 md:p-10 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl">
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <Text className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2 ml-1">Registered Email</Text>
                  <TextInput
                    placeholder="Email address"
                    leftSection={<FiMail size={16} className="text-emerald-500" />}
                    required
                    type="email"
                    size="md"
                    classNames={{
                      input: "bg-white/[0.05] border-white/10 text-white focus:border-emerald-500 rounded-xl h-11 text-sm placeholder:text-slate-500 transition-all focus:bg-white/[0.08]",
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </motion.div>

                <motion.div className="pt-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 h-14 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-none transition-all duration-500 group"
                  >
                    Send Reset Code <FiZap className="ml-2 group-hover:scale-125 transition-transform" />
                  </Button>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-center">
                  <Text className="text-white/30 font-bold italic text-xs">
                    Remembered it?{" "}
                    <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors no-underline font-black not-italic uppercase tracking-widest">
                      Login
                    </Link>
                  </Text>
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

export default ForgotPassword;
