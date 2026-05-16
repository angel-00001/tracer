import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const COURSES_KEY = ['courses'];

const fetchCourses = async () => {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

// Normalize DB field `required_attendance` → `required` so existing components
// (Stats, TodayView, CourseCard, CalendarView) don't need changes.
const normalizeCourse = (course) => ({ ...course, required: course.required_attendance });

export const useCourses = () => {
    return useQuery({
        queryKey: COURSES_KEY,
        queryFn: fetchCourses,
        select: (data) => data.map(normalizeCourse),
    });
};

export const useAddCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (course) => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('courses')
                .insert({ ...course, user_id: user.id })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_KEY }),
    });
};

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updates }) => {
            const { data, error } = await supabase
                .from('courses')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_KEY }),
    });
};

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const { error } = await supabase.from('courses').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: COURSES_KEY }),
    });
};
