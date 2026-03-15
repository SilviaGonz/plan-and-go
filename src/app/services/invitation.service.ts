import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { EmailService } from './email.service';
import { Invitation } from '../models/invitation';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private emailService = inject(EmailService);

  private generateToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async sendInvitations(
    travelId: string,
    travelName: string,
    emails: string[]
  ) {
    const user = this.auth.currentUser;
    if (!user) return;

    for (const email of emails) {
      const token = this.generateToken();

      await addDoc(collection(this.firestore, 'invitations'), {
        travelId,
        travelName,
        invitedEmail: email,
        invitedBy: user.uid,
        invitedByName: user.displayName || 'Un usuario',
        token,
        status: 'pending',
        createdAt: serverTimestamp()
      } as Invitation);

      await this.emailService.sendInvitationEmail(
        email,
        user.displayName || 'Un usuario',
        travelName,
        token
      );
    }
  }

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    const q = query(collection(this.firestore, 'invitations'), where('token', '==', token));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Invitation;
  }

  async acceptInvitation(invitationId: string, travelId: string) {
  const user = this.auth.currentUser;
  if (!user) return;

  await updateDoc(doc(this.firestore, 'invitations', invitationId), {
    status: 'accepted'
  });

  const travelRef = doc(this.firestore, 'travels', travelId);
  const travelSnap = await getDoc(travelRef);
  const travelData = travelSnap.data();

  const members = travelData?.['members'] || [];
  const updatedMembers = members.map((m: any) =>
    m.email === user.email ? { ...m, status: 'accepted', uid: user.uid } : m
  );

  const memberUids = travelData?.['memberUids'] || [];
  if (!memberUids.includes(user.uid)) memberUids.push(user.uid);

  await updateDoc(travelRef, { members: updatedMembers, memberUids });
}
}
