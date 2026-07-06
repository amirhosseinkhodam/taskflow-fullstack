import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmBottomSheetComponent } from '../../../shared/components/confirm-bottom-sheet';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle';
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
    RouterLink,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header
        class="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-4">
              <button
                class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                type="button"
                routerLink="/"
              >
                {{ t('backToDashboard') }}
              </button>
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
              <button
                (click)="logout()"
                class="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {{ t('logout') }}
              </button>
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
                      <button
                        (click)="toggleRole(user)"
                        [disabled]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                        [ngClass]="
                          user.role === 'user'
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        "
                        [class.opacity-50]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                        [class.cursor-not-allowed]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                      >
                        {{
                          user.role === 'user'
                            ? t('promoteToAdmin')
                            : t('demoteToUser')
                        }}
                      </button>
                      <button
                        (click)="startPasswordChange(user)"
                        [disabled]="isSuperAdminUser(user)"
                        class="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        [class.opacity-50]="isSuperAdminUser(user)"
                        [class.cursor-not-allowed]="isSuperAdminUser(user)"
                      >
                        {{ t('changePassword') }}
                      </button>
                      <button
                        (click)="confirmDeleteUser(user)"
                        [disabled]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                        class="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        [class.opacity-50]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                        [class.cursor-not-allowed]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                      >
                        {{ t('deleteUser') }}
                      </button>
                    </div>
                    @if (store.passwordChangeUserId() === user.id) {
                      <form
                        [formGroup]="passwordForm.form"
                        (ngSubmit)="submitPasswordChange()"
                        class="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                      >
                        <input
                          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                          type="password"
                          formControlName="newPassword"
                          [placeholder]="t('newPassword')"
                        />
                        <input
                          class="mt-2 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                          type="password"
                          formControlName="confirmPassword"
                          [placeholder]="t('confirmPassword')"
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
                          <button
                            class="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                            type="submit"
                            [disabled]="passwordForm.form.invalid"
                          >
                            {{ t('save') }}
                          </button>
                          <button
                            class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
                            type="button"
                            (click)="cancelPasswordChange()"
                          >
                            {{ t('cancel') }}
                          </button>
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
