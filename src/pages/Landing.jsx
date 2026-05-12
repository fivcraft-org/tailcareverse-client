import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Text,
  Button,
  Group,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Stack,
  Title,
  Burger,
  Drawer,
  Box,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import {
  FiHeart,
  FiShoppingBag,
  FiSearch,
  FiShield,
  FiArrowRight,
  FiActivity,
  FiGlobe,
  FiZap,
  FiAward,
  FiUsers,
  FiStar,
  FiInstagram,
  FiYoutube,
} from "react-icons/fi";
import { RiTwitterXFill } from "react-icons/ri";
import { useSettings } from "../context/SettingsContext";
import logo from "../assets/tailcareverse-icon.png";
// Premium Assets
import heroPremium from "../assets/tailcareverse_hero.png";
import marketplacePremium from "../assets/tailcareverse_marketplace.png";

const features = [
  {
    title: "TailCare AI",
    description: "Your pet's health and behavior, decoded by the world's most advanced pet-specific intelligence.",
    icon: <FiZap className="w-8 h-8 text-yellow-400" />,
    color: "from-yellow-400/10 to-orange-500/10",
    link: "/ai-assistant"
  },
  {
    title: "The Marketplace",
    description: "Curated, high-end essentials for the modern pet life. Luxury meets animal wellness.",
    icon: <FiShoppingBag className="w-8 h-8 text-blue-400" />,
    color: "from-blue-500/10 to-indigo-600/10",
    link: "/marketplace"
  },
  {
    title: "Care Network",
    description: "A borderless directory of verified vets and specialists. Peace of mind, instantly.",
    icon: <FiShield className="w-8 h-8 text-emerald-400" />,
    color: "from-emerald-500/10 to-teal-600/10",
    link: "/services"
  },
  {
    title: "Verse Community",
    description: "Join the elite circle of pet parents. Share, connect, and elevate your pet's life.",
    icon: <FiUsers className="w-8 h-8 text-pink-400" />,
    color: "from-pink-500/10 to-purple-600/10",
    link: "/explore"
  },
];

const partners = ["VetGlobal", "PawStore", "HealthTail", "ElitePets", "CareVerse", "PetCloud"];

