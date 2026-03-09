import { Member } from "./member";

export interface Travel {
  id?: string;
  icon: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  itineraryType: 'manual' | 'ai' | 'later';
  membersCount: number;
  members: Member[];
  images: string[];
  notes: string;
  createdBy: string;
  createdAt: Date;
  archived?: boolean;
}
