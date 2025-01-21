"use client";

import { useUserStore } from "@/stores/userStore";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useEffect } from "react";
import axios from "axios";
import { useCookies } from "next-client-cookies";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountWithType } from "@/types/account";

export default function Header() {
  const { user, setUser, clearUser, clearToken, setToken } = useUserStore();
  const cookie = useCookies();

  const handleLogout = () => {
    cookie.remove("token");
    clearUser();
    clearToken();
  };

  useEffect(() => {
    const fetchData = async () => {
      const access_token = cookie.get("token");
      if (!access_token) return;
      setToken(access_token);
      await axios
        .get(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/account/me", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then((res) => {
          const data = res.data as AccountWithType;
          setUser(data);
        })
        .catch((error) => console.error(error));
    };

    fetchData();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center place-self-center">
        <div className="mr-4 grow hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold font-mono sm:inline-block">
              ParcelPoint
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/me">Personal Info</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <nav className="">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="">
                    {user.name.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/me">Personal Info</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost">Login / Register</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register">Register</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
