import api from './api';

export interface CustomEmoji {
  id: string;
  shortcut: string;
  imageUrl: string;
  uploaderId: string;
  createdAt: string;
}

export const emojiService = {
  getAllEmojis: async (): Promise<CustomEmoji[]> => {
    const response = await api.get('/api/emojis');
    return response.data;
  },

  createEmoji: async (shortcut: string, file: File): Promise<CustomEmoji> => {
    const formData = new FormData();
    formData.append('shortcut', shortcut);
    formData.append('file', file);

    const response = await api.post('/api/emojis', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
