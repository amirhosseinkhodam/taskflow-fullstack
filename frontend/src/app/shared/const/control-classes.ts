export const CONTROL_BASE_CLASSES =
  'w-full rounded-control border px-3 py-2 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500';

export const CONTROL_VARIANT_CLASSES = {
  default:
    'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:border-slate-400 dark:hover:border-slate-500',
  error:
    'border-red-500 dark:border-red-600 bg-red-50 dark:bg-red-900/30 text-red-900 dark:text-red-100',
  disabled:
    'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50',
} as const;

export type ControlVariant = keyof typeof CONTROL_VARIANT_CLASSES;

export const controlFocusClasses = (focusRing: boolean): string =>
  focusRing
    ? 'focus:ring-2 focus:ring-slate-500 focus:ring-offset-2'
    : 'focus:outline-none';
