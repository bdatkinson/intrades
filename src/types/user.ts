export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  mentorId?: string;
  tradeIds: string[];
  createdAt: Date;
  updatedAt: Date;
}