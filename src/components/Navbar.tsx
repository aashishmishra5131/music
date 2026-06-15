"use client";
import React, { useEffect, useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { useSession } from "next-auth/react";

const Navbar = ({ className }: { className?: string }) => {
  const { data: session } = useSession();
  const [active, setActive] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);

  useEffect(() => {
    const savedIdentifier = localStorage.getItem("identifier");
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, []);

  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <Link href={"/"}>
          <MenuItem setActive={setActive} active={active} item="Home" />
        </Link>
        <MenuItem setActive={setActive} active={active} item="Our Courses">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/courses">All courses</HoveredLink>
            <HoveredLink href="/courses">Basic Music Theory</HoveredLink>
            <HoveredLink href="/courses">Advanced Composition</HoveredLink>
          </div>
        </MenuItem>
        <Link href={"/contact"}>
          <MenuItem setActive={setActive} active={active} item="Contact Us" />
        </Link>

        {identifier ? (
          <>
            <Link href={"/my-courses"}>
              <MenuItem setActive={setActive} active={active} item="My Courses">
                <div className="flex flex-col space-y-2 text-sm min-w-[140px]">
                  <HoveredLink href="/my-courses">📚 Enrolled Courses</HoveredLink>
                  <HoveredLink href="/courses">🎵 Browse More</HoveredLink>
                </div>
              </MenuItem>
            </Link>
            <Link href={"/profile"}>
              <MenuItem setActive={setActive} active={active} item="Profile">
                <div className="flex items-center gap-3 min-w-[160px]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center uppercase font-bold text-sm flex-shrink-0">
                    {identifier.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{identifier}</p>
                    <p className="text-neutral-500 text-[11px]">View Profile</p>
                  </div>
                </div>
              </MenuItem>
            </Link>
          </>
        ) : (
          <Link href={"/login"}>
            <MenuItem setActive={setActive} active={active} item="Login" />
          </Link>
        )}
      </Menu>
    </div>
  );
};

export default Navbar;