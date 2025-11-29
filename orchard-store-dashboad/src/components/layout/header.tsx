"use client";

import { useState } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NotificationList } from "@/components/features/notification/notification-list";
import { useNotificationStore } from "@/stores/notification-store";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_MENU } from "@/config/menu";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface HeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  userAvatar?: string | null;
}

export function Header({ userName, userEmail, userAvatar }: HeaderProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const breadcrumbs = useBreadcrumbs();
  const { logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  // Kết nối WebSocket để nhận thông báo real-time
  useWebSocket();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleBreadcrumbClick = (href: string, isLast: boolean) => {
    if (!isLast) {
      router.push(href);
    }
  };

  const avatarInitial =
    userName?.trim()?.[0]?.toUpperCase() ??
    userEmail?.trim()?.[0]?.toUpperCase() ??
    "A";

  const renderAvatar = (sizeClass = "h-9 w-9") => (
    <Avatar className={`${sizeClass} border border-border`}>
      {userAvatar ? (
        <AvatarImage
          src={userAvatar}
          alt={userName || "Avatar"}
          className="object-cover"
          onError={(e) => {
            logger.warn("Header avatar failed to load:", userAvatar, e);
          }}
        />
      ) : null}
      <AvatarFallback className="bg-muted text-foreground font-semibold">
        {avatarInitial}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full items-center justify-between px-4 lg:px-8 text-foreground">
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted/40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="hidden lg:block min-w-0 flex-1">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={`${crumb.href}-${index}`}>
                      <BreadcrumbItem>
                        {crumb.isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={crumb.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleBreadcrumbClick(crumb.href, false);
                            }}
                            className="cursor-pointer"
                          >
                            {crumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!crumb.isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          <div className="relative flex items-center gap-2 text-foreground">
            <button
              type="button"
              className="hidden sm:flex rounded-lg p-2.5 text-muted-foreground transition-colors hover:text-foreground"
              title="Help"
            >
              <HelpCircle size={18} />
            </button>
            <ModeToggle />
            <Popover
              open={isNotificationOpen}
              onOpenChange={setIsNotificationOpen}
            >
              <PopoverTrigger
                className="relative rounded-lg p-2.5 text-muted-foreground transition-colors hover:text-foreground"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent
                align="end"
                side="bottom"
                className="w-[400px] p-0"
              >
                <NotificationList
                  onClose={() => setIsNotificationOpen(false)}
                />
              </PopoverContent>
            </Popover>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-all duration-200 focus:outline-none hover:bg-accent hover:text-accent-foreground focus:ring-1 focus:ring-primary/30"
                >
                  {renderAvatar()}
                  <span className="hidden text-sm font-semibold text-foreground transition-colors group-hover:text-accent-foreground lg:block">
                    {userName ?? "Admin"}
                  </span>
                  <ChevronDown
                    size={16}
                    className="hidden text-muted-foreground transition-colors group-hover:text-accent-foreground lg:block"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 z-100"
                align="end"
                sideOffset={8}
              >
                {/* Header Section */}
                <div className="p-2 text-foreground">
                  <div className="flex items-center gap-3">
                    {renderAvatar("h-10 w-10")}
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {userName ?? "Admin User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {userEmail ?? "admin@example.com"}
                      </p>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Group 1: Account */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="#" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Group 2: Danger Zone */}
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-background text-foreground">
          <div className="flex h-full flex-col">
            {/* Logo Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white font-bold">
                  O
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Orchard
                  </p>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Admin Console
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted/40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Menu Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-6 py-4">
              {ADMIN_MENU.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-accent text-accent-foreground border-l-4 border-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive ? "text-accent-foreground" : "text-muted-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
