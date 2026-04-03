import { Link, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { authApi } from "../code_grind/api";
import {
  Brain,
  Users,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Target,
  Rocket,
  Star,
  GraduationCap,
  Play,
  ChevronDown,
  Code2,
  BookOpen,
  Trophy,
  Flame,
  Globe,
  Lock,
  Cpu,
  Layers,
  X,
  Mail,
  User as UserIcon
} from "lucide-react";

// ── Animated floating orb ──────────────────────────────────────────
function FloatingOrb({
  size,
  color,
  x,
  y,
  delay,
}: {
  size: number;
  color: string;
  x: string;
  y: string;
  delay: number;
}) {
  return (
    <div
      className="absolute rounded-full blur-3xl pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left: x,
        top: y,
        animation: `float ${6 + delay}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        opacity: 0.35,
      }}
    />
  );
}

// ── Animated counter ──────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target]);

  return (
    <div ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </div>
  );
}

// ── Typing animation ──────────────────────────────────────────────
function TypingText({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          if (charIndex < current.length) {
            setCharIndex((c) => c + 1);
          } else {
            setTimeout(() => setDeleting(true), 1500);
          }
        } else {
          if (charIndex > 0) {
            setCharIndex((c) => c - 1);
          } else {
            setDeleting(false);
            setWordIndex((w) => (w + 1) % words.length);
          }
        }
      },
      deleting ? 60 : 100
    );
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, wordIndex, words]);

  return (
    <span className="bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">
      {words[wordIndex].slice(0, charIndex)}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// ── Feature card ──────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  delay: number;
}) {
  return (
    <div
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-br ${gradient} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur`}
      />
      <div className="relative">
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ── Testimonial card ──────────────────────────────────────────────
function TestimonialCard({
  name,
  role,
  avatar,
  content,
  rating,
}: {
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}) {
  return (
    <div className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:border-[#6366f1]/40 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-1 mb-5">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#f59e0b] text-[#f59e0b]" />
        ))}
      </div>
      <p className="text-slate-300 leading-relaxed mb-6 text-lg">"{content}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg font-bold text-white">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-sm text-slate-400">{role}</div>
        </div>
      </div>
    </div>
  );
}

