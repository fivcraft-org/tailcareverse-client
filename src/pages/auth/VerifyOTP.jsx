import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Container,
} from "@mantine/core";
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
} from "../../api/api-auth";
import { useAuth } from "../../hooks/useAuth";
import { useSettings } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiShield, FiZap, FiMail } from "react-icons/fi";
import logo from "../../assets/tailcareverse-icon.png";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { settings } = useSettings();

  const { email, type } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (!email || !type) {
      navigate("/login");
    }
  }, [email, type, navigate]);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
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
    if (finalOtp.length !== 6) {
      notifyError("Enter complete 6-digit OTP");
      return;
    }
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
        navigate("/reset-password", {
          state: { email, token: response.resetToken, type: "FORGOT" },
        });
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
      notifySuccess("OTP resent successfully");
      setTimer(60);
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-['Urbanist'] relative overflow-hidden flex items-center justify-center p-6">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] animate-blob [animation-delay:2s]" />
      </div>

      <Container size="xs" className="relative z-10 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 group mb-8">
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <img src={logo} alt="Logo" className="h-9 w-auto brightness-0 invert" />
              </motion.div>
            </div>
            <Title className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-4">
              VERIFY <span className="text-emerald-500 italic">IDENTITY.</span>
            </Title>
            <Text className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
              Protocol Authentication Required
            </Text>
          </div>

          <div className="glass-dark p-8 md:p-12 rounded-[3.5rem] border border-white/5 relative group text-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[3.6rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            
            <div className="relative">
              <div className="mb-10 inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5">
                <FiMail className="text-emerald-500" />
                <Text className="text-xs font-bold text-slate-400">{email}</Text>
              </div>

              <Group justify="center" mb="xl" gap="sm">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    maxLength={1}
                    className="w-12 h-16 text-center bg-white/[0.03] border-2 border-white/10 text-white rounded-2xl font-black text-2xl focus:border-emerald-500 outline-none transition-all focus:-translate-y-1 focus:shadow-2xl focus:shadow-emerald-500/20"
                  />
                ))}
              </Group>

              <Stack gap="xl">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    fullWidth
                    loading={loading}
                    onClick={handleVerify}
                    size="xl"
                    className="bg-emerald-500 hover:bg-emerald-400 h-20 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 border-none"
                  >
                    Authorize Access <FiZap className="ml-3" />
                  </Button>
                </motion.div>

                <div className="pt-6">
                  {timer > 0 ? (
                    <Text className="text-slate-500 font-bold text-sm">
                      Re-transmission available in <span className="text-emerald-500 font-black italic">{timer}s</span>
                    </Text>
                  ) : (
                    <button onClick={handleResend} className="bg-transparent border-none text-emerald-500 hover:text-emerald-400 font-black uppercase tracking-widest text-xs cursor-pointer transition-colors">
                      RESEND PROTOCOL CODE
                    </button>
                  )}
                </div>

                <Divider className="border-white/5" />

                <Link to="/login" className="text-slate-600 hover:text-white transition-colors no-underline font-black uppercase tracking-widest text-[10px]">
                  Abort Authentication
                </Link>
              </Stack>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default VerifyOTP;
