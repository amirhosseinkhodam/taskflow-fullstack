import {
  Component,
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
  selector: 'app-textarea',
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
    <textarea
      #textareaElement
      [rows]="rows()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [class]="computedClasses()"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (focus)="onFocus()"
    ></textarea>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  readonly rows = input<number>(4);
  readonly placeholder = input<string>();
  readonly disabled = input<boolean>(false);
  readonly cssClass = input<string>();
  readonly focusRing = input<boolean>(false);
  readonly variant = input<'default' | 'error' | 'disabled'>('default');
  readonly error = input<boolean>(false);
  readonly label = input<string>();

  readonly input = output<string>({ alias: 'inputChange' });
  readonly blur = output<void>({ alias: 'inputBlur' });
  readonly focus = output<void>({ alias: 'inputFocus' });

  @ViewChild('textareaElement', { static: true })
  textareaElement!: ElementRef<HTMLTextAreaElement>;
  #onChange: (value: string) => void = () => {};
  #onTouched: () => void = () => {};

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
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
    if (this.textareaElement) {
      this.textareaElement.nativeElement.value = value ?? '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.#onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.#onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.textareaElement) {
      this.textareaElement.nativeElement.disabled = isDisabled;
    }
  }

  readonly computedClasses = () => {
    const base = `${CONTROL_BASE_CLASSES} ${controlFocusClasses(this.focusRing())} resize-vertical`;

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
