export interface Invitation {
  id?: string;
  travelId: string;
  travelName: string;
  invitedEmail: string;
  invitedBy: string;
  invitedByName: string;
  token: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: any;
}
