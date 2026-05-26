export interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tradeIds: string[];
  bio?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}