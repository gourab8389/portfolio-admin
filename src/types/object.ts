export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface Profile {
  id: number;
  email: string;
  name: string;
  phoneNumber?: string;
  address?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  profileImage?: string;
  resume?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  id: number;
  name: string;
  stream: string;
  grade: string;
  degree: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: number;
  name: string;
  proficiency: number;
  category?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExperienceType = "organization" | "internship" | "college_event";

export interface Experience {
  id: number;
  organizationName: string;
  role: string;
  description: string;
  startDate: string;
  endDate?: string;
  type: ExperienceType;
  location?: string;
  technologies?: string[];
  achievements?: string[];
  website?: string;
  logo?: string;
  isCurrentRole?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectType = "personal" | "client" | "academic" | "internship";

export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  description: string;
  githubLinks: string[];
  projectLinks: string[];
  technologies?: string[];
  features?: string[];
  images?: string[];
  status?: "completed" | "in-progress" | "planned";
  startDate?: string;
  endDate?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  message?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioData {
  profile: Profile;
  education: Education[];
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "admin";
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse
  extends ApiResponse<{
    user: AuthUser;
    token: string;
  }> {}
