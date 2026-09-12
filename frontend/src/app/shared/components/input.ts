import {
  Component,
  effect,
  input,
  output,
  forwardRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  CONTROL_BASE_CLASSES,
  CONTROL_VARIANT_CLASSES,
  controlFocusClasses,
} from '../const/control-classes';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  template: `
    @if (label()) {
      <label
        class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
      >
        {{ label() }}
      </label>
    }
    <input
      #inputElement
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [class]="computedClasses()"
      [min]="min()"
      [max]="max()"
      [step]="step()"
      [autocomplete]="autocomplete()"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (focus)="onFocus()"
      (keydown)="keydown.emit($event)"
    />
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  readonly type = input<
    'text' | 'email' | 'password' | 'number' | 'textarea' | 'search'
  >('text');
  readonly placeholder = input<string>();
  readonly disabled = input<boolean>(false);
  readonly cssClass = input<string>();
  readonly focusRing = input<boolean>(false);
  readonly autocomplete = input<string>();
  readonly variant = input<'default' | 'error' | 'disabled'>('default');
  readonly min = input<string | number>();
  readonly max = input<string | number>();
  readonly step = input<string | number>();
  readonly error = input<boolean>(false);
  readonly label = input<string>();
  readonly value = input<string>();

  readonly input = output<string>({ alias: 'inputChange' });
  readonly blur = output<void>({ alias: 'inputBlur' });
  readonly focus = output<void>({ alias: 'inputFocus' });
  readonly keydown = output<KeyboardEvent>({ alias: 'inputKeydown' });

  @ViewChild('inputElement', { static: true })
  inputElement!: ElementRef<HTMLInputElement>;
  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const value = this.value();
      if (value !== undefined && this.inputElement) {
        this.inputElement.nativeElement.value = value;
      }
    });
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.#onChange(value);
    this.input.emit(value);
  }

  onBlur() {
    this.#onTouched();
    this.blur.emit();
  }

  onFocus() {
    this.focus.emit();
  }

  writeValue(value: string): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.value = value ?? '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.disabled = isDisabled;
    }
  }

  readonly computedClasses = () => {
    const base = `${CONTROL_BASE_CLASSES} ${controlFocusClasses(this.focusRing())}`;

    const errorClass = this.error() ? 'ring-red-500 border-red-500' : '';

    return [
      base,
      CONTROL_VARIANT_CLASSES[this.variant()],
      errorClass,
      this.cssClass(),
    ]
      .filter(Boolean)
      .join(' ');
  };
}
