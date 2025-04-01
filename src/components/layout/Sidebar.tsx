
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Upload,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  href,
  isActive,
  isCollapsed,
}) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center py-3 px-3 rounded-md text-sm font-medium transition-colors",
        isCollapsed ? "justify-center" : "space-x-3",
        isActive
          ? "bg-filehub text-white hover:bg-filehub-dark"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      )}
    >
      <div className="flex-shrink-0">{icon}</div>
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems = [
    {
      icon: <Home size={20} />,
      label: "Dashboard",
      href: "/",
    },
    {
      icon: <FileText size={20} />,
      label: "My Files",
      href: "/files",
    },
    {
      icon: <Upload size={20} />,
      label: "Upload",
      href: "/upload",
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      href: "/profile",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white dark:bg-gray-800 border-r transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b">
        {!isCollapsed && (
          <h1 className="font-bold text-xl text-filehub">FileHub</h1>
        )}
      </div>

      <div className="flex-1 py-4 px-3">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={location.pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>

      <div className="px-3 py-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex justify-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
