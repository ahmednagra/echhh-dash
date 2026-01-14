// src/utils/user-storage-utils.ts
import { User } from '@/types/users';

/**
 * Update user data in localStorage while preserving other user fields
 * @param updatedUser - The updated user data from API response
 */
export const updateUserInStorage = (updatedUser: User): void => {
  try {
    if (typeof window === 'undefined') {
      console.warn('updateUserInStorage called on server side');
      return;
    }

    const currentUserData = localStorage.getItem('user');
    
    if (!currentUserData) {
      console.warn('No existing user data found in localStorage');
      // Store the updated user data directly
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return;
    }

    // Parse existing user data
    const existingUser = JSON.parse(currentUserData);
    
    // Merge existing user data with updated fields
    // This preserves any additional fields that might exist in localStorage
    // but aren't returned by the update API
    const mergedUser = {
      ...existingUser,
      ...updatedUser,
      // Ensure updated_at reflects the latest update
      updated_at: updatedUser.updated_at || new Date().toISOString()
    };

    // Store the merged user data
    localStorage.setItem('user', JSON.stringify(mergedUser));
    
    console.log('✅ Successfully updated user data in localStorage:', {
      userId: mergedUser.id,
      updatedFields: Object.keys(updatedUser),
      timestamp: mergedUser.updated_at
    });

  } catch (error) {
    console.error('❌ Error updating user data in localStorage:', error);
  }
};

/**
 * Update specific user fields in localStorage
 * @param userId - The user ID to verify we're updating the correct user
 * @param fieldsToUpdate - Object containing the fields to update
 */
export const updateUserFieldsInStorage = (userId: string, fieldsToUpdate: Partial<User>): void => {
  try {
    if (typeof window === 'undefined') {
      console.warn('updateUserFieldsInStorage called on server side');
      return;
    }

    const currentUserData = localStorage.getItem('user');
    
    if (!currentUserData) {
      console.warn('No existing user data found in localStorage');
      return;
    }

    const existingUser = JSON.parse(currentUserData);
    
    // Verify we're updating the correct user
    if (existingUser.id !== userId) {
      console.warn(`User ID mismatch in localStorage update. Expected: ${userId}, Found: ${existingUser.id}`);
      return;
    }

    // Merge the fields
    const updatedUser = {
      ...existingUser,
      ...fieldsToUpdate,
      updated_at: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    console.log('✅ Successfully updated user fields in localStorage:', {
      userId,
      updatedFields: Object.keys(fieldsToUpdate),
      timestamp: updatedUser.updated_at
    });

  } catch (error) {
    console.error('❌ Error updating user fields in localStorage:', error);
  }
};

/**
 * Get current user data from localStorage
 * @returns User object or null if not found
 */
export const getCurrentUserFromStorage = (): User | null => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }

    const userData = localStorage.getItem('user');
    
    if (!userData || userData === 'undefined') {
      return null;
    }

    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Sync user data between API response and localStorage, then trigger AuthContext refresh
 * This is the main function to use after successful profile updates
 * @param updatedUser - The user data returned from API
 * @param loadAuthFromStorage - Function to refresh AuthContext
 */
export const syncUserDataAndRefreshAuth = (
  updatedUser: User, 
  loadAuthFromStorage?: () => void
): void => {
  try {
    // Update localStorage
    updateUserInStorage(updatedUser);
    
    // Refresh AuthContext to reflect changes throughout the app
    if (loadAuthFromStorage) {
      console.log('🔄 Refreshing AuthContext with updated user data');
      loadAuthFromStorage();
    }
    
    console.log('✅ User data sync and auth refresh completed');
  } catch (error) {
    console.error('❌ Error in syncUserDataAndRefreshAuth:', error);
  }
};