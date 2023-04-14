export const randomUpsetEmoji = () => {
  const emojis = [
    '😭',
    '😢',
    '😔',
    '😡',
    '😞',
    '😕',
    '🙁',
    '😠',
    '😑',
    '🤬',
    '😬',
    '😨',
    '😯',
    '😮',
    '😳',
  ];
  const randomNumber = Math.floor(Math.random() * emojis.length);
  return emojis[randomNumber];
};
