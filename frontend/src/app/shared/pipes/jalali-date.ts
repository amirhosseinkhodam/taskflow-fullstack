import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from 'date-fns-jalali';

@Pipe({ name: 'jalaliDate', standalone: true })
export class JalaliDatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    format: string = 'yyyy/MM/dd HH:mm',
  ): string {
    if (!value) return '';
    return formatDate(new Date(value), format);
  }
}
