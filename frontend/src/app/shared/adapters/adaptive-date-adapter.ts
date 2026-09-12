import { effect, inject, Injectable } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { LanguageService } from '../services/language';
import {
  format as jalaliFormat,
  addDays as jalaliAddDays,
  addMonths as jalaliAddMonths,
  addYears as jalaliAddYears,
  isValid as jalaliIsValid,
  parse as jalaliParse,
} from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';
import {
  getYear,
  getMonth,
  getDate,
  getDay,
  format,
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  isValid,
  parse,
} from 'date-fns';
import * as jalaali from 'jalaali-js';

function gregorianToJalali(date: Date): { jy: number; jm: number; jd: number } {
  const j = jalaali.toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  return { jy: j.jy, jm: j.jm, jd: j.jd };
}

function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
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

const FA_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
];
const FA_WEEKDAYS_SHORT = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
const FA_WEEKDAYS_NARROW = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];

const EN_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const EN_WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EN_WEEKDAYS_NARROW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

@Injectable()
export class AdaptiveDateAdapter extends DateAdapter<Date> {
  readonly #languageService = inject(LanguageService);

  constructor() {
    super();
    effect(() => this.setLocale(this.#languageService.currentLanguage()));
  }

  get isJalali(): boolean {
    return this.#languageService.currentLanguage() === 'fa';
  }

  getYear(date: Date): number {
    if (this.isJalali) {
      return gregorianToJalali(date).jy;
    }
    return getYear(date);
  }

  getMonth(date: Date): number {
    if (this.isJalali) {
      return gregorianToJalali(date).jm - 1;
    }
    return getMonth(date);
  }

  getDate(date: Date): number {
    if (this.isJalali) {
      return gregorianToJalali(date).jd;
    }
    return getDate(date);
  }

  getDayOfWeek(date: Date): number {
    return getDay(date);
  }

  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    if (this.isJalali) {
      switch (style) {
        case 'long':
        case 'short':
        case 'narrow':
          return FA_MONTHS;
      }
    }
    switch (style) {
      case 'long':
        return EN_MONTHS;
      case 'short':
        return EN_MONTHS.map((m) => m.substring(0, 3));
      case 'narrow':
        return EN_MONTHS.map((m) => m.charAt(0));
    }
  }

  getDateNames(): string[] {
    return Array.from({ length: 31 }, (_, i) => String(i + 1));
  }

  getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
    if (this.isJalali) {
      switch (style) {
        case 'long':
          return FA_WEEKDAYS;
        case 'short':
          return FA_WEEKDAYS_SHORT;
        case 'narrow':
          return FA_WEEKDAYS_NARROW;
      }
    }
    switch (style) {
      case 'long':
        return EN_WEEKDAYS;
      case 'short':
        return EN_WEEKDAYS_SHORT;
      case 'narrow':
        return EN_WEEKDAYS_NARROW;
    }
  }

  getYearName(date: Date): string {
    return String(this.getYear(date));
  }

  getFirstDayOfWeek(): number {
    return this.isJalali ? 6 : 0;
  }

  getNumDaysInMonth(date: Date): number {
    if (this.isJalali) {
      const { jy, jm } = gregorianToJalali(date);
      const daysInMonth = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
      if (jalaali.isLeapJalaaliYear(jy) && jm === 12) {
        return 30;
      }
      return daysInMonth[jm];
    }
    return getDate(endOfMonth(date));
  }

  clone(date: Date): Date {
    return new Date(date.getTime());
  }

  createDate(year: number, month: number, date: number): Date {
    if (this.isJalali) {
      return jalaliToGregorian(year, month + 1, date);
    }
    return new Date(year, month, date);
  }

  today(): Date {
    return new Date();
  }

  parse(value: unknown, parseFormat: string): Date | null {
    if (value && typeof value === 'string') {
      const parsed = this.isJalali
        ? jalaliParse(value, parseFormat, new Date())
        : parse(value, parseFormat, new Date());
      if (this.isJalali ? jalaliIsValid(parsed) : isValid(parsed)) {
        return parsed;
      }
    }
    if (
      value instanceof Date &&
      (this.isJalali ? jalaliIsValid(value) : isValid(value))
    ) {
      return value;
    }
    return null;
  }

  format(date: Date, displayFormat: string): string {
    return this.isJalali
      ? jalaliFormat(date, displayFormat, { locale: faIR })
      : format(date, displayFormat);
  }

  addCalendarYears(date: Date, years: number): Date {
    return this.isJalali ? jalaliAddYears(date, years) : addYears(date, years);
  }

  addCalendarMonths(date: Date, months: number): Date {
    return this.isJalali
      ? jalaliAddMonths(date, months)
      : addMonths(date, months);
  }

  addCalendarDays(date: Date, days: number): Date {
    return this.isJalali ? jalaliAddDays(date, days) : addDays(date, days);
  }

  toIso8601(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isDateInstance(obj: unknown): obj is Date {
    return obj instanceof Date;
  }

  isValid(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  invalid(): Date {
    return new Date(NaN);
  }

  override deserialize(value: unknown): Date | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (this.isValid(date)) {
        return date;
      }
    }
    return null;
  }
}
