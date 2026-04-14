export interface Message {
  id?: string;
  travelId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}
