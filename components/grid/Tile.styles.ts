export const tileStyles = {
  base: 'w-14 h-14 border-2 border-gray-400 dark:border-gray-600 items-center justify-center',
  textBase: 'text-2xl font-bold',
  states: {
    correct: { bg: 'bg-green-600 border-green-600', text: 'text-white' },
    present: { bg: 'bg-yellow-500 border-yellow-500', text: 'text-white' },
    absent: { bg: 'bg-gray-500 border-gray-500', text: 'text-white' },
    empty: { bg: 'bg-transparent border-gray-400 dark:border-gray-600', text: 'text-black dark:text-white' },
  },
};
