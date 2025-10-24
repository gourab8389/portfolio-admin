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
    title: "Contacts",
    url: "/dashboard/contacts",
    icon: "user",
    isActive: false,
    shortcut: ["d", "c"],
    items: [],
  },
  {
    title: "Profiles",
    url: "#",
    icon: "box",
    isActive: false,
    shortcut: ["d", "p"],
    items: [
      {
        title: "Profile Details",
        shortcut: ["p", "d"],
        url: "/dashboard/profiles/details",
        icon: "fileBox",
      },
      {
        title: "Education",
        shortcut: ["p", "e"],
        url: "/dashboard/profiles/education",
        icon: "education",
      },
      {
        title: "Experience",
        shortcut: ["p", "x"],
        url: "/dashboard/profiles/experience",
        icon: "container",
      },
      {
        title: "Skills",
        shortcut: ["p", "s"],
        url: "/dashboard/profiles/skills",
        icon: "container",
      },
      {
        title: "Projects",
        shortcut: ["p", "r"],
        url: "/dashboard/profiles/projects",
        icon: "gitHub",
      },
    ],
  },
];


