import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, orderBy } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Activity } from '../models/activity';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async getActivities(travelId: string): Promise<Activity[]> {
    const ref = collection(this.firestore, 'activities');
    const q = query(ref, where('travelId', '==', travelId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Activity[];
  }

  async createActivity(activity: Omit<Activity, 'id' | 'createdAt'>) {
    const ref = collection(this.firestore, 'activities');
    const docRef = await addDoc(ref, { ...activity, createdAt: serverTimestamp() });
    return docRef.id;
  }

  async vote(activityId: string, type: 'up' | 'down') {
    const user = this.auth.currentUser;
    if (!user) return;
    const uid = user.uid;

    const ref = doc(this.firestore, 'activities', activityId);
    const all = await getDocs(query(collection(this.firestore, 'activities'), where('__name__', '==', activityId)));
    const data = all.docs[0].data() as Activity;

    let votesUp = [...(data.votesUp || [])];
    let votesDown = [...(data.votesDown || [])];

    if (type === 'up') {
      votesUp = votesUp.includes(uid) ? votesUp.filter(v => v !== uid) : [...votesUp.filter(v => v !== uid), uid];
      votesDown = votesDown.filter(v => v !== uid);
    } else {
      votesDown = votesDown.includes(uid) ? votesDown.filter(v => v !== uid) : [...votesDown.filter(v => v !== uid), uid];
      votesUp = votesUp.filter(v => v !== uid);
    }

    await updateDoc(ref, { votesUp, votesDown });
  }

  async getPendingVotesCount(userId: string, travelIds: string[]): Promise<number> {
  if (!travelIds.length) return 0;
  let count = 0;
  for (const travelId of travelIds) {
    const activities = await this.getActivities(travelId);
    const pending = activities.filter(a =>
      a.votingStatus === 'open' &&
      !a.votesUp.includes(userId) &&
      !a.votesDown.includes(userId)
    );
    count += pending.length;
  }
  return count;
}
}
