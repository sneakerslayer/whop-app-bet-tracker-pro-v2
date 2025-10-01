import { supabase } from "./supabase";

export interface User {
  id: string;
  whop_user_id: string;
  whop_experience_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  is_capper: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export async function getOrCreateUser(whopUserId: string, experienceId: string): Promise<User> {
  // First, try to find existing user
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("whop_user_id", whopUserId)
    .eq("whop_experience_id", experienceId)
    .single();

  if (existingUser && !fetchError) {
    return existingUser;
  }

  // If user doesn't exist, create new user
  const { data: newUser, error: createError } = await supabase
    .from("users")
    .insert({
      whop_user_id: whopUserId,
      whop_experience_id: experienceId,
      username: `user_${whopUserId.slice(-8)}`,
      display_name: `User ${whopUserId.slice(-4)}`,
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating user:", createError);
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  if (!newUser) {
    throw new Error("Failed to create user: No data returned");
  }

  // Create initial user stats
  const { error: statsError } = await supabase
    .from("user_stats")
    .insert({
      user_id: newUser.id,
      whop_experience_id: experienceId,
    });

  if (statsError) {
    console.error("Error creating user stats:", statsError);
    // Don't throw here as the user was created successfully
  }

  return newUser;
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return user;
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Pick<User, 'username' | 'display_name' | 'avatar_url' | 'is_capper' | 'is_verified'>>
): Promise<User | null> {
  const { data: user, error } = await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return user;
}
