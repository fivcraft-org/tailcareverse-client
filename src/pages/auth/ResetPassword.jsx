import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Title,
  Text,
  Button,
  Stack,
  PasswordInput,
  Container,
} from "@mantine/core";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import { resetPassword } from "../../api/api-auth";
import { useSettings } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiLock, FiShield, FiZap } from "react-icons/fi";
import logo from "../../assets/tailcareverse-icon.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();

  const { email, token } = location.state || {};

  useEffect(() => {
    if (!email || !token) {
      navigate("/forgot-password");
    }
  }, [email, token, navigate]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notifyError("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      await resetPassword({
        email,
        newPassword: password,
        confirmPassword,
        token,
      });
      notifySuccess("Password reset successful");
      navigate("/login");
    } catch (err) {
      notifyError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-['Urbanist'] relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px] animate-blob [animation-delay:2s]" />
      </div>

      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <Container size="xs" className="relative z-10 w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 group mb-8">
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <img src={logo} alt="Logo" className="h-9 w-auto brightness-0 invert" />
              </motion.div>
            </div>
            <Title className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-4">
              UPDATE <span className="text-emerald-500 italic">SECURITY.</span>
            </Title>
            <Text className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
              Finalizing Security Restoration Protocol
            </Text>
          </div>

          <div className="glass-dark p-8 md:p-12 rounded-[3.5rem] border border-white/5 relative group text-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 rounded-[3.6rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            
            <div className="relative">
              <form onSubmit={handleSubmit}>
                <Stack gap="xl">
                  <div className="space-y-2 text-left">
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-4">New Security Key</Text>
                    <PasswordInput
                      placeholder="ENTER NEW PASSWORD"
                      leftSection={<FiLock className="text-emerald-500" />}
                      required
                      size="xl"
                      classNames={{
                        input: "bg-white/[0.03] border-white/10 text-white focus:border-emerald-500 rounded-2xl h-16 font-black tracking-widest text-xs placeholder:text-slate-700 transition-all",
                        innerInput: "text-white",
                      }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-4">Verify New Key</Text>
                    <PasswordInput
                      placeholder="REPEAT NEW PASSWORD"
                      leftSection={<FiShield className="text-emerald-500" />}
                      required
                      size="xl"
                      classNames={{
                        input: "bg-white/[0.03] border-white/10 text-white focus:border-emerald-500 rounded-2xl h-16 font-black tracking-widest text-xs placeholder:text-slate-700 transition-all",
                        innerInput: "text-white",
                      }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      fullWidth
                      loading={loading}
                      size="xl"
                      className="bg-emerald-500 hover:bg-emerald-400 h-20 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 border-none"
                    >
                      Update Key <FiZap className="ml-3" />
                    </Button>
                  </motion.div>

                  <Link to="/login" className="text-slate-600 hover:text-white transition-colors no-underline font-black uppercase tracking-widest text-[10px] pt-4">
                    Abort Protocol
                  </Link>
                </Stack>
              </form>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

export default ResetPassword;
