import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Household {
    id: string;
    name: string;
    created_by: string;
    created_at: string;
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
            const { data, error } = await supabase
                .from('households')
                .select('*');

            if (error) {
                console.error('Error fetching households:', error);
            } else {
                setHouseholds(data || []);
            }
        } finally {
            setLoading(false);
        }
    }

    async function createHousehold(name: string) {
        const { data: householdData, error: distError } = await supabase
            .from('households')
            .insert([{ name, created_by: (await supabase.auth.getUser()).data.user?.id }])
            .select()
            .single();

        if (distError) throw distError;

        // Add self as owner
        const { error: memberError } = await supabase
            .from('household_members')
            .insert([{
                household_id: householdData.id,
                user_id: (await supabase.auth.getUser()).data.user?.id,
                role: 'owner'
            }]);

        if (memberError) throw memberError;

        // Create a default list for the household
        const { error: listError } = await supabase
            .from('lists')
            .insert([{
                household_id: householdData.id,
                title: 'Groceries',
                created_by: (await supabase.auth.getUser()).data.user?.id
            }]);

        if (listError) console.error("Error creating default list", listError);

        setHouseholds([...households, householdData]);
        return householdData;
    }

    async function joinHousehold(inviteCode: string) {
        // For MVP, invite code is just the household ID
        const householdId = inviteCode.trim();

        // Check if household exists
        const { data: household, error: fetchError } = await supabase
            .from('households')
            .select('*')
            .eq('id', householdId)
            .single();

        if (fetchError || !household) {
            throw new Error('Invalid invite code. Please check and try again.');
        }

        // Check if already a member
        const userId = (await supabase.auth.getUser()).data.user?.id;
        const { data: existingMember } = await supabase
            .from('household_members')
            .select('*')
            .eq('household_id', householdId)
            .eq('user_id', userId)
            .single();

        if (existingMember) {
            throw new Error('You are already a member of this household.');
        }

        // Add as member
        const { error: memberError } = await supabase
            .from('household_members')
            .insert([{
                household_id: householdId,
                user_id: userId,
                role: 'member'
            }]);

        if (memberError) throw memberError;

        setHouseholds([...households, household]);
        return household;
    }

    return { households, loading, createHousehold, joinHousehold, refresh: fetchHouseholds };
}
