// Avatar Generator Utility
// Generates consistent avatar URLs using DiceBear API based on name

export const getAvatarUrl = (name: string, photoUrl?: string | null): string => {
  // If photo URL exists, return it
  if (photoUrl) {
    // If it's a relative path, prepend the backend URL
    if (photoUrl.startsWith('/uploads')) {
      return `http://localhost:5000${photoUrl}`;
    }
    return photoUrl;
  }

  // Generate consistent avatar using DiceBear API based on name
  // Using 'initials' style for professional look, will always be the same for same name
  const seed = name || 'user';

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1,8b5cf6,ec4899,f59e0b,10b981`;
};

export const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
};

export const getGradientColors = (name: string): { from: string; to: string } => {
  const gradients = [
    { from: 'indigo-400', to: 'purple-500' },
    { from: 'blue-400', to: 'cyan-500' },
    { from: 'green-400', to: 'teal-500' },
    { from: 'yellow-400', to: 'orange-500' },
    { from: 'pink-400', to: 'rose-500' },
    { from: 'purple-400', to: 'pink-500' },
    { from: 'red-400', to: 'orange-500' },
    { from: 'cyan-400', to: 'blue-500' },
  ];

  // Use name to deterministically select gradient (same name = same gradient)
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
};
