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

export async function updateUserSubscriptionStatus(userId: string, status: 'free' | 'trial' | 'active' | 'past_due' | 'canceled'): Promise<boolean> {
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

export async function incrementLiveMinutes(userId: string, currentMinutes: number, addedMinutes: number): Promise<number> {
    const newTotal = Math.max(0, currentMinutes + addedMinutes);
    try {
        await supabase
            .from('profiles')
            .update({ live_minutes_used: newTotal })
            .eq('id', userId);
    } catch (e) {
        console.warn('Could not persist live minutes to supabase, falling back to local storage', e);
    }
    localStorage.setItem(`profe_jemi_live_minutes_${userId}`, String(newTotal));
    return newTotal;
}

export async function incrementVisionUsage(userId: string, currentCount: number): Promise<number> {
    const newTotal = currentCount + 1;
    try {
        await supabase
            .from('profiles')
            .update({ vision_count_used: newTotal })
            .eq('id', userId);
    } catch (e) {
        console.warn('Could not persist vision count to supabase, falling back to local storage', e);
    }
    localStorage.setItem(`profe_jemi_vision_count_${userId}`, String(newTotal));
    return newTotal;
}

export async function incrementTranslationUsage(userId: string, currentCount: number): Promise<number> {
    const newTotal = currentCount + 1;
    try {
        await supabase
            .from('profiles')
            .update({ translations_count_used: newTotal })
            .eq('id', userId);
    } catch (e) {
        console.warn('Could not persist translations count to supabase, falling back to local storage', e);
    }
    localStorage.setItem(`profe_jemi_translations_count_${userId}`, String(newTotal));
    return newTotal;
}
