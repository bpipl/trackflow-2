
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

type HeaderProps = {
  title: string;
  onOpenSidebar: () => void;
};

export const Header = ({ title, onOpenSidebar }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-gray-200 bg-white px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2 md:hidden"
        onClick={onOpenSidebar}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
    </header>
  );
};
