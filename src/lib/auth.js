import { supabase } from './supabase';

/**
 * Sign up a new user with email and password.
 */
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

/**
 * Sign in an existing user with email and password.
 */
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

/**
 * Sign out the currently authenticated user.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Get the current active session (returns null if not logged in).
 */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

/**
 * Get the currently logged in user object (returns null if not logged in).
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};