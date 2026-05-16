import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const SETTINGS_KEY = ['user_settings'];

const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
    if (error) throw error;
    // Return defaults if no row exists yet
    return data ?? { allow_weekend_classes: false };
};

export const useSettings = () => {
    return useQuery({
        queryKey: SETTINGS_KEY,
        queryFn: fetchSettings,
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updates) => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('user_settings')
                .upsert({ user_id: user.id, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(SETTINGS_KEY, data);
        },
    });
};
