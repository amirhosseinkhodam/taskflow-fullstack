import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmBottomSheetComponent } from '../../../shared/components/confirm-bottom-sheet';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { PasswordBottomSheetComponent } from '../../../shared/components/password-bottom-sheet';
import { PasswordDialogComponent } from '../../../shared/components/password-dialog';
import { ButtonComponent } from '../../../shared/components/button';
import { PageHeaderComponent } from '../../../shared/components/page-header';
import { LanguageService } from '../../../shared/services/language';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { USER_ROLES } from '@shared/const/user-roles';
import { AuthStore } from '../../auth/store/auth';
import type { UserModel } from '../models/admin';
import { AdminStore } from '../store/admin';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  providers: [AdminStore],
  imports: [
    CommonModule,
    MatDialogModule,
    MatBottomSheetModule,
    ButtonComponent,
    PageHeaderComponent,
    TranslatePipe,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <app-page-header
        [title]="'adminPanel' | translate"
        [roleBadge]="roleBadgeText()"
        (logout)="auth.logout()"
      />

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-medium text-slate-900 dark:text-white">
            {{ 'users' | translate }}
          </h2>
          <div class="text-sm text-slate-500 dark:text-slate-400">
            {{ store.users().length }} {{ 'users' | translate }}
          </div>
        </div>

        <div
          class="overflow-x-auto rounded-card border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        >
          <table class="w-full min-w-[640px]">
            <thead
              class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700"
            >
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {{ 'email' | translate }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell"
                >
                  {{ 'name' | translate }}
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {{ 'role' | translate }}
                </th>
                <th
                  class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  {{ 'actions' | translate }}
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
                  <td
                    class="px-4 py-3 text-sm text-slate-900 dark:text-white hidden md:table-cell"
                  >
                    {{ getDisplayName(user) }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      [ngClass]="{
                        'bg-amber-200 text-amber-900 dark:bg-amber-800/40 dark:text-amber-200':
                          user.role === USER_ROLES.SUPER_ADMIN,
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                          user.role === USER_ROLES.ADMIN,
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300':
                          user.role === USER_ROLES.USER,
                      }"
                    >
                      {{ user.role | translate }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div
                      class="flex items-center justify-end gap-1 sm:gap-2 flex-wrap"
                    >
                      <app-button
                        variant="ghost"
                        [cssClass]="
                          user.role === USER_ROLES.USER
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        "
                        [disabled]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                        (buttonClick)="toggleRole(user)"
                      >
                        <span class="hidden sm:inline">{{
                          user.role === USER_ROLES.USER
                            ? ('promoteToAdmin' | translate)
                            : ('demoteToUser' | translate)
                        }}</span>
                        <span class="sm:hidden text-xs">{{
                          user.role === USER_ROLES.USER
                            ? ('promoteShort' | translate)
                            : ('demoteShort' | translate)
                        }}</span>
                      </app-button>
                      <app-button
                        variant="ghost"
                        [disabled]="isSuperAdminUser(user)"
                        (buttonClick)="openPasswordChange(user)"
                      >
                        <span class="hidden sm:inline">{{
                          'changePassword' | translate
                        }}</span>
                        <span class="sm:hidden text-xs">{{
                          'password' | translate
                        }}</span>
                      </app-button>
                      <app-button
                        variant="destructive"
                        [disabled]="
                          user.id === currentUserId() || isSuperAdminUser(user)
                        "
                        (buttonClick)="confirmDeleteUser(user)"
                      >
                        <span class="hidden sm:inline">{{
                          'deleteUser' | translate
                        }}</span>
                        <span class="sm:hidden text-xs">{{
                          'delete' | translate
                        }}</span>
                      </app-button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td
                    colspan="4"
                    class="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    {{ 'noUsers' | translate }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (store.message()) {
          <div
            class="mt-4 rounded-lg px-4 py-3 text-sm"
            [ngClass]="{
              'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300':
                store.message() === 'passwordChanged' ||
                store.message() === 'roleUpdated' ||
                store.message() === 'userDeleted',
              'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300':
                store.message() !== 'passwordChanged' &&
                store.message() !== 'roleUpdated' &&
                store.message() !== 'userDeleted',
            }"
          >
            {{ store.message() | translate }}
          </div>
        }
      </main>
    </div>
  `,
})
export class AdminPanelComponent implements OnInit {
  readonly store = inject(AdminStore);
  readonly auth = inject(AuthStore);
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #dialog = inject(MatDialog);
  readonly #bottomSheet = inject(MatBottomSheet);
  readonly #languageService = inject(LanguageService);

  readonly currentUserId = computed(() => this.auth.user()?.id ?? null);
  readonly roleBadgeText = computed(() => {
    const role = this.auth.user()?.role;
    if (!role) return '';
    return `${this.#languageService.translate('role')}: ${this.#languageService.translate(role)}`;
  });
  isPhone = signal(false);

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
  }

  ngOnInit(): void {
    this.store.loadUsers();
  }

  isSuperAdminUser(user: UserModel): boolean {
    return user.role === USER_ROLES.SUPER_ADMIN;
  }

  getDisplayName(user: UserModel): string {
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return name || user.email;
  }

  toggleRole(user: UserModel): void {
    if (user.id === this.currentUserId()) return;
    const newRole =
      user.role === USER_ROLES.USER ? USER_ROLES.ADMIN : USER_ROLES.USER;
    this.store.updateUserRole({ id: user.id, role: newRole });
  }

  confirmDeleteUser(user: UserModel): void {
    if (user.id === this.currentUserId()) return;
    const confirmed$ = this.isPhone()
      ? this.#bottomSheet
          .open(ConfirmBottomSheetComponent, {
            data: {
              title: 'confirmDeleteUser',
              message: 'confirmDeleteUserMessage',
            },
          })
          .afterDismissed()
      : this.#dialog
          .open(ConfirmDialogComponent, {
            data: {
              title: 'confirmDeleteUser',
              message: 'confirmDeleteUserMessage',
            },
          })
          .afterClosed();

    confirmed$.subscribe((confirmed) => {
      if (!confirmed) return;
      this.store.deleteUser(user.id);
    });
  }

  openPasswordChange(user: UserModel): void {
    const data = { requireCurrentPassword: false };
    const result$ = this.isPhone()
      ? this.#bottomSheet
          .open(PasswordBottomSheetComponent, { data })
          .afterDismissed()
      : this.#dialog
          .open(PasswordDialogComponent, { data, width: '400px' })
          .afterClosed();

    result$.subscribe((result) => {
      if (!result) return;
      this.store.changePassword({
        userId: user.id,
        newPassword: result.newPassword,
      });
    });
  }
}
