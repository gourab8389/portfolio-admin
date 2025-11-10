"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, FolderGit2, Wrench, Briefcase, GraduationCap, UserRound } from "lucide-react";
import { Education, Experience, Profile, Project, Skill } from "@/types/object";
import { PublicApiInstance } from "@/lib/apis";
import { cn } from "@/lib/utils";

interface PortfolioResponse {
  success: boolean;
  message: string;
  data: {
    profile: Profile | null;
    education: Education[] | null;
    skills: Skill[] | null;
    experiences: Experience[] | null;
    projects: Project[] | null;
  };
}

type Stat = {
  key: "projects" | "skills" | "experiences" | "education" | "profile";
  title: string;
  count?: number;
  href: string;
  icon: React.ElementType;
  emptyText: string;
  emptyCta: string;
  ctaHref: string;
};

const DetailsPage = () => {
  const { data: response, isLoading, isError } = useQuery<PortfolioResponse>({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const res = await PublicApiInstance.get("/portfolio");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-5 w-40 mt-6" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !response?.success || !response?.data) {
    return (
      <Card className="p-10">
        <div className="flex w-full items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Couldn’t load your dashboard. Please try again.</span>
        </div>
      </Card>
    );
  }

  const { projects, skills, experiences, education, profile } = response.data;

  const stats: Stat[] =  [
      {
        key: "projects",
        title: "Total Projects",
        count: projects?.length ?? 0,
        href: "/dashboard/profiles/projects",
        icon: FolderGit2,
        emptyText: "No projects yet.",
        emptyCta: "Add Project",
        ctaHref: "/dashboard/profiles/projects",
      },
      {
        key: "skills",
        title: "Total Skills",
        count: skills?.length ?? 0,
        href: "/dashboard/profiles/skills",
        icon: Wrench,
        emptyText: "No skills added.",
        emptyCta: "Add Skill",
        ctaHref: "/dashboard/profiles/skills",
      },
      {
        key: "experiences",
        title: "Total Experiences",
        count: experiences?.length ?? 0,
        href: "/dashboard/profiles/experience",
        icon: Briefcase,
        emptyText: "No experiences yet.",
        emptyCta: "Add Experience",
        ctaHref: "/dashboard/profiles/experience",
      },
      {
        key: "education",
        title: "Total Education",
        count: education?.length ?? 0,
        href: "/dashboard/profiles/education",
        icon: GraduationCap,
        emptyText: "No education records.",
        emptyCta: "Add Education",
        ctaHref: "/dashboard/profiles/education",
      },
      {
        key: "profile",
        title: "Profile",
        // profile is singular, treat as 1/0
        count: profile ? 1 : 0,
        href: "/dashboard/profiles/details",
        icon: UserRound,
        emptyText: "Profile isn’t set up.",
        emptyCta: "Complete Profile",
        ctaHref: "/dashboard/profiles/details",
      },
    ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {stats.map((s) => {
        const Icon = s.icon;
        const isEmpty = (s.count ?? 0) === 0;

        return (
          <Card
            key={s.key}
            className={cn(
              "group relative overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg",
              "border-muted/50"
            )}
          >
            {/* Subtle background accent */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-primary/10 to-primary/0 blur-2xl" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="text-base font-semibold">{s.title}</div>
              <div className="rounded-2xl p-2 border bg-muted/30">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Count / Empty */}
            {!isEmpty ? (
              <>
                <div className="mt-4 text-2xl font-bold tracking-tight tabular-nums">
                  {s.count} {" "}
                  <span className="text-lg font-normal text-muted-foreground">{s.title.toLowerCase()}</span>
                </div>
                <div className="mt-6 flex items-center w-full justify-between gap-2">
                  <Button asChild variant="secondary" size="sm" className="transition-colors group-hover:bg-secondary">
                    <Link href={s.href}>Manage</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={s.href}>View</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-muted-foreground">{s.emptyText}</p>
                <div className="mt-10">
                  <Button asChild size="sm">
                    <Link href={s.ctaHref}>{s.emptyCta}</Link>
                  </Button>
                </div>
              </>
            )}

            {/* Make entire card clickable to its page */}
            <Link
              href={s.href}
              aria-label={`Open ${s.title}`}
              className="absolute inset-0"
            />
          </Card>
        );
      })}
    </div>
  );
};

export default DetailsPage;
