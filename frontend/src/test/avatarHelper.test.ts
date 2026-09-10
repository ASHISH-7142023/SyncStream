import { describe, it, expect } from 'vitest';
import { getAvatarForUser, maleAvatars, femaleAvatars, otherAvatars } from '../utils/avatarHelper';

describe('avatarHelper', () => {
  it('should return a valid emoji for a user', () => {
    const presenceUsers = {
      'user123': {
        username: 'testuser',
        status: 'ONLINE',
      }
    };
    
    const result = getAvatarForUser('testuser', presenceUsers);
    
    const allEmojis = [...maleAvatars, ...femaleAvatars, ...otherAvatars].map(a => a.emoji);
    expect(allEmojis).toContain(result);
  });

  it('should handle undefined presence', () => {
    const result = getAvatarForUser('unknown', {});
    const allEmojis = [...maleAvatars, ...femaleAvatars, ...otherAvatars].map(a => a.emoji);
    expect(allEmojis).toContain(result);
  });
});
