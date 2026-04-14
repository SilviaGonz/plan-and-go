import { Injectable, inject } from '@angular/core';
  import { Firestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc, limit } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Message } from '../models/message';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  sendMessage(travelId: string, text: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return Promise.reject('No autenticado');

    const messagesRef = collection(this.firestore, `travels/${travelId}/messages`);
    return addDoc(messagesRef, {
      travelId,
      userId: user.uid,
      userName: user.displayName || user.email || 'Usuario',
      text,
      createdAt: serverTimestamp()
    }).then(() => {});
  }

  listenMessages(travelId: string, callback: (messages: Message[]) => void): () => void {
    const messagesRef = collection(this.firestore, `travels/${travelId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    return onSnapshot(q, snapshot => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()['createdAt']?.toDate() || new Date()
      })) as Message[];
      callback(messages);
    });
  }

async updateLastVisit(travelId: string): Promise<void> {
  const user = this.auth.currentUser;
  if (!user) return;
  const ref = doc(this.firestore, `travels/${travelId}/chatVisits/${user.uid}`);
  await setDoc(ref, { lastVisit: serverTimestamp() });
}

async getUnreadCount(travelId: string): Promise<number> {
  const user = this.auth.currentUser;
  if (!user) return 0;

  const visitRef = doc(this.firestore, `travels/${travelId}/chatVisits/${user.uid}`);
  const visitSnap = await getDoc(visitRef);
  const lastVisit = visitSnap.data()?.['lastVisit']?.toDate() || new Date(0);

  const messagesRef = collection(this.firestore, `travels/${travelId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDoc(doc(this.firestore, `travels/${travelId}`));

  // Contar mensajes después de la última visita que no son del usuario actual
  const messagesSnap = await new Promise<any>((resolve) => {
    const unsub = onSnapshot(query(messagesRef, orderBy('createdAt', 'asc')), snap => {
      resolve(snap);
      unsub();
    });
  });

  return messagesSnap.docs.filter((d: any) => {
    const data = d.data();
    const createdAt = data['createdAt']?.toDate() || new Date(0);
    return createdAt > lastVisit && data['userId'] !== user.uid;
  }).length;
}

}
