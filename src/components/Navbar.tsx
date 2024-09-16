"use client";
import React, { useEffect, useState } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const Navbar = ({ className }: { className?: string }) => {
  const { data: session } = useSession();
  const [active, setActive] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedIdentifier = localStorage.getItem("identifier");
    console.log(savedIdentifier);
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "GET",
      });
      if (response.ok) {
        localStorage.removeItem("identifier");
        router.push("/login");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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
            <MenuItem setActive={setActive} active={active} item="User">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center uppercase">
                  {identifier.charAt(0)}
                </div>
                <span className="text-red-800 dark:text-white">
                  {identifier}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:underline"
                >
                  Logout
                </button>
              </div>
            </MenuItem>
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