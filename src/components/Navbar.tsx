"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

interface NavbarProps {
  /** Extra content to render between the logo and the auth section */
  children?: React.ReactNode;
  /** Content to render on the far right, next to the auth button */
  actions?: React.ReactNode;
}

export default function Navbar({ children, actions }: NavbarProps) {
  const { user, loading, configured, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
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
                title={user.email}
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
}