const FadeInWhenVisible = ({ children, delay = 0, direction = "up" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 60 : direction === "down" ? -60 : 0,
      x: direction === "left" ? 60 : direction === "right" ? -60 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 1,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

export default function Landing() {
  const { settings } = useSettings();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-100 font-['Urbanist']">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-[110]"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <motion.nav
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
          scrolled ? "py-4 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5" : "py-8 bg-transparent"
        }`}
      >
        <Container size="xl" className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 no-underline group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40"
            >
              <img src={logo} alt="Logo" className="h-7 w-auto brightness-0 invert" />
            </motion.div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black tracking-tighter text-white uppercase">
                TailCare<span className="text-emerald-500">Verse</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Premium Ecosystem</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-12">
            <div className="flex gap-12 text-[11px] font-black uppercase tracking-[0.25em] text-slate-500">
              <button onClick={() => scrollToSection('features')} className="hover:text-emerald-400 transition-all duration-300 hover:tracking-[0.35em] cursor-pointer">Features</button>
              <Link to="/ai-assistant" className="hover:text-emerald-400 transition-all duration-300 hover:tracking-[0.35em]">AI System</Link>
              <Link to="/marketplace" className="hover:text-emerald-400 transition-all duration-300 hover:tracking-[0.35em]">Market</Link>
              <Link to="/explore" className="hover:text-emerald-400 transition-all duration-300 hover:tracking-[0.35em]">Community</Link>
            </div>
            
            <Divider orientation="vertical" className="h-6 border-white/10" />

            <Group gap="md">
              <Button
                variant="subtle"
                color="gray"
                component={Link}
                to="/login"
                className="text-white hover:bg-white/5 font-black text-xs uppercase tracking-widest px-6"
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg px-8 h-12 font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-xl shadow-emerald-500/20"
              >
                Join the Verse
              </Button>
            </Group>
          </div>

          <Burger opened={opened} onClick={toggle} hiddenFrom="lg" color="white" />
        </Container>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        {/* Subtle Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[140px] animate-blob" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] animate-blob [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] animate-pulse-slow" />
        </div>

        <Container size="xl" className="relative z-10">
          <div className="grid lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-7">
              <FadeInWhenVisible direction="right">
                <div className="flex items-center gap-3 mb-8">
                  <Badge
                    variant="filled"
                    className="bg-emerald-500 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-[0.2em]"
                  >
                    V1.0 LIVE
                  </Badge>
                  <Text size="xs" className="text-slate-500 font-black uppercase tracking-[0.2em]">The Future of Care</Text>
                </div>
                
                <Title className="text-7xl md:text-9xl font-black leading-[0.9] mb-10 tracking-tighter">
                  ELEVATING <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 uppercase">PET LIFE</span> <br/>
                  <span className="text-slate-800">BEYOND.</span>
                </Title>
                
                <Text size="xl" className="text-slate-400 max-w-2xl mb-14 leading-relaxed font-semibold">
                  "TailCareVerse isn't just a platform; it's the digital evolution 
                  of the bond between humans and their legends."
                </Text>
                
                <Group gap="xl">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="xl"
                      component={Link}
                      to="/register"
                      className="bg-emerald-500 hover:bg-emerald-400 h-20 px-12 rounded-[2rem] font-black text-xl border-none shadow-[0_20px_50px_rgba(16,185,129,0.3)]"
                    >
                      Enter the Verse <FiArrowRight className="ml-3" />
                    </Button>
                  </motion.div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-[#050505] overflow-hidden bg-slate-800">
                          <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="avatar" />
                        </div>
                      ))}
                    </div>
                    <Text size="xs" className="text-slate-500 font-black uppercase tracking-widest">
                      <span className="text-white">50K+</span> Active Legends
                    </Text>
                  </div>
                </Group>
              </FadeInWhenVisible>
            </div>

            <div className="lg:col-span-5 relative">
              <FadeInWhenVisible direction="left" delay={0.2}>
                <div className="relative group">
                  <div className="absolute -inset-10 bg-emerald-500/10 rounded-[4rem] blur-3xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                  <div className="relative glass-dark p-4 rounded-[4rem] shadow-2xl animate-float">
                    <img
                      src={heroPremium}
                      alt="Premium Pet Life"
                      className="rounded-[3.5rem] w-full h-[550px] object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                    />
                    
                    <motion.div 
                      className="absolute top-10 -right-10 bg-slate-800/80 glass p-6 rounded-[2rem] shadow-2xl border-white/10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FiActivity className="text-emerald-500 mb-2" size={32} />
                      <Text fw={900} size="sm" className="text-slate-100 leading-none">REAL-TIME</Text>
                      <Text size="[10px]" fw={800} className="text-slate-400 uppercase tracking-tighter">Vital Tracking</Text>
                    </motion.div>
                  </div>
                </div>
              </FadeInWhenVisible>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <Container size="xl">
          <div className="flex items-center gap-20 overflow-hidden opacity-30 grayscale whitespace-nowrap">
            {[...partners, ...partners].map((p, i) => (
              <span key={i} className="text-2xl font-black uppercase tracking-[0.5em]">{p}</span>
            ))}
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="py-30 relative bg-[#050505]">
        <Container size="xl">
          <FadeInWhenVisible>
            <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-10">
              <div className="max-w-3xl">
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none px-4 py-2 mb-6 uppercase tracking-widest">CORE SYSTEMS</Badge>
                <Title className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
                  A UNIVERSE BUILT <br/> FOR <span className="text-slate-800">EXCELLENCE.</span>
                </Title>
              </div>
              <Text className="text-slate-500 font-bold max-w-sm text-lg">
                Every feature is meticulously designed to simplify care and maximize joy.
              </Text>
            </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.slice(0, 3).map((f, i) => (
              <FeatureCard key={i} feature={f} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 relative">
        <Container size="xl">
          <FeatureCard feature={features[3]} isFullWidth />
        </Container>
      </section>

      {/* Marketplace Spotlight */}
      <section className="py-30 relative overflow-hidden">
        <Container size="xl">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <FadeInWhenVisible direction="right">
              <div className="relative group">
                <div className="absolute -inset-10 bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="relative glass-dark p-4 rounded-[4rem] rotate-[-2deg] group-hover:rotate-0 transition-transform duration-700">
                  <img 
                    src={marketplacePremium} 
                    alt="Marketplace" 
                    className="rounded-[3.5rem] w-full h-[600px] object-cover"
                  />
                  <div className="absolute top-1/2 -right-12 glass p-8 rounded-[2.5rem] bg-slate-800/80 shadow-2xl">
                    <FiShoppingBag size={32} className="text-blue-500 mb-4" />
                    <Text className="text-slate-100 font-black text-2xl uppercase tracking-tighter">CURATED</Text>
                    <Text className="text-slate-400 font-bold text-sm">Essentials</Text>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible direction="left" delay={0.3}>
              <Badge className="bg-blue-500/10 text-blue-400 border-none px-4 py-2 mb-8 uppercase tracking-widest">The Shop</Badge>
              <Title className="text-5xl md:text-7xl font-black mb-10 leading-tight tracking-tighter">
                THE FINEST <br/> <span className="text-blue-500 uppercase">COLLECTION.</span>
              </Title>
              <Text size="xl" className="text-slate-400 mb-12 font-medium leading-relaxed">
                We believe that the tools of care should be as beautiful as the pets they serve. 
                Our marketplace features exclusive collaborations with world-class pet artisans.
              </Text>
              
              <SimpleGrid cols={2} spacing="xl" className="mb-12">
                <div className="p-6 glass-dark rounded-3xl border-white/5 bg-slate-900/50">
                  <FiAward className="text-blue-500 mb-4" size={24} />
                  <Text fw={900} className="mb-2 uppercase tracking-tighter text-slate-100">Award Winning</Text>
                  <Text size="xs" color="dimmed">Products recognized for safety and design excellence.</Text>
                </div>
                <div className="p-6 glass-dark rounded-3xl border-white/5 bg-slate-900/50">
                  <FiGlobe className="text-blue-500 mb-4" size={24} />
                  <Text fw={900} className="mb-2 uppercase tracking-tighter text-slate-100">Global Shipping</Text>
                  <Text size="xs" color="dimmed">Delivered to your door, anywhere in the Verse.</Text>
                </div>
              </SimpleGrid>

              <Button
                component={Link}
                to="/marketplace"
                size="xl"
                className="bg-blue-600 hover:bg-blue-500 h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20"
              >
                Browse Marketplace
              </Button>
            </FadeInWhenVisible>
          </div>
        </Container>
      </section>

      {/* AI Assistant Section */}
      <section className="py-30 relative">
        <Container size="lg">
          <div className="glass-dark p-12 md:p-24 rounded-[5rem] relative z-10 border border-white/5 overflow-hidden bg-slate-900/20 backdrop-blur-3xl">
            <div className="grid md:grid-cols-2 gap-20 items-center">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-6 py-3 mb-10 text-xs font-black tracking-[0.2em]">INTEL SYSTEM</Badge>
                <Title className="text-5xl md:text-7xl font-black mb-10 leading-none tracking-tighter uppercase">
                  INTELLIGENCE <br/> <span className="text-emerald-500">ON DEMAND.</span>
                </Title>
                <Text size="xl" className="text-slate-400 mb-12 font-medium leading-relaxed">
                  TailCare AI isn't just a bot. It's a hyper-intelligent companion trained 
                  on global veterinary standards to provide instant, life-saving advice.
                </Text>
                <motion.div whileHover={{ x: 10 }} className="inline-block">
                  <Button 
                    component={Link}
                    to="/ai-assistant"
                    size="xl" 
                    className="bg-emerald-500 h-20 px-12 rounded-[2rem] font-black shadow-2xl shadow-emerald-500/20 text-xs uppercase tracking-widest"
                  >
                    Initialize AI Assistant
                  </Button>
                </motion.div>
              </div>
              
              <div className="space-y-6 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
                
                <ChatBubble 
                  role="user" 
                  text="Identify these symptoms: Lethargy and loss of appetite." 
                  delay={0.5} 
                />
                <ChatBubble 
                  role="assistant" 
                  text="Analyzing... These can indicate early-stage dehydration. Ensure fresh water is available and monitor temperature. Should I locate the nearest emergency vet?" 
                  delay={2} 
                />
                <div className="flex justify-center pt-8">
                  <Badge variant="outline" className="border-white/10 text-slate-500 px-6 py-4 rounded-full font-black text-[10px] tracking-widest">
                    SYSTEM SECURE • AI ACTIVE
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Final Call to Action */}
      <section className="py-30 relative text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase">
          VERSE
        </div>
        
        <Container size="md" className="relative z-10">
          <FadeInWhenVisible>
            <Title className="text-6xl md:text-9xl font-black mb-12 tracking-tighter leading-none uppercase">
              BEYOND <br/> <span className="text-emerald-500">BOUNDARIES.</span>
            </Title>
            <Text size="xl" className="text-slate-400 mb-16 font-bold">
              "The life your pet deserves is just one click away. Join the elite network of modern pet parents."
            </Text>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="xl"
                component={Link}
                to="/register"
                className="bg-white hover:bg-emerald-500 hover:text-white text-slate-950 h-24 px-20 rounded-[3rem] font-black text-3xl shadow-[0_30px_60px_rgba(255,255,255,0.1)] transition-all duration-700"
              >
                Create Account
              </Button>
            </motion.div>
          </FadeInWhenVisible>
        </Container>
      </section>

      {/* Footer Section */}
      <footer className="py-30 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <Container size="xl">
          <div className="grid md:grid-cols-4 gap-20 mb-32">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-4 no-underline mb-10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                  <img src="/favicon.png" alt="Logo" className="h-7 w-auto" />
                </div>
                <span className="text-3xl font-black tracking-tighter text-white uppercase">TailCareVerse</span>
              </Link>
              <Text className="text-slate-500 text-lg max-w-sm font-semibold mb-10">
                Redefining the standard of care for the legends in our lives. 
                Built for the next generation of pet parents.
              </Text>
              <div className="flex gap-6 mt-3">
                <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-all">
                  <RiTwitterXFill size={20} />
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-all">
                  <FiInstagram size={20} />
                </motion.div>
                <motion.div whileHover={{ scale: 1.1, y: -5 }} className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/5 cursor-pointer transition-all">
                  <FiYoutube size={20} />
                </motion.div>
              </div>
            </div>
            
            <div>
              <Text className="text-white font-black uppercase tracking-[0.3em] text-xs mb-10">Ecosystem</Text>
              <Stack gap="md" className="text-slate-500 font-bold">
                <Link to="/ai-assistant" className="hover:text-emerald-500 transition-colors">AI Assistant</Link>
                <Link to="/marketplace" className="hover:text-emerald-500 transition-colors">Marketplace</Link>
                <Link to="/services" className="hover:text-emerald-500 transition-colors">Care Network</Link>
                <Link to="/explore" className="hover:text-emerald-500 transition-colors">Verse Community</Link>
              </Stack>
            </div>
            
            <div>
              <Text className="text-white font-black uppercase tracking-[0.3em] text-xs mb-10">Company</Text>
              <Stack gap="md" className="text-slate-500 font-bold">
                {["Our Story", "Safety", "Privacy", "Terms"].map(item => (
                  <Link key={item} to="#" className="hover:text-emerald-400 transition-colors">{item}</Link>
                ))}
              </Stack>
            </div>
          </div>
          
          <Divider className="border-white/5 mb-12" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">
            <div>&copy; 2026 TAILCAREVERSE SYSTEM. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-10">
              <span>Security Verified</span>
              <span>Cloud Integrated</span>
            </div>
          </div>
        </Container>
      </footer>
      
      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="xl"
        className="bg-[#050505]"
        styles={{ content: { backgroundColor: "#050505" } }}
      >
        <Stack gap="xl" mt="xl">
          <button onClick={() => { scrollToSection('features'); close(); }} className="text-5xl font-black text-white hover:text-emerald-500 transition-all text-left bg-transparent border-none p-0 cursor-pointer">Features</button>
          <Link to="/ai-assistant" onClick={close} className="text-5xl font-black text-white hover:text-emerald-500 transition-all no-underline">AI Assistant</Link>
          <Link to="/marketplace" onClick={close} className="text-5xl font-black text-white hover:text-emerald-500 transition-all no-underline">Marketplace</Link>
          <Link to="/explore" onClick={close} className="text-5xl font-black text-white hover:text-emerald-500 transition-all no-underline">Community</Link>
          <div className="pt-20">
            <Button component={Link} to="/register" onClick={close} fullWidth size="xl" className="bg-emerald-500 rounded-3xl h-20 text-2xl font-black">Join Now</Button>
          </div>
        </Stack>
      </Drawer>
    </div>
  );
}

function ChatBubble({ role, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: role === "user" ? 40 : -40, scale: 0.8 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
      className={`p-8 rounded-[2.5rem] max-w-[85%] border shadow-2xl ${
        role === "user" 
        ? "ml-auto bg-slate-900 text-white border-white/10 rounded-br-none" 
        : "bg-emerald-500 text-white border-none rounded-bl-none shadow-emerald-500/20"
      }`}
    >
      <div className="flex items-center gap-3 mb-3 opacity-50 font-black uppercase tracking-[0.2em] text-[10px]">
        {role === "user" ? <FiUsers /> : <FiZap />}
        {role === "user" ? "Protocol Request" : "AI Response"}
      </div>
      <Text fw={800} size="lg" className="leading-relaxed">{text}</Text>
    </motion.div>
  );
}

function FeatureCard({ feature, isFullWidth = false }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -10, scale: 1.01 }}
      className={`relative ${isFullWidth ? 'min-h-[400px]' : 'h-[550px]'} p-12 rounded-[4rem] bg-white/[0.03] border border-white/5 overflow-hidden group transition-all duration-700 backdrop-blur-3xl`}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.1), transparent 40%)`,
        }}
      />

      <div className="absolute -top-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform pointer-events-none">
        {React.cloneElement(feature.icon, { size: isFullWidth ? 400 : 300 })}
      </div>

      <div className={`relative z-10 h-full flex ${isFullWidth ? 'flex-col md:flex-row items-center gap-12' : 'flex-col'} justify-between`}>
        <div className={`space-y-8 ${isFullWidth ? 'flex-1' : ''}`}>
          <motion.div 
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20"
          >
            {React.cloneElement(feature.icon, { size: 32, className: "text-white" })}
          </motion.div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-8 bg-emerald-500" />
              <Text className="text-emerald-500 font-black uppercase tracking-[0.3em] text-[10px]">
                System {feature.title.split(' ')[0]}
              </Text>
            </div>
            <Title order={2} className={`${isFullWidth ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'} font-black mb-6 tracking-tighter leading-tight`}>
              {feature.title}
            </Title>
            <Text size="xl" className="text-slate-400 font-semibold leading-relaxed group-hover:text-slate-200 transition-colors max-w-xl">
              {feature.description}
            </Text>
          </div>
        </div>

        <motion.div 
          component={Link}
          to={feature.link}
          whileHover={{ x: 10 }}
          className={`flex items-center gap-6 cursor-pointer no-underline ${isFullWidth ? 'w-full md:w-auto mt-10 md:mt-0' : ''}`}
        >
          <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-all duration-500 shadow-2xl">
            <FiArrowRight className="text-white group-hover:scale-110 transition-transform" size={24} />
          </div>
          <div className="flex flex-col">
            <Text className="font-black uppercase tracking-[0.2em] text-xs group-hover:text-emerald-400 transition-colors">
              Initialize Access
            </Text>
            <Text size="xs" className="text-slate-600 font-bold">Protocol v1.0.4</Text>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
