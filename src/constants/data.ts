import { NavItem } from "@/types";

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: "user",
    isActive: false,
    shortcut: ["u", "u"],
    items: [],
  },
  {
    title: "Applications",
    url: "/dashboard/applications",
    icon: "fileText",
    isActive: false,
    shortcut: ["a", "a"],
    items: [],
  },
  {
    title: "Branch",
    url: "#",
    icon: "box",
    isActive: false,
    shortcut: ["b", "b"],
    items: [
      {
        title: "Create New",
        shortcut: ["b", "n"],
        url: "/dashboard/b/new",
        icon: "fileBox",
      },
      {
        title: "List",
        shortcut: ["b", "l"],
        url: "/dashboard/b/list",
        icon: "container",
      },
    ],
  },
];


