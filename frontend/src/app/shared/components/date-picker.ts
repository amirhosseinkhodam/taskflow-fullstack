import {
  Component,
  inject,
  input,
  signal,
  forwardRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { LanguageService } from '../services/language';
import { TranslatePipe } from '../pipes/translate';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { AdaptiveDateAdapter } from '../adapters/adaptive-date-adapter';
import {
  CONTROL_BASE_CLASSES,
  CONTROL_VARIANT_CLASSES,
  controlFocusClasses,
} from '../const/control-classes';

const DATE_FORMATS = {
  parse: {
    dateInput: 'yyyy/MM/dd',
  },
  display: {
    dateInput: 'yyyy/MM/dd',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'yyyy/MM/dd',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    HugeiconsIconComponent,
    TranslatePipe,
  ],
  template: `
    @if (label()) {
      <label
        class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
      >
        {{ label() }}
      </label>
    }
    <div class="relative">
      <input
        [matDatepicker]="picker"
        [value]="selectedDate()"
        [disabled]="disabled()"
        [placeholder]="placeholder() ?? ('selectDate' | translate)"
        [class]="computedClasses()"
        (dateChange)="onDateChange($event)"
        (click)="picker.open()"
        (blur)="onPickerClosed()"
        readonly
      />
      <button
        type="button"
        class="absolute inset-y-0 end-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        [disabled]="disabled()"
        [attr.aria-label]="'selectDate' | translate"
        (click)="picker.open()"
        tabindex="-1"
      >
        <hugeicons-icon
          [icon]="icons.Calendar01Icon"
          [size]="20"
          color="currentColor"
          [strokeWidth]="1.5"
        />
      </button>
      <mat-datepicker
        #picker
        [startAt]="viewDate()"
        (closed)="onPickerClosed()"
      />
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
    {
      provide: DateAdapter,
      useClass: AdaptiveDateAdapter,
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: DATE_FORMATS,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  readonly placeholder = input<string>();
  readonly disabled = input<boolean>(false);
  readonly cssClass = input<string>();
  readonly focusRing = input<boolean>(false);
  readonly variant = input<'default' | 'error' | 'disabled'>('default');
  readonly error = input<boolean>(false);
  readonly label = input<string>();

  readonly icons = { Calendar01Icon };

  readonly #languageService = inject(LanguageService);

  readonly selectedDate = signal<Date | null>(null);
  readonly viewDate = signal<Date>(new Date());

  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      this.#languageService.currentLanguage();
      const selected = this.selectedDate();
      this.viewDate.set(selected ? new Date(selected) : new Date());
    });
  }

  onDateChange(event: { value: Date }): void {
    const date = event.value;
    if (date) {
      this.selectedDate.set(date);
      this.viewDate.set(new Date(date));
      this.#onChange(this.#toIsoString(date));
    }
    this.#onTouched();
  }

  onPickerClosed(): void {
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

  setDisabledState(): void {}

  readonly computedClasses = () => {
    const base = `${CONTROL_BASE_CLASSES} ${controlFocusClasses(this.focusRing())} pe-10 cursor-pointer`;

    const variant = this.disabled() ? 'disabled' : this.variant();
    const errorClass = this.error() ? 'ring-red-500 border-red-500' : '';

    return [base, CONTROL_VARIANT_CLASSES[variant], errorClass, this.cssClass()]
      .filter(Boolean)
      .join(' ');
  };

  #toIsoString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
