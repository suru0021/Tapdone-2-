import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Home, BarChart3, Settings, Plus } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import ThemeBackground from "./ThemeBackground";

const Layout: React.FC = () => {
  const { colors } = useTheme();
  const location = useLocation();
  const isTabActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, Icon, label }: { to: string; Icon: any; label: string }) => {
    const active = isTabActive(to);
    return (
      <Link to={to}
        className="flex flex-col items-center justify-center flex-1 gap-1 py-2"
        style={{ color: active ? colors.accentPrimary : colors.textTertiary }}>
        <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden relative"
      style={{ backgroundColor: colors.background }}>

      {/* Premium Theme Background — behind everything */}
      <ThemeBackground />

      {/* Content — above background */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-10"
        style={{ WebkitOverflowScrolling: "touch" as any }}>
        <div className="max-w-md mx-auto min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t flex items-center h-20 z-40"
        style={{
          backgroundColor: colors.surface + "EE",
          borderColor: colors.border,
          backdropFilter: "blur(12px)",
        }}>
        <div className="flex w-full max-w-md mx-auto justify-around items-center">
          <NavItem to="/home" Icon={Home} label="Home" />
          <NavItem to="/stats" Icon={BarChart3} label="Stats" />

          {/* + Button */}
          <Link to="/add-habit"
            className="flex flex-col items-center justify-center flex-1 gap-1 py-2 active:scale-90 transition-transform"
            style={{ color: colors.accentPrimary }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.accentPrimary }}>
              <Plus size={26} strokeWidth={3} color={colors.background} />
            </div>
          </Link>

          <NavItem to="/settings" Icon={Settings} label="Settings" />
          <div className="flex-1" />
        </div>
      </nav>
    </div>
  );
};

export default Layout;
