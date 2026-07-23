"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

interface NavbarProps {
  /** Extra content to render between the logo and the auth section (desktop only) */
  children?: React.ReactNode;
  /** Content to render on the far right, next to the auth button (desktop only) */
  actions?: React.ReactNode;
  /** Extra actions to show below the editor toolbar on mobile create page */
  mobileActions?: React.ReactNode;
}

/* ---- SVG Icon Components ---- */

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      {!active && <path d="M9 21V12h6v9" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

function CreateIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {active ? (
        <>
          <circle cx="12" cy="12" r="10" fill="currentColor" stroke="none" />
          <path d="M12 8v8M8 12h8" stroke="white" strokeWidth={2} />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </>
      )}
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" strokeLinecap="round" />
    </svg>
  );
}

/* ---- Tabs Config ---- */

function useMobileTabs(userId: string | undefined) {
  return [
    { path: "/", label: "首页", icon: HomeIcon, exact: true },
    { path: "/create", label: "创建", icon: CreateIcon, exact: true },
    {
      path: userId ? `/user/${userId}` : "/auth",
      label: "我的",
      icon: UserIcon,
      exact: false,
    },
  ] as const;
}

/* ---- Component ---- */

export default function Navbar({ children, actions, mobileActions }: NavbarProps) {
  const pathname = usePathname();
  const { user, loading, configured, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tabs = useMobileTabs(user?.id);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* ======== Desktop Top Navbar ======== */
  const desktopNav = (
    <header className="hidden lg:block sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-lg font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            微坞
          </Link>
          {children}
        </div>

        {/* Right: Actions + Auth */}
        <div className="flex items-center gap-2">
          {actions}

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            /* Logged in */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title={user.email ?? ""}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {(user.email?.[0] ?? "U").toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm text-gray-700 max-w-[100px] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-30">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href={`/user/${user.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    我的主页
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in */
            <Link
              href="/auth"
              className="px-3 py-1.5 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              {configured ? "登录" : "登录/注册"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );

  /* ======== Mobile Bottom Tab Bar ======== */

  // Hide bottom tab bar on the create page (auth page also gets a simplified one)
  const hideBottomTabs = pathname === "/auth";

  const mobileBottomNav = !hideBottomTabs ? (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = tab.exact
            ? pathname === tab.path
            : pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 transition-colors ${
                active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <tab.icon active={active} />
              <span className={`text-[10px] mt-0.5 font-medium leading-none ${active ? "text-indigo-600" : ""}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  ) : null;

  /* ======== Mobile Top Bar (create page only) ======== */
  const mobileTopBar =
    pathname === "/create" ? (
      <header className="lg:hidden flex items-center justify-between h-12 px-4 bg-white border-b border-gray-200 flex-shrink-0">
        <Link href="/" className="text-base font-bold text-indigo-600">
          微坞
        </Link>
        <div className="flex items-center gap-1.5">
          {mobileActions}
        </div>
      </header>
    ) : null;

  return (
    <>
      {desktopNav}
      {mobileTopBar}
      {mobileBottomNav}
    </>
  );
}
