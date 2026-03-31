"use client";

import { cn } from "@/lib/utils";
import {
  Show,
  SignInButton,
  UserButton,
  useUser
} from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Library", href: "/" },
  { label: "Add New", href: "/books/new" },
  { label: "Pricing", href: "/subscriptions" },
];

const Navbar = () => {
  const pathName = usePathname();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathName, setPrevPathName] = useState(pathName);

  // Close menu on route change without an effect (avoids cascading renders)
  if (prevPathName !== pathName) {
    setPrevPathName(pathName);
    setMenuOpen(false);
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="w-full fixed z-50 bg-(--bg-primary)">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex gap-0.5 items-center">
          <Image src="/assets/logo.png" alt="Bookfied" width={42} height={26} />
          <span className="logo-text">Bookified</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex w-fit gap-7.5 items-center">
          {navItems.map(({ label, href }) => {
            const isActive =
              pathName === href || (href !== "/" && pathName.startsWith(href));
            return (
              <Link
                href={href}
                key={label}
                className={cn(
                  "nav-link-base",
                  isActive ? "nav-link-active" : "text-black hover:opacity-70",
                )}>
                {label}
              </Link>
            );
          })}

          <div className="flex gap-7.5 items-center">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="nav-link-base text-black hover:opacity-70 cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <div className="nav-user-link">
                <UserButton />
                {user?.firstName && (
                  <Link href="/subscriptions" className="nav-user-name ms-2">
                    {user.firstName}
                  </Link>
                )}
              </div>
            </Show>
          </div>
        </nav>

        {/* Mobile right side: user button + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Show when="signed-in">
            <div className="nav-user-link">
              <UserButton />
              {user?.firstName && (
                <Link href="/subscriptions" className="nav-user-name ms-2">
                  {user.firstName}
                </Link>
              )}
            </div>
          </Show>

          <button
            id="mobile-menu-toggle"
            className="nav-hamburger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}>
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={cn(
          "nav-mobile-menu",
          menuOpen ? "nav-mobile-menu-open" : "nav-mobile-menu-closed",
        )}>
        <nav className="flex flex-col px-5 py-4 gap-1">
          {navItems.map(({ label, href }) => {
            const isActive =
              pathName === href || (href !== "/" && pathName.startsWith(href));
            return (
              <Link
                href={href}
                key={label}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "nav-mobile-link",
                  isActive
                    ? "nav-mobile-link-active"
                    : "nav-mobile-link-default",
                )}>
                {label}
              </Link>
            );
          })}

          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                className="nav-mobile-link nav-mobile-link-default text-left w-full cursor-pointer"
                onClick={() => setMenuOpen(false)}>
                Sign In
              </button>
            </SignInButton>
          </Show>

          <Show when="signed-in">
            {user?.firstName && (
              <Link
                href="/subscriptions"
                onClick={() => setMenuOpen(false)}
                className="nav-mobile-link nav-mobile-link-default">
                {user.firstName}
              </Link>
            )}
          </Show>
        </nav>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 top-(--navbar-height) z-40 bg-black/20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
