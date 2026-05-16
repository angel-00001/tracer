import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const TIMETABLE_KEY = ['timetable'];

const fetchTimetable = async () => {
    const { data, error } = await supabase
        .from('timetable')
        .select('*')
        .order('day', { ascending: true });
    if (error) throw error;
    return data;
};

export const useTimetable = () => {
    return useQuery({
        queryKey: TIMETABLE_KEY,
        queryFn: fetchTimetable,
    });
};

export const useUpsertTimetableSlot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (slot) => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('timetable')
                .upsert(
                    { ...slot, user_id: user.id },
                    { onConflict: 'user_id,day,slot_index' }
                )
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TIMETABLE_KEY }),
    });
};

export const useDeleteTimetableSlot = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ day, slot_index }) => {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('timetable')
                .delete()
                .match({ user_id: user.id, day, slot_index });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: TIMETABLE_KEY }),
    });
};
