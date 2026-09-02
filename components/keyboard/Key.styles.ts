export const keyStyles = {
  base: 'h-16 rounded-xl items-center justify-center px-1',
  wide: 'flex-[2.2]',
  narrow: 'flex-1',
  text: 'text-base font-semibold',
  disabled: 'opacity-40',
  states: {
    default: { bg: 'bg-gray-300 dark:bg-gray-700', text: 'text-black dark:text-white' },
    correct: { bg: 'bg-green-600', text: 'text-white' },
    present: { bg: 'bg-yellow-500', text: 'text-white' },
    absent: { bg: 'bg-gray-500', text: 'text-white' },
  },
};
