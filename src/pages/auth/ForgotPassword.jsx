import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Title,
  Text,
  Button,
  Stack,
  TextInput,
  Container,
} from "@mantine/core";
import {
  notifySuccess,
  notifyError,
} from "../../utils/services/toast/toast-service";
import { sendForgotPasswordOTP } from "../../api/api-auth";
import { useSettings } from "../../context/SettingsContext";
import { motion } from "framer-motion";
import { FiMail, FiZap } from "react-icons/fi";
import logo from "../../assets/tailcareverse-icon.png";

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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 font-['Urbanist'] relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] animate-blob [animation-delay:2s]" />
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
              RECOVER <span className="text-emerald-500 italic">ACCESS.</span>
            </Title>
            <Text className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
              Initiate Security Restoration Protocol
            </Text>
          </div>

          <div className="glass-dark p-8 md:p-12 rounded-[3.5rem] border border-white/5 relative group text-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-[3.6rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            
            <div className="relative">
              <Text size="md" className="text-slate-400 mb-10 font-semibold leading-relaxed italic">
                "Authentication lost? Input your registered credential hub to receive a temporary security key."
              </Text>

              <form onSubmit={handleSubmit}>
                <Stack gap="xl">
                  <div className="space-y-2 text-left">
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-4">Credential Hub</Text>
                    <TextInput
                      placeholder="ENTER EMAIL ADDRESS"
                      leftSection={<FiMail className="text-emerald-500" />}
                      required
                      size="xl"
                      classNames={{
                        input: "bg-white/[0.03] border-white/10 text-white focus:border-emerald-500 rounded-2xl h-16 font-black tracking-widest text-xs placeholder:text-slate-700 transition-all",
                      }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      Dispatch Key <FiZap className="ml-3" />
                    </Button>
                  </motion.div>

                  <Link to="/login" className="text-slate-600 hover:text-white transition-colors no-underline font-black uppercase tracking-widest text-[10px] pt-4">
                    Return to Authentication Hub
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

export default ForgotPassword;
