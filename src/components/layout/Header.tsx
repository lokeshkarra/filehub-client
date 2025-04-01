
import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBytes } from "@/lib/utils";

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-gray-800 flex items-center justify-between px-6">
      <div className="flex-1">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white hidden md:block">
          FileHub
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
            <div>
              {user.storage_used !== undefined && user.storage_limit !== undefined && (
                <div className="text-xs font-medium">
                  {formatBytes(user.storage_used)} / {formatBytes(user.storage_limit)}
                </div>
              )}
            </div>
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 focus:outline-none">
              <Avatar className="h-9 w-9 border border-gray-200 dark:border-gray-700">
                <AvatarImage src={user?.profile_picture} />
                <AvatarFallback>
                  {user?.username ? getInitials(user.username) : "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:block">{user?.username}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/profile">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link to="/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
