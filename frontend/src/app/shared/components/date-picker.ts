import {
  Component,
  inject,
  input,
  signal,
  computed,
  forwardRef,
  effect,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LanguageService } from '../services/language';
import {
  startOfMonth as jalaliStartOfMonth,
  endOfMonth as jalaliEndOfMonth,
  startOfWeek as jalaliStartOfWeek,
  endOfWeek as jalaliEndOfWeek,
  eachDayOfInterval as jalaliEachDayOfInterval,
  addMonths as jalaliAddMonths,
  subMonths as jalaliSubMonths,
  formatDate as jalaliFormatDate,
  isSameDay as jalaliIsSameDay,
  isSameMonth as jalaliIsSameMonth,
  getYear as jalaliGetYear,
  getMonth as jalaliGetMonth,
} from 'date-fns-jalali';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  format,
  isSameDay,
  isSameMonth,
  getYear,
  getMonth,
} from 'date-fns';

interface CalendarDay {
  date: Date;
  label: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const FA_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];
const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const FA_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const EN_WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <div class="relative">
        <input
          type="text"
          readonly
          [value]="displayValue()"
          [placeholder]="placeholder() ?? t('selectDate')"
          [disabled]="disabled()"
          [class]="inputClasses()"
          (click)="toggle($event)"
        />
        <button
          type="button"
          class="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 top-3.5"
          (click)="toggle($event)"
          tabindex="-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      @if (isOpen()) {
        <div
          class="absolute z-50 mt-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-3"
          [class.start-0]="!isRtl()"
          [class.end-0]="isRtl()"
        >
          <div class="flex items-center justify-between mb-3">
            <button
              type="button"
              class="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
              (click)="prevMonth()"
            >
              @if (isRtl()) {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              } @else {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              }
            </button>
            <span
              class="text-sm font-medium text-slate-900 dark:text-slate-100"
            >
              {{ monthYearLabel() }}
            </span>
            <button
              type="button"
              class="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
              (click)="nextMonth()"
            >
              @if (isRtl()) {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              } @else {
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              }
            </button>
          </div>

          <div class="grid grid-cols-7 gap-0.5 mb-1">
            @for (day of weekdays(); track day) {
              <div
                class="w-8 h-8 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                {{ day }}
              </div>
            }
          </div>

          <div class="grid grid-cols-7 gap-0.5">
            @for (
              day of calendarDays();
              track day.label + day.date.toISOString()
            ) {
              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors"
                [class]="dayClasses(day)"
                (click)="selectDate(day)"
              >
                {{ day.label }}
              </button>
            }
          </div>

          <div
            class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-center"
          >
            <button
              type="button"
              class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              (click)="goToToday()"
            >
              {{ t('today') }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  readonly placeholder = input<string>();
  readonly disabled = input<boolean>(false);
  readonly cssClass = input<string>();

  readonly #languageService = inject(LanguageService);
  readonly #elementRef = inject(ElementRef);

  readonly isOpen = signal(false);
  readonly viewDate = signal(new Date());
  readonly selectedDate = signal<Date | null>(null);

  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  readonly isRtl = computed(
    () => this.#languageService.getCurrentLanguageOption().rtl,
  );

  readonly weekdays = computed(() =>
    this.#languageService.currentLanguage() === 'fa'
      ? FA_WEEKDAYS
      : EN_WEEKDAYS,
  );

  readonly monthYearLabel = computed(() => {
    const lang = this.#languageService.currentLanguage();
    const date = this.viewDate();
    if (lang === 'fa') {
      const year = jalaliGetYear(date);
      const month = FA_MONTHS[jalaliGetMonth(date)];
      return `${month} ${year}`;
    }
    const year = getYear(date);
    const month = EN_MONTHS[getMonth(date)];
    return `${month} ${year}`;
  });

  readonly calendarDays = computed<CalendarDay[]>(() => {
    const lang = this.#languageService.currentLanguage();
    const date = this.viewDate();
    const selected = this.selectedDate();
    const today = new Date();

    if (lang === 'fa') {
      return this.#buildJalaliDays(date, selected, today);
    }
    return this.#buildGregorianDays(date, selected, today);
  });

  readonly displayValue = computed(() => {
    const selected = this.selectedDate();
    if (!selected) return '';
    const lang = this.#languageService.currentLanguage();
    if (lang === 'fa') {
      return jalaliFormatDate(selected, 'yyyy/MM/dd');
    }
    return format(selected, 'yyyy/MM/dd');
  });

  readonly inputClasses = computed(() => {
    const base =
      'w-full rounded-lg border px-3 py-2 pe-10 transition-colors focus:outline-none cursor-pointer text-sm';
    const state = this.disabled()
      ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-50'
      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500';
    return [base, state, this.cssClass()].filter(Boolean).join(' ');
  });

  constructor() {
    effect(() => {
      this.#languageService.currentLanguage();
      this.viewDate.set(new Date());
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen()) {
      const target = event.target as HTMLElement;
      if (!this.#elementRef.nativeElement.contains(target)) {
        this.isOpen.set(false);
      }
    }
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.disabled()) {
      if (!this.isOpen()) {
        const selected = this.selectedDate();
        this.viewDate.set(selected ? new Date(selected) : new Date());
      }
      this.isOpen.set(!this.isOpen());
    }
  }

  prevMonth(): void {
    const lang = this.#languageService.currentLanguage();
    const date = this.viewDate();
    this.viewDate.set(
      lang === 'fa' ? jalaliSubMonths(date, 1) : subMonths(date, 1),
    );
  }

  nextMonth(): void {
    const lang = this.#languageService.currentLanguage();
    const date = this.viewDate();
    this.viewDate.set(
      lang === 'fa' ? jalaliAddMonths(date, 1) : addMonths(date, 1),
    );
  }

  selectDate(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    this.selectedDate.set(day.date);
    this.isOpen.set(false);
    this.#onChange(this.#toIsoString(day.date));
    this.#onTouched();
  }

  goToToday(): void {
    const today = new Date();
    this.selectedDate.set(today);
    this.viewDate.set(today);
    this.isOpen.set(false);
    this.#onChange(this.#toIsoString(today));
    this.#onTouched();
  }

  writeValue(value: string): void {
    if (value) {
      const date = new Date(value + 'T00:00:00');
      if (!isNaN(date.getTime())) {
        this.selectedDate.set(date);
        this.viewDate.set(new Date(date));
      }
    } else {
      this.selectedDate.set(null);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.isOpen.set(false);
    }
  }

  #buildJalaliDays(
    viewDate: Date,
    selected: Date | null,
    today: Date,
  ): CalendarDay[] {
    const monthStart = jalaliStartOfMonth(viewDate);
    const monthEnd = jalaliEndOfMonth(viewDate);
    const calStart = jalaliStartOfWeek(monthStart, { weekStartsOn: 6 });
    const calEnd = jalaliEndOfWeek(monthEnd, { weekStartsOn: 6 });
    const days = jalaliEachDayOfInterval({ start: calStart, end: calEnd });

    return days.map((date) => ({
      date,
      label: jalaliFormatDate(date, 'd'),
      isCurrentMonth: jalaliIsSameMonth(date, viewDate),
      isToday: jalaliIsSameDay(date, today),
      isSelected: selected ? jalaliIsSameDay(date, selected) : false,
    }));
  }

  #buildGregorianDays(
    viewDate: Date,
    selected: Date | null,
    today: Date,
  ): CalendarDay[] {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calStart, end: calEnd });

    return days.map((date) => ({
      date,
      label: format(date, 'd'),
      isCurrentMonth: isSameMonth(date, viewDate),
      isToday: isSameDay(date, today),
      isSelected: selected ? isSameDay(date, selected) : false,
    }));
  }

  #toIsoString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  dayClasses(day: CalendarDay): string {
    const base =
      'w-8 h-8 flex items-center justify-center rounded-full text-sm transition-colors';
    if (!day.isCurrentMonth) {
      return `${base} text-slate-300 dark:text-slate-600`;
    }
    const selected = day.isSelected
      ? 'bg-indigo-600 text-white'
      : day.isToday
        ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold'
        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700';
    return `${base} ${selected}`;
  }
}
