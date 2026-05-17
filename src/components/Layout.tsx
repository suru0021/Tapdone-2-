import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Home, BarChart3, Settings, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../theme/ThemeContext";

const Layout: React.FC = () => {
  const { colors } = useTheme();
  const location = useLocation();

  const isTabActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, Icon, label }: { to: string; Icon: any; label: string }) => {
    const active = isTabActive(to);
    return (
      <Link
        to={to}
        className="flex flex-col items-center justify-center flex-1 gap-1 py-2 transition-colors"
        style={{ color: active ? colors.textPrimary : colors.textTertiary }}
      >
        <Icon size={24} strokeWidth={active ? 2.5 : 1.8} />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: colors.background }}>
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto min-h-full">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation — + button center mध्ये */}
      <nav
        className="fixed bottom-0 left-0 right-0 border-t flex items-center justify-around h-20 z-40"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <div className="flex w-full max-w-md mx-auto justify-around items-center">
          <NavItem to="/home" Icon={Home} label="Home" />
          <NavItem to="/stats" Icon={BarChart3} label="Stats" />

          {/* + Button — center मध्ये, nav च्या आत */}
          <Link
            to="/add-habit"
            className="flex flex-col items-center justify-center flex-1 gap-1 py-2 transition-transform active:scale-90"
            style={{ color: colors.accentPrimary }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.accentPrimary }}
            >
              <Plus size={26} strokeWidth={3} color={colors.background} />
            </div>
          </Link>

          <NavItem to="/settings" Icon={Settings} label="Settings" />
          {/* Empty space for balance */}
          <div className="flex-1" />
        </div>
      </nav>
    </div>
  );
};

export default Layout;