// ── Pricing card ──────────────────────────────────────────────────
function PricingCard({
  tier,
  price,
  features,
  highlighted,
}: {
  tier: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-3xl p-8 border transition-all duration-300 hover:-translate-y-2 ${
        highlighted
          ? "bg-gradient-to-br from-[#6366f1] to-[#a855f7] border-transparent shadow-2xl shadow-[#6366f1]/30"
          : "bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/30"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#f59e0b] to-[#ef4444] rounded-full text-sm font-bold text-white shadow-lg">
          Most Popular
        </div>
      )}
      <div className={`text-sm font-semibold mb-2 ${highlighted ? "text-white/80" : "text-[#6366f1]"}`}>{tier}</div>
      <div className={`text-5xl font-black mb-6 ${highlighted ? "text-white" : "text-white"}`}>{price}</div>
      <ul className="space-y-3 mb-8">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3">
            <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${highlighted ? "text-white" : "text-[#22c55e]"}`} />
            <span className={highlighted ? "text-white/90" : "text-slate-300"}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/app"
        className={`block w-full text-center py-3.5 rounded-2xl font-semibold transition-all hover:scale-105 ${
          highlighted
            ? "bg-white text-[#6366f1] hover:shadow-lg"
            : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}

// ── Main Landing Component ──────────────────────────────────────────
export function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState<'signin' | 'signup' | null>(null);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      let result;
      if (showAuthModal === 'signup') {
        result = await authApi.register(authName, authEmail, authPassword);
      } else {
        result = await authApi.login(authEmail, authPassword);
      }
      // Store token + user profile
      localStorage.setItem('auth_user', JSON.stringify({
        name: result.user.name,
        id: result.user.id,
        token: result.token,
      }));
      setShowAuthModal(null);
      navigate('/app');
    } catch (err: any) {
      setAuthError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset error when switching modal type
  const switchModal = (type: 'signin' | 'signup') => {
    setAuthError("");
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setShowAuthModal(type);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Adaptive Quizzes",
      description:
        "Our AI analyzes your performance in real-time and dynamically adjusts difficulty to maximize retention.",
      gradient: "from-[#6366f1] to-[#a855f7]",
      delay: 0,
    },
    {
      icon: Users,
      title: "Study Squad Challenges",
      description: "Form squads, compete on leaderboards, and celebrate victories together as a team.",
      gradient: "from-[#a855f7] to-[#ec4899]",
      delay: 100,
    },
    {
      icon: TrendingUp,
      title: "Deep Performance Insights",
      description:
        "Rich analytics dashboards that reveal your learning patterns, strengths, and blind spots.",
      gradient: "from-[#22c55e] to-[#10b981]",
      delay: 200,
    },
    {
      icon: GraduationCap,
      title: "Peer Teaching Network",
      description:
        "Learn by teaching others or get mentored by high-achieving students in your field.",
      gradient: "from-[#f59e0b] to-[#ef4444]",
      delay: 300,
    },
    {
      icon: Cpu,
      title: "Smart Study Plans",
      description: "Personalized roadmaps built by AI based on your goals, pace, and available time.",
      gradient: "from-[#06b6d4] to-[#6366f1]",
      delay: 400,
    },
    {
      icon: Globe,
      title: "Global Learning Feed",
      description: "Stay updated with curated content, tips, and breakthroughs from top learners worldwide.",
      gradient: "from-[#ec4899] to-[#f59e0b]",
      delay: 500,
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student @ MIT",
      avatar: "SJ",
      content:
        "Learnix transformed how I study. The adaptive quizzes pinpointed exactly what I needed to work on. I aced my algorithms exam!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Senior Software Engineer",
      avatar: "MC",
      content:
        "The study squad feature made learning fun and competitive. Went from struggling to mastering system design in 3 weeks!",
      rating: 5,
    },
    {
      name: "Emma Davis",
      role: "Data Science Graduate",
      avatar: "ED",
      content:
        "Best learning platform I've ever used. The insights are incredibly detailed — I could literally see my brain getting better.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080B1A] text-white overflow-x-hidden">
      {/* ── Global keyframe styles ── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        @keyframes beam {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(300%) rotate(45deg); }
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .hero-gradient {
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.3) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 40% at 80% 20%, rgba(168,85,247,0.2) 0%, transparent 60%),
                      #080B1A;
        }
        .text-shimmer {
          background: linear-gradient(90deg, #6366f1 0%, #a855f7 30%, #ec4899 50%, #a855f7 70%, #6366f1 100%);
          background-size: 400% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .glow-border {
          box-shadow: 0 0 0 1px rgba(99,102,241,0.5), 0 0 30px rgba(99,102,241,0.2);
        }
        .grid-bg {
          background-image: 
            linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridPulse 4s ease-in-out infinite;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          position: relative;
          overflow: hidden;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -75%;
          width: 50%;
          height: 200%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: beam 3s ease-in-out infinite;
        }
        .feature-badge {
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2));
          border: 1px solid rgba(99,102,241,0.4);
        }
        .dashboard-mockup {
          background: linear-gradient(135deg, rgba(15,20,45,0.95), rgba(25,30,60,0.95));
          border: 1px solid rgba(99,102,241,0.2);
        }
      `}</style>

      {/* ── Background grid ── */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />

      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FloatingOrb size={600} color="radial-gradient(circle, rgba(99,102,241,0.4), transparent)" x="10%" y="5%" delay={0} />
        <FloatingOrb size={500} color="radial-gradient(circle, rgba(168,85,247,0.3), transparent)" x="60%" y="10%" delay={2} />
        <FloatingOrb size={400} color="radial-gradient(circle, rgba(236,72,153,0.2), transparent)" x="80%" y="60%" delay={4} />
        <FloatingOrb size={350} color="radial-gradient(circle, rgba(34,197,94,0.15), transparent)" x="5%" y="70%" delay={1} />
      </div>

      {/* ── Navigation ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#080B1A]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] shadow-lg shadow-[#6366f1]/40" />
              <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">L</span>
              </div>
            </div>
            <span className="font-black text-xl tracking-tight">
              Learn<span className="text-shimmer">ix</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How It Works", "Pricing", "Testimonials"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAuthModal('signin')}
              className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthModal('signup')}
              className="btn-primary px-5 py-2.5 text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#6366f1]/30 hover:scale-105 hover:shadow-[#6366f1]/50 transition-all duration-300 flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero-gradient relative pt-36 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="feature-badge inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium text-[#a855f7] animate-bounce">
              <Sparkles className="w-4 h-4" />
              AI-Powered Adaptive Learning Platform
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-center text-6xl md:text-8xl font-black leading-[1.05] mb-6 tracking-tight">
            <span className="text-white">Master Any</span>
            <br />
            <TypingText words={["Algorithm", "Data Structure", "System Design", "Math Problem", "Any Subject"]} />
            <br />
            <span className="text-white">with AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-center text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Join{" "}
            <span className="text-white font-semibold">50,000+ students</span> using AI-powered quizzes, collaborative study squads, and real-time analytics to{" "}
            <span className="text-white font-semibold">10x their learning speed</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => setShowAuthModal('signup')}
              className="btn-primary group flex items-center gap-3 px-10 py-5 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-[#6366f1]/40 hover:scale-105 hover:shadow-[#6366f1]/60 transition-all duration-300"
            >
              <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVideoOpen(true)}
              className="group flex items-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
              Watch Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-20">
            {[
              { icon: CheckCircle2, text: "No credit card required", color: "text-[#22c55e]" },
              { icon: Lock, text: "Free forever plan", color: "text-[#22c55e]" },
              { icon: Zap, text: "Cancel anytime", color: "text-[#22c55e]" },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                <Icon className={`w-4 h-4 ${color}`} />
                {text}
              </div>
            ))}
          </div>

          {/* ── Dashboard Mockup ── */}
          <div className="relative max-w-5xl mx-auto">
            {/* Glow behind mockup */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#6366f1]/30 to-[#a855f7]/30 rounded-3xl blur-2xl" />

            <div className="dashboard-mockup relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Mockup Header */}
              <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <div className="flex-1 mx-4 bg-white/10 rounded-lg h-6 flex items-center px-3">
                  <span className="text-xs text-slate-400">learnix.app/dashboard</span>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="p-6 grid grid-cols-4 gap-4">
                {/* Sidebar mock */}
                <div className="col-span-1 space-y-2">
                  <div className="h-8 bg-[#6366f1]/30 rounded-xl flex items-center px-3 gap-2">
                    <div className="w-3 h-3 rounded bg-[#6366f1]" />
                    <div className="h-2 bg-white/20 rounded flex-1" />
                  </div>
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="h-8 bg-white/5 rounded-xl flex items-center px-3 gap-2">
                      <div className="w-3 h-3 rounded bg-white/20" />
                      <div className="h-2 bg-white/10 rounded flex-1" />
                    </div>
                  ))}
                </div>

                {/* Main content mock */}
                <div className="col-span-3 space-y-4">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "XP Today", value: "+350", color: "#6366f1" },
                      { label: "Streak", value: "12 🔥", color: "#f59e0b" },
                      { label: "Rank", value: "#47", color: "#22c55e" },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="text-xs text-slate-400 mb-1">{s.label}</div>
                        <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart mock */}
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="h-2 bg-white/20 rounded w-32 mb-4" />
                    <div className="flex items-end gap-2 h-20">
                      {[40, 65, 45, 80, 55, 95, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-lg"
                          style={{
                            height: `${h}%`,
                            background: `linear-gradient(to top, #6366f1, #a855f7)`,
                            opacity: 0.7 + i * 0.04,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Task list mock */}
                  <div className="space-y-2">
                    {[
                      { done: true, label: "Binary Trees Module" },
                      { done: true, label: "10 Algorithm Problems" },
                      { done: false, label: "Adaptive Quiz on Arrays" },
                    ].map((t) => (
                      <div key={t.label} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${t.done ? "border-[#22c55e] bg-[#22c55e]" : "border-white/30"}`}>
                          {t.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${t.done ? "text-slate-500 line-through" : "text-slate-300"}`}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="py-20 px-6 border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 50000, suffix: "+", label: "Active Learners", icon: Users },
              { value: 1000000, suffix: "+", label: "Problems Solved", icon: Code2 },
              { value: 95, suffix: "%", label: "Success Rate", icon: Trophy },
              { value: 200, suffix: "+", label: "Topics Covered", icon: BookOpen },
            ].map(({ value, suffix, label, icon: Icon }) => (
              <div key={label} className="text-center group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 border border-[#6366f1]/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-[#6366f1]" />
                </div>
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent mb-2">
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <div className="text-slate-400 font-medium text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 feature-badge rounded-full text-sm font-medium text-[#a855f7] mb-6">
              <Layers className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Everything You Need
              <br />
              <span className="text-shimmer">to Excel & Grow</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A complete learning ecosystem built with AI at its core — designed to make every study session count.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-32 px-6 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 feature-badge rounded-full text-sm font-medium text-[#a855f7] mb-6">
              <Rocket className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              3 Steps to
              <br />
              <span className="text-shimmer">Mastery</span>
            </h2>
            <p className="text-xl text-slate-400">Simple, proven, and incredibly effective</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-20 left-[calc(16.7%+24px)] right-[calc(16.7%+24px)] h-0.5 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899]" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: Target,
                  title: "Set Your Goals",
                  description: "Tell us what you want to learn and we'll craft a personalized AI-driven roadmap.",
                  color: "from-[#6366f1] to-[#a855f7]",
                },
                {
                  step: "02",
                  icon: Brain,
                  title: "Learn & Practice",
                  description: "Take adaptive quizzes, join study squads, and get real-time AI feedback.",
                  color: "from-[#a855f7] to-[#ec4899]",
                },
                {
                  step: "03",
                  icon: BarChart3,
                  title: "Track & Level Up",
                  description: "Monitor growth with rich insights and unlock achievements as you progress.",
                  color: "from-[#22c55e] to-[#06b6d4]",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="relative group">
                    <div className="glass-card rounded-3xl p-10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 text-center">
                      <div className="relative inline-block mb-8">
                        <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#080B1A] border-2 border-[#6366f1] flex items-center justify-center text-xs font-black text-[#6366f1]">
                          {item.step}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 feature-badge rounded-full text-sm font-medium text-[#a855f7] mb-6">
              <Star className="w-4 h-4 fill-current" />
              Student Reviews
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Loved by
              <br />
              <span className="text-shimmer">Thousands of Students</span>
            </h2>
            <p className="text-xl text-slate-400">Don't take our word for it — hear from our community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} {...t} />
            ))}
          </div>

          {/* Avatars row */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center -space-x-3">
              {["HC", "AK", "MS", "PL", "RJ", "NK"].map((av, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] border-2 border-[#080B1A] flex items-center justify-center text-xs font-bold"
                >
                  {av}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              Join{" "}
              <span className="text-white font-semibold">50,000+</span> learners already on Learnix
            </p>
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-32 px-6 bg-white/[0.02] border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 feature-badge rounded-full text-sm font-medium text-[#a855f7] mb-6">
              <Zap className="w-4 h-4" />
              Simple Pricing
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Invest in Your
              <br />
              <span className="text-shimmer">Future</span>
            </h2>
            <p className="text-xl text-slate-400">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <PricingCard
              tier="Free"
              price="$0"
              features={["5 adaptive quizzes/day", "Basic insights", "1 study squad", "Community feed"]}
            />
            <PricingCard
              tier="Pro"
              price="$12/mo"
              features={["Unlimited quizzes", "Deep analytics", "Unlimited squads", "AI study plans", "Priority support"]}
              highlighted
            />
            <PricingCard
              tier="Team"
              price="$29/mo"
              features={["Everything in Pro", "Teacher dashboard", "Student management", "Custom branding", "API access"]}
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            {/* Background glow */}
            <div className="absolute -inset-8 bg-gradient-to-r from-[#6366f1]/20 via-[#a855f7]/20 to-[#ec4899]/20 rounded-[3rem] blur-3xl" />

            <div className="relative glass-card rounded-[2rem] p-16 border-[#6366f1]/20">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#6366f1]/40">
                <Flame className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
                Ready to
                <br />
                <span className="text-shimmer">Transform?</span>
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Stop grinding through textbooks alone. Join tens of thousands of students learning smarter with{" "}
                <span className="text-white font-semibold">Learnix AI</span>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/app"
                  className="btn-primary flex items-center justify-center gap-3 px-10 py-5 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-[#6366f1]/40 hover:scale-105 transition-all duration-300"
                >
                  <Rocket className="w-5 h-5" />
                  Get Started — It's Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <p className="text-slate-500 text-sm mt-6">No credit card · Cancel anytime · 50K+ happy learners</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-16 px-6 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-lg">L</span>
                </div>
                <span className="font-black text-xl text-white">Learnix</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                The AI-powered learning platform that helps students master any subject faster.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Security"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-white mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-slate-500 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">© 2026 Learnix. All rights reserved.</p>
            <p className="text-slate-600 text-sm">Built with ❤️ for learners everywhere</p>
          </div>
        </div>
      </footer>

      {/* Video modal (placeholder) */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center p-6"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative bg-[#0F172A] rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            >
              ✕
            </button>
            <div className="aspect-video bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center mx-auto mb-4 shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <p className="text-slate-400">Demo video coming soon!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40 z-40 pointer-events-none">
        <ChevronDown className="w-6 h-6 text-white" />
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div
          className="fixed inset-0 z-[200] bg-[#080B1A]/80 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300"
          onClick={() => setShowAuthModal(null)}
        >
          <div
            className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAuthModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#6366f1]/30">
                 <span className="text-white font-black text-2xl">L</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {showAuthModal === 'signin' ? 'Welcome back' : 'Create an account'}
              </h3>
              <p className="text-slate-400 mt-2">
                {showAuthModal === 'signin' ? 'Enter your details to access your dashboard' : 'Start your incredible learning journey today.'}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              {showAuthModal === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} required={showAuthModal === 'signup'} className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#6366f1] transition-colors text-white placeholder:text-slate-500" placeholder="John Doe" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#6366f1] transition-colors text-white placeholder:text-slate-500" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#6366f1] transition-colors text-white placeholder:text-slate-500" placeholder="••••••••" />
                </div>
              </div>

              {/* Error message */}
              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {authError}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full btn-primary block text-center py-3.5 rounded-xl font-bold text-white shadow-lg shadow-[#6366f1]/30 hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {authLoading
                    ? (showAuthModal === 'signin' ? 'Signing in...' : 'Creating account...')
                    : (showAuthModal === 'signin' ? 'Sign In to Dashboard' : 'Create Free Account')
                  }
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-slate-400">
              {showAuthModal === 'signin' ? (
                 <>Don't have an account? <button onClick={() => switchModal('signup')} className="text-[#a855f7] font-medium hover:text-[#c084fc] transition-colors hover:underline">Sign up</button></>
              ) : (
                 <>Already have an account? <button onClick={() => switchModal('signin')} className="text-[#a855f7] font-medium hover:text-[#c084fc] transition-colors hover:underline">Sign in</button></>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
