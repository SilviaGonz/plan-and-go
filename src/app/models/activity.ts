export interface Activity {
  id?: string;
  travelId: string;
  title: string;
  description: string;
  icon: string;
  activityLevel: 'bajo' | 'medio' | 'alto';
  location: string;
  link: string;
  suggestedDate: string;
  startTime: string;
  duration: string;
  costPerPerson: number;
  requiresReservation: boolean;
  notes: string;
  images: string[];
  proposedBy: string;
  proposedByName: string;
  votesUp: string[];
  votesDown: string[];
  votingStatus: 'open' | 'closed';
  createdAt?: any;
}
