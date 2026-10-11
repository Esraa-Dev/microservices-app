'use client';

interface SidebarMenuProps {
  title: string;
  children: React.ReactNode;
}

const SidebarMenu = ({
  title,
  children,
}: SidebarMenuProps) => {

  return (
    <div className="block">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-white">
        {title}
      </h3>

      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

export default SidebarMenu;