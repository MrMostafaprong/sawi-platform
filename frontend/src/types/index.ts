export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: "USER" | "FREELANCER" | "ADMIN";
  gender: string | null;
  phoneNumber: string | null;
  skills: string[];
  createdAt: string;
  city?: string | null;
  currency?: string | null;
}

export interface PortfolioItem {
  id: string;
  type: "IMAGE" | "VIDEO" | "LINK";
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  fileSize: number | null;
  mimeType: string | null;
  order: number;
  createdAt: string;
}

export interface UserPortfolio {
  id: string;
  title: string | null;
  description: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  hourlyRate: number | null;
  experienceYears: number | null;
  showContact: boolean;
  resumeUrl: string | null;
  items: PortfolioItem[];
}

export interface ProfileData {
  id: string;
  email?: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  gender: string | null;
  phoneNumber?: string | null;
  skills: string[];
  createdAt: string;
  city?: string | null;
  currency?: string | null;
  portfolio: UserPortfolio | null;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface CsrfResponse {
  csrfToken: string;
}

export interface GroupMember {
  id: string;
  role: string;
  joinedAt: string;
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  visibility: "PUBLIC" | "FEMALE_ONLY" | "PRIVATE" | "INVITE_ONLY";
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator?: { id: string; username: string; displayName: string | null; avatarUrl: string | null; gender?: string; city?: string } | null;
  members?: GroupMember[];
  isMember?: boolean;
  myRole?: string | null;
  isFollowing?: boolean;
  _count?: { members: number; follows?: number };
}

export interface GroupSearchResult {
  groups: Group[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  authorId: string;
  targetId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  author: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
}

export interface GroupReview {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
}

export interface GroupReviewListResult {
  reviews: GroupReview[];
  total: number;
  page: number;
  totalPages: number;
  avgRating: number;
  reviewCount: number;
}

export interface ReviewListResult {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  avgRating: number;
  reviewCount: number;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  updatedAt: string;
  reporter?: { id: string; username: string; displayName?: string | null };
  target: { id: string; username: string; displayName: string | null; avatarUrl?: string | null; email?: string | null };
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: string;
  status: string;
  gender: string | null;
  createdAt: string;
}
