"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Building,
  AlertTriangle,
  FileText,
  Users,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardNav() {
  const { user } = useUser();
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Building,
    },
    {
      name: "Buildings",
      href: "/buildings",
      icon: Building,
    },
    {
      name: "Deviations",
      href: "/deviations",
      icon: AlertTriangle,
    },
    {
      name: "Substances",
      href: "/substances",
      icon: FileText,
    },
    {
      name: "Users",
      href: "/users",
      icon: Users,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">BMS</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "flex items-center space-x-2",
                    pathname === item.href && "bg-blue-600 text-white"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <UserButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4 border-t">
          <div className="grid grid-cols-3 gap-2">
            {navigation.slice(0, 6).map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  className="flex flex-col items-center space-y-1 h-auto py-2"
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{item.name}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
