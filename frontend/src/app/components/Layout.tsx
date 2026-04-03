import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Home,
  Calendar,
  Brain,
  TrendingUp,
  Users,
  GraduationCap,
  Newspaper,
  User,
  BookOpen,
  Search,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  Code2,
  Shield,
} from "lucide-react";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [authUser, setAuthUser] = useState({ name: 'Guest', letter: 'G', role: 'user' });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAuthUser({ name: parsed.name, letter: parsed.name.charAt(0).toUpperCase(), role: parsed.role || 'user' });
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    } else {
      setAuthUser({ name: 'Guest', letter: 'G', role: 'user' });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    setAuthUser({ name: 'Guest', letter: 'G', role: 'user' });
    navigate('/');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  let navItems = [];
  
  if (authUser.role === 'admin') {
    navItems = [
      { path: "/app/admin", label: "Admin Center", icon: Shield }
    ];
  } else {
    navItems = [
      { path: "/app", label: "Dashboard", icon: Home },
      { path: "/app/study-plan", label: "Study Plan", icon: Calendar },
      { path: "/app/quiz", label: "Quiz", icon: Brain },
      { path: "/app/insights", label: "Insights", icon: TrendingUp },
      { path: "/app/squad", label: "Squad", icon: Users },
      { path: "/app/teaching", label: "Teaching", icon: GraduationCap },
      { path: "/app/feed", label: "Feed", icon: Newspaper },
      { path: "/app/code-grind", label: "Code Grind", icon: Code2 },
      { path: "/app/profile", label: "Profile", icon: User },
      { path: "/app/teacher-dashboard", label: "Teacher Dashboard", icon: BookOpen },
    ];
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } transition-all duration-300 bg-sidebar border-r border-sidebar-border flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="font-bold text-sidebar-foreground text-lg hover:opacity-80 transition-opacity">Learnix</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 hover:bg-sidebar-accent rounded-xl transition-all border border-transparent hover:border-sidebar-border"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-sidebar-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-sidebar-foreground" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-105"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:scale-105"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shadow-sm">
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses, topics, or users..."
                className="w-full pl-12 pr-4 py-2.5 bg-secondary border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 ml-6">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="relative p-2.5 hover:bg-secondary rounded-xl transition-all group border border-transparent hover:border-border"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              <div className="relative w-5 h-5">
                {darkMode ? (
                  <Sun className="w-5 h-5 text-[#f59e0b] animate-in fade-in zoom-in duration-200" />
                ) : (
                  <Moon className="w-5 h-5 text-[#6366f1] animate-in fade-in zoom-in duration-200" />
                )}
              </div>
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 hover:bg-secondary rounded-xl transition-all border border-transparent hover:border-border">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card"></span>
            </button>

            {/* User Avatar */}
            <div className="relative group z-50">
              <button className="flex items-center gap-3 p-2 pr-4 hover:bg-secondary rounded-xl transition-all border border-transparent hover:border-border">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold">{authUser.letter}</span>
                </div>
                <span className="font-medium text-foreground hidden md:block">{authUser.name}</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2 space-y-1">
                  <Link to="/app/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Profile
                  </Link>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
