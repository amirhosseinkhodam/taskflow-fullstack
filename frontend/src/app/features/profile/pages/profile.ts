import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  ButtonComponent,
  CardComponent,
  FormComponent,
  InputComponent,
  PageHeaderComponent,
  PasswordBottomSheetComponent,
  PasswordDialogComponent,
} from '../../../shared/components';
import { LanguageService } from '../../../shared/services/language';
import { AuthStore } from '../../auth/store/auth';
import { ProfileFormService } from '../forms/profile-form';
import { ProfileService } from '../services/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatBottomSheetModule,
    ButtonComponent,
    CardComponent,
    FormComponent,
    InputComponent,
    PageHeaderComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <app-page-header
        [title]="t('profile')"
        [roleBadge]="roleBadgeText()"
        [showProfileButton]="false"
      />

      <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <app-card>
          <div class="mb-6 flex items-center justify-between">
            <h2 class="text-lg font-medium text-slate-900 dark:text-white">
              {{ t('profileInformation') }}
            </h2>
            @if (!isEditing()) {
              <div class="flex items-center gap-2">
                <app-button
                  variant="ghost"
                  size="sm"
                  type="button"
                  (buttonClick)="startEdit()"
                  [ariaLabel]="t('edit')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                    />
                  </svg>
                </app-button>
                <app-button
                  variant="ghost"
                  size="sm"
                  type="button"
                  (buttonClick)="openPasswordChange()"
                  [ariaLabel]="t('changePassword')"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </app-button>
              </div>
            }
          </div>

          @if (isEditing()) {
            <app-form
              [formGroup]="profileForm.form"
              variant="vertical"
              (ngSubmit)="saveProfile()"
            >
              <app-input
                formControlName="email"
                [placeholder]="t('email')"
                variant="default"
                [cssClass]="'mb-4'"
              />
              <div class="flex gap-2">
                <app-button
                  variant="primary"
                  type="submit"
                  [disabled]="profileForm.form.invalid || isSavingProfile()"
                >
                  {{ t('save') }}
                </app-button>
                <app-button
                  variant="secondary"
                  type="button"
                  (buttonClick)="cancelEdit()"
                >
                  {{ t('cancel') }}
                </app-button>
              </div>
            </app-form>
          } @else {
            <div class="space-y-4">
              <div>
                <p
                  class="text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                  {{ t('email') }}
                </p>
                <p class="mt-1 text-sm text-slate-900 dark:text-white">
                  {{ auth.user()?.email }}
                </p>
              </div>
              <div>
                <p
                  class="text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                  {{ t('role') }}
                </p>
                <p class="mt-1 text-sm text-slate-900 dark:text-white">
                  {{ t(auth.user()?.role ?? '') }}
                </p>
              </div>
            </div>
          }
        </app-card>

        @if (message()) {
          <div
            class="rounded-lg px-4 py-3 text-sm"
            [ngClass]="{
              'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300':
                !message()!.startsWith('couldNot'),
              'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300':
                message()!.startsWith('couldNot'),
            }"
          >
            {{ t(message()!) }}
          </div>
        }
      </main>
    </div>
  `,
})
export class ProfileComponent {
  readonly auth = inject(AuthStore);
  readonly profileForm = inject(ProfileFormService);
  readonly #profileService = inject(ProfileService);
  readonly #languageService = inject(LanguageService);
  readonly #dialog = inject(MatDialog);
  readonly #bottomSheet = inject(MatBottomSheet);
  readonly #breakpointObserver = inject(BreakpointObserver);

  readonly message = signal<string | null>(null);
  readonly isSavingProfile = signal(false);
  readonly isEditing = signal(false);
  readonly isPhone = signal(false);

  readonly roleBadgeText = computed(() => {
    const role = this.auth.user()?.role;
    if (!role) return '';
    return `${this.t('role')}: ${this.t(role)}`;
  });

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
  }

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  startEdit(): void {
    const user = this.auth.user();
    if (user) {
      this.profileForm.patchFromUser(user);
    }
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.message.set(null);
  }

  saveProfile(): void {
    if (this.profileForm.form.invalid) return;
    this.isSavingProfile.set(true);
    this.message.set(null);

    const value = this.profileForm.form.getRawValue();
    this.#profileService
      .updateProfile({
        email: value.email,
        currentPassword: '',
      })
      .subscribe({
        next: (response) => {
          this.auth.updateSession(response);
          this.isSavingProfile.set(false);
          this.isEditing.set(false);
          this.message.set('profileUpdated');
        },
        error: (err) => {
          this.isSavingProfile.set(false);
          this.message.set(
            err.status === 400
              ? 'incorrectCurrentPassword'
              : 'couldNotUpdateProfile',
          );
        },
      });
  }

  openPasswordChange(): void {
    const data = { requireCurrentPassword: true };
    const result$ = this.isPhone()
      ? this.#bottomSheet
          .open(PasswordBottomSheetComponent, { data })
          .afterDismissed()
      : this.#dialog
          .open(PasswordDialogComponent, { data, width: '400px' })
          .afterClosed();

    result$.subscribe((result) => {
      if (!result) return;
      this.#profileService
        .changePassword({
          currentPassword: result.currentPassword,
          newPassword: result.newPassword,
        })
        .subscribe({
          next: () => {
            this.message.set('passwordChanged');
          },
          error: (err) => {
            this.message.set(
              err.status === 400
                ? 'incorrectCurrentPassword'
                : 'couldNotChangePassword',
            );
          },
        });
    });
  }
}
