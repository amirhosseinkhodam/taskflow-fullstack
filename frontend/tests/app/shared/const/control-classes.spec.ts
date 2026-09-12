import {
  CONTROL_BASE_CLASSES,
  CONTROL_VARIANT_CLASSES,
  controlFocusClasses,
} from '../../../../src/app/shared/const/control-classes';

describe('control classes', () => {
  describe('CONTROL_BASE_CLASSES', () => {
    it.each([
      ['full width', 'w-full'],
      ['shared radius token', 'rounded-control'],
      ['horizontal padding', 'px-3'],
      ['vertical padding', 'py-2'],
      ['a border', 'border'],
      ['colour transitions', 'transition-colors'],
    ])('declares %s', (_label, expected) => {
      expect(CONTROL_BASE_CLASSES.split(' ')).toContain(expected);
    });

    it('styles placeholders in both colour schemes', () => {
      expect(CONTROL_BASE_CLASSES).toContain('placeholder:text-slate-400');
      expect(CONTROL_BASE_CLASSES).toContain('dark:placeholder:text-slate-500');
    });

    it('does not pin its own height so padding drives it consistently', () => {
      expect(CONTROL_BASE_CLASSES).not.toMatch(/\bh-\d/);
    });
  });

  describe('CONTROL_VARIANT_CLASSES', () => {
    it('exposes the three states every control shares', () => {
      expect(Object.keys(CONTROL_VARIANT_CLASSES).sort()).toEqual([
        'default',
        'disabled',
        'error',
      ]);
    });

    it('uses the same resting border and background as the design system', () => {
      expect(CONTROL_VARIANT_CLASSES.default).toContain('border-slate-300');
      expect(CONTROL_VARIANT_CLASSES.default).toContain(
        'dark:border-slate-600',
      );
      expect(CONTROL_VARIANT_CLASSES.default).toContain('bg-white');
      expect(CONTROL_VARIANT_CLASSES.default).toContain('dark:bg-slate-700');
    });

    it('darkens the border on hover in both colour schemes', () => {
      expect(CONTROL_VARIANT_CLASSES.default).toContain(
        'hover:border-slate-400',
      );
      expect(CONTROL_VARIANT_CLASSES.default).toContain(
        'dark:hover:border-slate-500',
      );
    });

    it('marks the disabled state as non-interactive', () => {
      expect(CONTROL_VARIANT_CLASSES.disabled).toContain('cursor-not-allowed');
      expect(CONTROL_VARIANT_CLASSES.disabled).toContain('opacity-50');
    });

    it('signals the error state with a red border', () => {
      expect(CONTROL_VARIANT_CLASSES.error).toContain('border-red-500');
    });
  });

  describe('controlFocusClasses', () => {
    it('suppresses the native outline by default', () => {
      expect(controlFocusClasses(false)).toBe('focus:outline-none');
    });

    it('opts into the shared offset ring when requested', () => {
      expect(controlFocusClasses(true)).toContain('focus:ring-2');
      expect(controlFocusClasses(true)).toContain('focus:ring-slate-500');
      expect(controlFocusClasses(true)).toContain('focus:ring-offset-2');
    });
  });
});
