import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmBottomSheetComponent } from '../../../shared/components/confirm-bottom-sheet';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle';
import { InputComponent, ButtonComponent } from '../../../shared/components';
import { LanguageService } from '../../../shared/services/language';
import { AuthStore } from '../../auth/store/auth';
import { PasswordFormService } from '../forms/password';
import type { UserModel } from '../models/admin';
import { AdminStore } from '../store/admin';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  providers: [AdminStore],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatBottomSheetModule,
    ThemeToggleComponent,
    LanguageToggleComponent,
    InputComponent,
    ButtonComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header
        class="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4">
              <app-button
                variant="secondary"
                type="button"
                (buttonClick)="goBack()"
              >
                {{ t('backToDashboard') }}
              </app-button>
              <h1 class="text-xl font-semibold text-slate-900 dark:text-white">
                {{ t('adminPanel') }}
              </h1>
              <span
                class="px-2 py-0.5 text-xs font-medium rounded-full"
                [ngClass]="{
                  'bg-amber-200 text-amber-900 dark:bg-amber-800/40 dark:text-amber-200':
                    isSuperAdmin(),
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    !isSuperAdmin() && isAdmin(),
                  'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300':
                    !isAdmin(),
                }"
              >
                {{ t('role') }}:
                {{
                  t(
                    isSuperAdmin() ? 'superAdmin' : isAdmin() ? 'admin' : 'user'
                  )
                }}
              </span>
            </div>
            <div class="flex items-center gap-3 flex-wrap justify-end">
              <app-language-toggle></app-language-toggle>
              <app-theme-toggle></app-theme-toggle>
              <app-button variant="ghost" (buttonClick)="logout()">
                {{ t('logout') }}
              </app-button>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-medium text-slate-900 dark:text-white">
            {{ t('users') }}
          </h2>
          <div class="text-sm text-slate-500 dark:text-slate-400">
            {{ store.users().length }} {{ t('users') }}
          </div>
        </div>

        <div
          class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          <table class="w-full">
            <thead
              class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700"
            >
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {{ t('email') }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {{ t('name') }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {{ t('role') }}
                </th>
                <th
                  class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {{ t('actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              @for (user of store.users(); track user.id) {
                <tr
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td class="px-4 py-3 text-sm text-slate-900 dark:text-white">
                    {{ user.email }}
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-900 dark:text-white">
                    {{ user.name }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-amber-200 text-amber-900 dark:bg-amber-800/40 dark:text-amber-200':
                          user.role === 'superAdmin',
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                          user.role === 'admin',
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300':
                          user.role === 'user',
                      }"
                    >
                      {{ t(user.role) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <app-button
                        variant="ghost"
                        [cssClass]="
                          user.role === 'user'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        "
                        [disabled]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                        (buttonClick)="toggleRole(user)"
                      >
                        {{
                          user.role === 'user'
                            ? t('promoteToAdmin')
                            : t('demoteToUser')
                        }}
                      </app-button>
                      <app-button
                        variant="ghost"
                        [disabled]="isSuperAdminUser(user)"
                        (buttonClick)="startPasswordChange(user)"
                      >
                        {{ t('changePassword') }}
                      </app-button>
                      <app-button
                        variant="destructive"
                        [disabled]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                        (buttonClick)="confirmDeleteUser(user)"
                      >
                        {{ t('deleteUser') }}
                      </app-button>
                    </div>
                    @if (store.passwordChangeUserId() === user.id) {
                      <form
                        [formGroup]="passwordForm.form"
                        (ngSubmit)="submitPasswordChange()"
                        class="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                      >
                        <app-input
                          type="password"
                          formControlName="newPassword"
                          [placeholder]="t('newPassword')"
                          variant="default"
                        />
                        <app-input
                          class="mt-2"
                          type="password"
                          formControlName="confirmPassword"
                          [placeholder]="t('confirmPassword')"
                          variant="default"
                        />
                        @if (
                          passwordForm.form.hasError('passwordsMismatch') &&
                          passwordForm.form.touched
                        ) {
                          <p
                            class="mt-1 text-xs text-red-600 dark:text-red-400"
                          >
                            {{ t('passwordsDoNotMatch') }}
                          </p>
                        }
                        @if (
                          passwordForm.form
                            .get('newPassword')
                            ?.hasError('minLength') &&
                          passwordForm.form.get('newPassword')?.touched
                        ) {
                          <p
                            class="mt-1 text-xs text-red-600 dark:text-red-400"
                          >
                            {{ t('passwordTooShort') }}
                          </p>
                        }
                        <div class="mt-2 flex gap-2">
                          <app-button
                            variant="primary"
                            class="flex-1"
                            type="submit"
                            [disabled]="passwordForm.form.invalid"
                          >
                            {{ t('save') }}
                          </app-button>
                          <app-button
                            variant="secondary"
                            type="button"
                            (buttonClick)="cancelPasswordChange()"
                          >
                            {{ t('cancel') }}
                          </app-button>
                        </div>
                      </form>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td
                    colspan="4"
                    class="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    {{ t('noUsers') }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (store.message()) {
          <div
            class="mt-4 p-4 rounded-lg text-sm"
            [ngClass]="{
              'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300':
                !store.message().startsWith('couldNot'),
              'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300':
                store.message().startsWith('couldNot'),
            }"
          >
            {{ t(store.message()) }}
          </div>
        }
      </main>
    </div>
  `,
})
export class AdminPanelComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly passwordForm = inject(PasswordFormService);
  readonly auth = inject(AuthStore);
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #dialog = inject(MatDialog);
  readonly #bottomSheet = inject(MatBottomSheet);
  readonly #languageService = inject(LanguageService);
  readonly #router = inject(Router);

  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  isPhone = signal(false);

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
  }

  ngOnInit(): void {
    this.store.loadUsers();
  }

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isSuperAdmin(): boolean {
    return this.auth.user()?.role === 'superAdmin';
  }

  isSuperAdminUser(user: UserModel): boolean {
    return user.role === 'superAdmin';
  }

  logout(): void {
    this.auth.logout();
    this.#router.navigate(['/login']);
  }

  goBack(): void {
    this.#router.navigate(['/']);
  }

  toggleRole(user: UserModel): void {
    if (user.id === this.currentUserId()) return;
    const newRole = user.role === 'user' ? 'admin' : 'user';
    this.store.updateUserRole({ id: user.id, role: newRole });
  }

  confirmDeleteUser(user: UserModel): void {
    if (user.id === this.currentUserId()) return;
    const confirmed$ = this.isPhone()
      ? this.#bottomSheet.open(ConfirmBottomSheetComponent).afterDismissed()
      : this.#dialog.open(ConfirmDialogComponent).afterClosed();

    confirmed$.subscribe((confirmed) => {
      if (!confirmed) return;
      this.store.deleteUser(user.id);
    });
  }

  startPasswordChange(user: UserModel): void {
    this.store.startPasswordChange(user.id);
  }

  cancelPasswordChange(): void {
    this.store.cancelPasswordChange();
  }

  submitPasswordChange(): void {
    this.store.changePassword();
  }
}
