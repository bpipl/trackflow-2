
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  FileText, 
  List, 
  User, 
  LogOut,
  Weight,
  MapPin,
  MessageSquare,
  FileEdit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  adminOnly?: boolean;
  userRole?: 'admin' | 'user';
  onClick?: () => void;
};

const NavItem = ({ to, icon: Icon, children, adminOnly = false, userRole = 'user', onClick }: NavItemProps) => {
  // Skip rendering if it's an admin-only item and the user is not an admin
  if (adminOnly && userRole !== 'admin') {
    return null;
  }

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors',
          isActive
            ? 'bg-courier-700 text-white'
            : 'text-gray-700 hover:bg-courier-100 hover:text-courier-700'
        )
      }
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{children}</span>
    </NavLink>
  );
};

type SidebarProps = {
  userRole?: 'admin' | 'user';
  onLogout?: () => void;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
};

export const Sidebar = ({ 
  userRole = 'user', 
  onLogout = () => {}, 
  isSidebarOpen, 
  onCloseSidebar 
}: SidebarProps) => {
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    if (isMobile) {
      onCloseSidebar();
    }
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'md:translate-x-0'
      )}
    >
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-bold text-courier-800">TrackFlow</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        <NavItem to="/" icon={Home} onClick={handleClick}>
          Dashboard
        </NavItem>
        <NavItem to="/customers" icon={Users} onClick={handleClick}>
          Customers
        </NavItem>
        <NavItem to="/senders" icon={MapPin} onClick={handleClick}>
          Sender Addresses
        </NavItem>
        <NavItem to="/couriers" icon={Package} onClick={handleClick}>
          Courier Partners
        </NavItem>
        <NavItem to="/slips" icon={FileText} onClick={handleClick}>
          Generate Slips
        </NavItem>
        <NavItem to="/weights" icon={Weight} onClick={handleClick}>
          Box Weights
        </NavItem>
        <NavItem to="/reports" icon={List} onClick={handleClick}>
          Reports
        </NavItem>
        <NavItem to="/whatsapp-settings" icon={MessageSquare} onClick={handleClick}>
          WhatsApp Settings
        </NavItem>
        <NavItem to="/templates" icon={FileEdit} onClick={handleClick}>
          Template Editor
        </NavItem>
        <NavItem to="/onboarding" icon={Users} onClick={handleClick}>
          Customer Onboarding
        </NavItem>
        <NavItem to="/logs" icon={List} adminOnly onClick={handleClick} userRole={userRole}>
          Audit Logs
        </NavItem>
        <NavItem to="/users" icon={User} adminOnly onClick={handleClick} userRole={userRole}>
          User Management
        </NavItem>
      </nav>
      <div className="border-t border-gray-200 p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start text-left text-xs" 
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};
