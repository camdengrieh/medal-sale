"use client";

import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AtSymbolIcon, BanknotesIcon, Bars3Icon, HomeIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  target?: string;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "https://brucejennerolympicgold.com",
    icon: <HomeIcon className="h-4 w-4" />,
    target: "_blank",
  },
  {
    label: "Auction",
    href: "/",
    icon: <BanknotesIcon className="h-4 w-4" />,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/1976medal",
    icon: <AtSymbolIcon className="h-4 w-4" />,
    target: "_blank",
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon, target }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              target={target}
              rel={target === "_blank" ? "noopener noreferrer" : undefined}
              className={`${
                isActive ? "outline-warning text-warning shadow-md" : ""
              } outline hover:outline-warning hover:text-warning hover:shadow-md focus:outline-warning focus:!bg-warning focus:text-black active:!text-neutral py-1.5 px-3 text-sm rounded-md overflow-hidden`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="sticky lg:static top-0 navbar bg-base-300 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-secondary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 gap-y-2 shadow bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex relative w-10 h-10">
            <Image alt="Medal Logo" className="cursor-pointer" fill src="/new_logo.svg" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold leading-tight">$MEDAL</span>
            <span className="text-xs">1976 Olympic Gold Medal</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
      </div>
    </div>
  );
};
