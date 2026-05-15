import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Title, Text, Button, Stack, Group, Container } from "@mantine/core";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import {
  verifyRegisterOTP,
  verifyLoginOTP,
  resendRegisterOTP,
  resendLoginOTP,
  verifyForgotPasswordOTP,
  resendForgotPasswordOTP,
} from "../../api/api-auth";
import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiShield, FiZap, FiMail, FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import logo from "../../assets/tailcareverse-icon.png";
import authHero from "../../assets/tailcareverse_auth_otp.png";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { settings } = useSettings();

  const { email, type } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  // --- Persistent timer: store expiry timestamp in sessionStorage ---
  const timerKey = `otp_expiry_${email}_${type}`;

  const getInitialTimer = () => {
    const stored = sessionStorage.getItem(timerKey);
    if (stored) {
      const remaining = Math.round((parseInt(stored, 10) - Date.now()) / 1000);
      if (remaining > 0) return remaining;
      return 0;
    }
    // First visit: set a 60-second expiry
    const expiry = Date.now() + 60 * 1000;
    sessionStorage.setItem(timerKey, expiry.toString());
    return 60;
  };

  const [timer, setTimer] = useState(getInitialTimer);

  useEffect(() => {
    if (!email || !type) navigate("/login");
  }, [email, type, navigate]);

  useEffect(() => {
    if (!timerKey || timer <= 0) return;

    const interval = setInterval(() => {
      const stored = sessionStorage.getItem(timerKey);
      const remaining = stored
        ? Math.max(0, Math.round((parseInt(stored, 10) - Date.now()) / 1000))
        : 0;
      
      setTimer(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerKey, timer > 0]);

  const handleChange = (value, index) => {
    const char = value.slice(-1); // Get last character (handles autofill/fast typing)
    if (!/^[0-9]?$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pasteData)) return;

    const newOtp = pasteData.split("").slice(0, 6);
    setOtp(newOtp);
    // Focus the last input after pasting
    document.getElementById("otp-5").focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        document.getElementById(`otp-${index - 1}`).focus();
      }
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) { notifyError("Enter complete 6-digit OTP"); return; }
    try {
      setLoading(true);
      if (type === "REGISTER") {
        await verifyRegisterOTP({ email, otp: finalOtp });
        notifySuccess("Account verified successfully");
        navigate("/login");
      }
      if (type === "LOGIN") {
        const res = await verifyLoginOTP({ email, otp: finalOtp });
        login(res.data);
        notifySuccess("Login successful");
        navigate("/home", { replace: true });
      }
      if (type === "FORGOT") {
        const response = await verifyForgotPasswordOTP({ email, otp: finalOtp });
        navigate("/reset-password", { state: { email, token: response.resetToken, type: "FORGOT" } });
      }
    } catch (err) {
      notifyError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      if (type === "REGISTER") await resendRegisterOTP({ email });
      if (type === "LOGIN") await resendLoginOTP({ email });
      if (type === "FORGOT") await resendForgotPasswordOTP({ email });
      notifySuccess("OTP resent successfully");
      // Reset expiry timestamp and restart countdown
      const newExpiry = Date.now() + 60 * 1000;
      sessionStorage.setItem(timerKey, newExpiry.toString());
      setTimer(60);
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to resend OTP");
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
          alt="TailCareVerse OTP"
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
                <span className="text-xl font-black tracking-tighter text-black uppercase ">
                  TailCare<span className="text-emerald-600">Verse</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/60">Pet Social App</span>
              </div>
            </Link>
          </motion.div>

          <div>
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.8, duration: 1 }}>
              <Title className="text-7xl md:text-8xl font-semibold text-black leading-[0.85] tracking-tighter mb-8 uppercase  drop-shadow-2xl">
                SECURE <br/> <span>YOUR</span> <br/> <span className="text-emerald-400 ">ACCESS.</span>
              </Title>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.2, duration: 1 }} className="flex items-center gap-6">
              <div className="h-16 w-1 bg-emerald-500 rounded-full" />
              <p className="text-white text-xl font-semibold leading-relaxed max-w-sm  drop-shadow-xl">
                "Enter your one-time code to authenticate and protect your Verse account."
              </p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 1 }} className="flex justify-between w-3/4">
            <div className="flex items-center gap-2">
              <FiShield className="text-white" size={12} />
              <span className="text-[14px] font-black tracking-[0.4em] text-white uppercase">Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <FiZap className="text-white" size={12} />
              <span className="text-[14px] font-black tracking-[0.4em] text-white uppercase">Real-time</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 h-full flex flex-col items-center justify-center p-6 md:p-10 lg:p-16 bg-[#020202">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <motion.div initial={{ width: 0 }} animate={{ width: 40 }} transition={{ delay: 0.5, duration: 1 }} className="h-[2px] bg-emerald-500 mb-5" />
            <Title className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none mb-3">
              VERIFY <span className="text-emerald-500 ">CODE.</span>
            </Title>
            <p className="text-white/50 font-semibold text-sm ">
              Enter the 6-digit code sent to your email.
            </p>
          </div>

          <div className="glass-dark p-8 md:p-10 rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl">
            {/* Email badge */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex items-center gap-2 bg-white/[0.04] border border-white/5 rounded-xl px-4 py-3 mb-8">
              <FiMail size={14} className="text-emerald-500 shrink-0" />
              <p className="text-slate-400 text-xs font-bold truncate">{email}</p>
            </motion.div>

            {/* OTP Inputs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <Group justify="center" gap="sm" mb="xl">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    maxLength={1}
                    autoComplete="one-time-code"
                    className="w-10 h-13 text-center bg-white/[0.05] border-2 border-white/10 text-white rounded-xl font-black text-xl focus:border-emerald-500 focus:bg-white/[0.1] outline-none transition-all focus:-translate-y-1 focus:shadow-lg focus:shadow-emerald-500/20"
                  />
                ))}
              </Group>
            </motion.div>

            <Stack gap="md">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                <Button
                  fullWidth
                  loading={loading}
                  onClick={handleVerify}
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 h-14 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-none transition-all duration-500 group"
                >
                  Verify Code
                </Button>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-center pt-2">
                {timer > 0 ? (
                  <p className="text-white/30 font-bold text-xs uppercase tracking-widest">
                    Resend in <span className="text-emerald-500">{timer}s</span>
                  </p>
                ) : (
                  <button onClick={handleResend} className="flex items-center gap-2 mx-auto bg-transparent border-none text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest text-xs cursor-pointer transition-colors">
                    <FiRefreshCw size={12} /> Resend Code
                  </button>
                )}
              </motion.div>
            </Stack>
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

export default VerifyOTP;
