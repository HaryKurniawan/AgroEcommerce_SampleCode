"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import {
  User,
  Search,
  Leaf,
  ChevronDown,
  MessageCircle,
  Package,
  LogOut,
  ArrowLeft,
} from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { authApi, chatApi } from "@/lib/ecommerce-api";

import CartCountButton from "./CartCountButton";

const NavbarContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (isAuthenticated) {
        try {
          const res = await chatApi.getUnreadCount();
          const count = typeof res.data?.data === "number" ? res.data.data : 0;
          setUnreadChatCount(count);
        } catch (error: any) {
          // Silent fallback for 502 or other server issues to avoid console spam
          if (error?.response?.status !== 502) {
            console.error("Error fetching unread chat count:", error);
          }
          setUnreadChatCount(0);
        }
      }
    };
    fetchUnreadCount();
  }, [isAuthenticated, pathname]);

  // Sync navbar search input with URL params completely
  useEffect(() => {
    Promise.resolve().then(() => setSearchQuery(searchParams?.get("q") || ""));
  }, [searchParams]);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      useAuthStore.getState().clearAuth();
      setIsDropdownOpen(false);
      router.push("/login");
    }
  };

  const isAuth =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/forgot-password") ||
    pathname?.startsWith("/portal-staf-agro-99");

  const isPublicRoute =
    pathname === "/" ||
    pathname?.startsWith("/katalog") ||
    pathname?.startsWith("/produk") ||
    pathname?.startsWith("/toko");

  // Tolak render navbar:
  // 1. Sedang di halaman login/register/admin portal
  // 2. ATAU Pengunjung (guest) mengakses URL yang bukan public (seperti 404 atau maksa ke URL restricted)
  if (isAuth || (!isAuthenticated && !isPublicRoute)) return null;

  // Booking link hanya tampil untuk verified B2B
  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Toko", path: "/toko" },
    { label: "Katalog", path: "/katalog" },
  ];

  return (
    <header className="hidden lg:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      {/* Main Bar */}
      <div className="desktop-container px-6">
        <div className="flex items-center gap-6 lg:gap-10 py-4">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
              <Leaf size={20} className="text-white" />
            </div>
            <h1 className="font-display font-semibold text-2xl text-gray-900 leading-tight tracking-tight">
              Agro
            </h1>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-sm lg:max-w-md mr-auto hidden md:block">
            <div className="flex w-full h-10 border border-gray-300 hover:border-gray-400 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-50 rounded-full overflow-visible transition-all bg-gray-50/50 relative">
              <div className="relative h-full" ref={categoryDropdownRef}>
                <button
                  onClick={() =>
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                  }
                  className="flex h-full items-center justify-center gap-2 px-5 min-w-[100px] border-r border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 flex-shrink-0 rounded-l-full"
                >
                  Filter{" "}
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-48 bg-white border border-gray-100 shadow-xl rounded-2xl z-[60] overflow-hidden py-2">
                    {[
                      "Semua Kategori",
                      "Sayur Segar",
                      "Buah Buahan",
                      "Bumbu Dapur",
                      "Beras & Biji",
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${selectedCategory === cat ? "bg-primary-50 text-primary-700 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Cari sayur, buah, atau toko..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim())
                    router.push(
                      `/katalog?q=${encodeURIComponent(searchQuery.trim())}`,
                    );
                }}
                className="flex-1 px-4 py-2 outline-none text-sm text-gray-700 bg-transparent w-full"
              />
              <button
                onClick={() => {
                  if (searchQuery.trim())
                    router.push(
                      `/katalog?q=${encodeURIComponent(searchQuery.trim())}`,
                    );
                }}
                className="w-12 flex items-center justify-center text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0"
              >
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Chat */}
                <button
                  onClick={() => router.push("/chat")}
                  className={`relative p-2 hover:bg-gray-50 rounded-xl transition-colors ${
                    pathname.startsWith("/chat")
                      ? "bg-primary-50 text-primary-600"
                      : ""
                  }`}
                  title="Chat"
                >
                  <MessageCircle size={22} className="text-gray-600" />
                  {unreadChatCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                      {unreadChatCount}
                    </span>
                  )}
                </button>

                {/* Cart */}
                <CartCountButton variant="light" size="md" />

                <div className="h-6 w-px bg-gray-200 mx-1" />

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1.5 hover:bg-gray-50 rounded-xl transition-colors border border-transparent"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                      <User size={16} className="text-primary-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user?.name || "Profil"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl z-50 overflow-hidden py-2">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user?.name || "Pengguna"}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/profil");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <User size={18} className="text-gray-400" /> Profil
                      </button>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          router.push("/pesanan");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      >
                        <Package size={18} className="text-gray-400" /> Pesanan
                        Saya
                      </button>
                      <div className="border-t border-gray-50 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end flex-1 min-w-max">
                <button
                  onClick={() => router.push("/login")}
                  className="px-6 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-full flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} /> Masuk
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav Links (Bottom Bar) — show links on main pages, back button on others */}
      {(() => {
        const mainNavPaths = ["/", "/toko", "/katalog"];
        const isMainPage = mainNavPaths.some(
          (p) => pathname === p || (p !== "/" && pathname.startsWith(p)),
        );

        return (
          <div className="border-t border-gray-200 hidden lg:block bg-white">
            <div className="desktop-container px-6">
              {isMainPage ? (
                <nav className="flex items-center gap-8 h-12">
                  {navLinks.map((link) => {
                    const isActive =
                      pathname === link.path ||
                      (link.path !== "/" && pathname.startsWith(link.path));
                    return (
                      <button
                        key={link.path}
                        onClick={(e) => {
                          e.preventDefault();
                          if (
                            link.path !== "/" &&
                            !useAuthStore.getState().isAuthenticated
                          ) {
                            useAuthStore.getState().openLoginModal();
                          } else {
                            router.push(link.path);
                          }
                        }}
                        className={`text-[15px] font-medium transition-all py-3 relative ${
                          isActive
                            ? "text-primary-700 font-semibold"
                            : "text-gray-600 hover:text-primary-600"
                        }`}
                      >
                        {link.label}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-t-full" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              ) : (
                <nav className="flex items-center h-12">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[15px] font-medium text-gray-600 hover:text-primary-600 transition-all py-3 -ml-1 group"
                  >
                    <ArrowLeft
                      size={16}
                      className="transition-transform group-hover:-translate-x-0.5"
                    />
                    Kembali
                  </button>
                </nav>
              )}
            </div>
          </div>
        );
      })()}
    </header>
  );
};

const Navbar: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="h-[73px] bg-white border-b border-gray-200 hidden lg:block" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
};

export default Navbar;
