/**
 * Utility helper to manage and map funny animal/character avatars based on gender categories.
 */

export interface AvatarItem {
  emoji: string;
  title: string;
}

export const maleAvatars: AvatarItem[] = [
  { emoji: '🦁', title: 'Macho Lion' },
  { emoji: '🐻', title: 'Sleepy Bear' },
  { emoji: '🦍', title: 'Strong Gorilla' },
  { emoji: '🦊', title: 'Sly Fox' },
  { emoji: '🐼', title: 'Chubby Panda' }
];

export const femaleAvatars: AvatarItem[] = [
  { emoji: '🦄', title: 'Graceful Unicorn' },
  { emoji: '🐱', title: 'Cute Kitten' },
  { emoji: '🐨', title: 'Chill Koala' },
  { emoji: '🐰', title: 'Energetic Bunny' },
  { emoji: '🦩', title: 'Glamorous Flamingo' }
];

export const otherAvatars: AvatarItem[] = [
  { emoji: '👽', title: 'Friendly Alien' },
  { emoji: '🦖', title: 'Roaring T-Rex' },
  { emoji: '🦉', title: 'Wise Owl' },
  { emoji: '🐙', title: 'Multitasking Octopus' },
  { emoji: '🦥', title: 'Lazy Sloth' }
];

/**
 * Gets funny avatars array for a specific gender.
 */
export const getAvatarsForGender = (gender: string): AvatarItem[] => {
  if (gender === 'male') return maleAvatars;
  if (gender === 'female') return femaleAvatars;
  return otherAvatars;
};

/**
 * Resolves funny emoji avatar character based on username and gender.
 */
export const getAvatarForUser = (username: string): string => {
  if (!username) return '👽';

  // Check if it's the current user logged in
  const storedUser = localStorage.getItem('username');
  if (storedUser && username === storedUser) {
    const customAvatar = localStorage.getItem('user-avatar');
    if (customAvatar) return customAvatar;

    // Fallback to current user gender category
    const userGender = localStorage.getItem('user-gender') || 'other';
    const avatars = getAvatarsForGender(userGender);
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % avatars.length;
    return avatars[idx].emoji;
  }

  // Fallback for other users: auto-detect gender from name
  let gender = 'other';
  const lower = username.toLowerCase();
  if (lower.includes('sarah') || lower.includes('emily') || lower.includes('lisa') || lower.includes('anna') || lower.includes('girl')) {
    gender = 'female';
  } else if (lower.includes('david') || lower.includes('michael') || lower.includes('alex') || lower.includes('john') || lower.includes('boy')) {
    gender = 'male';
  } else {
    // Hash category assignment
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rem = Math.abs(hash) % 3;
    gender = rem === 0 ? 'male' : rem === 1 ? 'female' : 'other';
  }

  const list = getAvatarsForGender(gender);
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % list.length;
  return list[idx].emoji;
};
