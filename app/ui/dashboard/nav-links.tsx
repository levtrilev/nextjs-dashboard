'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },
  { name: 'Admin', href: '/home/admin', icon: UserGroupIcon },
  // { name: 'Lesson', href: '/dashboard/lesson', icon: HomeIcon },
];
const subMenu = [
  { mainItem: 'Admin', name: 'Tenants', href: '/home/admin/tenants' },
  { mainItem: 'Admin', name: 'Users', href: '/home/admin/users' },
  { mainItem: 'Admin', name: 'Sections', href: '/home/admin/sections' },
  // { mainItem: 'Home', name: 'About', href: '/dashboard' },
  // { mainItem: 'Home', name: 'Contacts', href: '/dashboard' },
  // { mainItem: 'Home', name: 'Support', href: '/dashboard' },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Закрыть подменю при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <div key={link.name} className="relative">
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setActiveMenu(activeMenu === link.name ? null : link.name)}
              // className="flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
              className={clsx(
                'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
                {
                  'bg-sky-100 text-blue-600': pathname === link.href,
                },
              )}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>

            {/* Submenu */}
            {activeMenu === link.name && subMenu.findIndex(obj => obj.mainItem === link.name) !== -1 && (
              <div ref={menuRef}
                className="absolute left-60 top-full mt-2 w-48 rounded-md bg-white shadow-lg">
                <ul className="py-2">
                  {subMenu.map((item, index) => (link.name === item.mainItem &&
                    <li key={index}>
                      <Link
                        href={item.href}
                        onClick={() => setActiveMenu(null)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
