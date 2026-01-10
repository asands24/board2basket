import { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    arrayUnion,
    Timestamp
} from 'firebase/firestore';

export interface Household {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
    member_ids: string[];
    roles: Record<string, string>; // { uid: role }
}

export function useHouseholds() {
    const [households, setHouseholds] = useState<Household[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHouseholds();
    }, []);

    async function fetchHouseholds() {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                setHouseholds([]);
                return;
            }

            const q = query(
                collection(db, 'households'),
                where('member_ids', 'array-contains', user.uid)
            );

            const querySnapshot = await getDocs(q);
            const loadedHouseholds: Household[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                loadedHouseholds.push({
                    id: doc.id,
                    name: data.name,
                    created_by: data.created_by,
                    created_at: data.created_at?.toDate?.().toISOString() || new Date().toISOString(),
                    member_ids: data.member_ids,
                    roles: data.roles
                });
            });

            setHouseholds(loadedHouseholds);
        } catch (error) {
            console.error('Error fetching households:', error);
        } finally {
            setLoading(false);
        }
    }

    async function createHousehold(name: string) {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const newHouseholdData = {
            name,
            created_by: user.uid,
            created_at: Timestamp.now(),
            member_ids: [user.uid],
            roles: { [user.uid]: 'owner' }
        };

        const docRef = await addDoc(collection(db, 'households'), newHouseholdData);

        // Create a default list for the household
        // Using root 'lists' collection for simplicity
        await addDoc(collection(db, 'lists'), {
            household_id: docRef.id,
            title: 'Groceries',
            created_by: user.uid,
            created_at: Timestamp.now()
        });

        const newHousehold: Household = {
            id: docRef.id,
            ...newHouseholdData,
            created_at: new Date().toISOString()
        };

        setHouseholds([...households, newHousehold]);
        return newHousehold;
    }

    async function joinHousehold(inviteCode: string) {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        // For MVP, invite code is just the household ID
        const householdId = inviteCode.trim();

        const householdRef = doc(db, 'households', householdId);
        const householdSnap = await getDoc(householdRef);

        if (!householdSnap.exists()) {
            throw new Error('Invalid invite code. Please check and try again.');
        }

        const householdData = householdSnap.data();
        if (householdData.member_ids.includes(user.uid)) {
            throw new Error('You are already a member of this household.');
        }

        // Add as member
        await updateDoc(householdRef, {
            member_ids: arrayUnion(user.uid),
            [`roles.${user.uid}`]: 'member'
        });

        const updatedHousehold: Household = {
            id: householdSnap.id,
            name: householdData.name,
            created_by: householdData.created_by,
            created_at: householdData.created_at?.toDate?.().toISOString() || new Date().toISOString(),
            member_ids: [...householdData.member_ids, user.uid],
            roles: { ...householdData.roles, [user.uid]: 'member' }
        };

        setHouseholds([...households, updatedHousehold]);
        return updatedHousehold;
    }

    return { households, loading, createHousehold, joinHousehold, refresh: fetchHouseholds };
}
