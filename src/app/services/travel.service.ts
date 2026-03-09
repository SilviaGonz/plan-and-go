import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, where, doc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Travel } from '../models/travel';

@Injectable({
  providedIn: 'root'
})
export class TravelService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createTravel(travel: Omit<Travel, 'id' | 'createdBy' | 'createdAt'>) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const travelsRef = collection(this.firestore, 'travels');
    const docRef = await addDoc(travelsRef, {
      ...travel,
      createdBy: user.uid,
      createdAt: serverTimestamp()
    });

    return docRef.id;
  }

async getUserTravels(): Promise<Travel[]> {
  const user = this.auth.currentUser;
  if (!user) return [];
  const travelsRef = collection(this.firestore, 'travels');
  const q = query(travelsRef, where('createdBy', '==', user.uid), orderBy('startDate', 'asc'));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data()['startDate']?.toDate(),
    endDate: doc.data()['endDate']?.toDate(),
  })) as Travel[];
  return all.filter(t => !t.archived);
}

  getNextTrip(travels: Travel[]): Travel | null {
    const today = new Date();
    const upcoming = travels.filter(t => t.startDate > today);
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  async getTravelById(id: string): Promise<Travel | null> {
    const docRef = doc(this.firestore, 'travels', id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
        id: snapshot.id,
        ...snapshot.data(),
      startDate: snapshot.data()['startDate']?.toDate(),
      endDate: snapshot.data()['endDate']?.toDate(),
    } as Travel;
  }

  async updateTravel(id: string, travel: Partial<Travel>) {
    const docRef = doc(this.firestore, 'travels', id);
    await updateDoc(docRef, { ...travel });
  }

  async deleteTravel(id: string) {
    const docRef = doc(this.firestore, 'travels', id);
    await deleteDoc(docRef);
  }

  async archiveTravel(id: string) {
  const docRef = doc(this.firestore, 'travels', id);
  await updateDoc(docRef, { archived: true });
}

async restoreTravel(id: string) {
  const docRef = doc(this.firestore, 'travels', id);
  await updateDoc(docRef, { archived: false });
}

async getArchivedTravels(): Promise<Travel[]> {
  const user = this.auth.currentUser;
  if (!user) return [];
  const travelsRef = collection(this.firestore, 'travels');
  const q = query(travelsRef, where('createdBy', '==', user.uid), orderBy('startDate', 'asc'));
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data()['startDate']?.toDate(),
    endDate: doc.data()['endDate']?.toDate(),
  })) as Travel[];
  return all.filter(t => t.archived === true);
}

}
