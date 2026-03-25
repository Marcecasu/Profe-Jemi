import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
    }
    return data as UserProfile;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error.message);
        return [];
    }
    return (data as UserProfile[]) || [];
}

export async function updateUserRole(userId: string, role: 'user' | 'admin'): Promise<boolean> {
    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

    if (error) {
        console.error('Error updating role:', error.message);
        return false;
    }
    return true;
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) {
        console.error('Error deleting profile:', error.message);
        return false;
    }
    return true;
}

export async function updateUserSubscriptionStatus(userId: string, status: 'trial' | 'active' | 'past_due' | 'canceled'): Promise<boolean> {
    const { error } = await supabase
        .from('profiles')
        .update({ subscription_status: status })
        .eq('id', userId);

    if (error) {
        console.error('Error updating subscription status:', error.message);
        return false;
    }
    return true;
}
