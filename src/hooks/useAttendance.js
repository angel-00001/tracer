import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

const ATTENDANCE_KEY = ['attendance'];

const fetchAttendance = async () => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const useAttendance = () => {
  const queryClient = useQueryClient();
  const [syncingKeys, setSyncingKeys] = useState({});

  const query = useQuery({
    queryKey: ATTENDANCE_KEY,
    queryFn: fetchAttendance,
  });

  const markMutation = useMutation({
    mutationFn: async ({ courseCode, date, status }) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (status) {
        const { error } = await supabase
          .from('attendance')
          .upsert(
            { course_code: courseCode, date, status, user_id: user.id },
            { onConflict: 'course_code,date,user_id' }
          );
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance')
          .delete()
          .match({ course_code: courseCode, date, user_id: user.id });
        if (error) throw error;
      }
    },
    onMutate: async ({ courseCode, date, status }) => {
      const key = `${courseCode}-${date}`;
      setSyncingKeys(prev => ({ ...prev, [key]: true }));

      await queryClient.cancelQueries({ queryKey: ATTENDANCE_KEY });
      const previous = queryClient.getQueryData(ATTENDANCE_KEY);

      queryClient.setQueryData(ATTENDANCE_KEY, (old) => {
        const filtered = (old || []).filter(
          (a) => !(a.course_code === courseCode && a.date === date)
        );
        if (status) {
          return [...filtered, { course_code: courseCode, date, status }];
        }
        return filtered;
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(ATTENDANCE_KEY, context.previous);
    },
    onSettled: (_data, _err, { courseCode, date }) => {
      const key = `${courseCode}-${date}`;
      setSyncingKeys(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });

  const markAttendance = (courseCode, date, status) =>
    markMutation.mutateAsync({ courseCode, date, status });

  return {
    attendance: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    syncing: syncingKeys,
    markAttendance,
    refetch: query.refetch,
  };
};