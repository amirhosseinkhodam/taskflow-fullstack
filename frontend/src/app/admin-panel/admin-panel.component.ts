import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBottomSheetModule, MatBottomSheet } from '@angular/material/bottom-sheet';
import { ApiService, UserModel } from '../api.service';
import { AuthService } from '../auth.service';
import { LanguageService } from '../language.service';
import { ThemeService } from '../theme.service';
import { ConfirmDialogComponent } from '../confirm-dialog.component';
import { ConfirmBottomSheetComponent } from '../confirm-bottom-sheet.component';
import { ThemeToggleComponent } from '../theme-toggle.component';
import { LanguageToggleComponent } from '../language-toggle.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatBottomSheetModule, ThemeToggleComponent, LanguageToggleComponent],
  templateUrl: './admin-panel.component.html',
})
export class AdminPanelComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly dialog = inject(MatDialog);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly languageService = inject(LanguageService);
  protected readonly theme = inject(ThemeService);

  users = signal<UserModel[]>([]);
  message = signal('');
  currentUserId = signal<number | null>(null);
  isPhone = signal(false);

  // For password modal
  passwordModalUser: UserModel | null = null;
  newPassword = '';
  confirmPassword = '';

  constructor() {
    effect(() => {
      this.theme.isDark();
    });

    this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
  }

  ngOnInit(): void {
    this.loadUsers();
    this.currentUserId.set(this.getCurrentUserId());
  }

  t(key: string): string {
    return this.languageService.translate(key);
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isSuperAdmin(): boolean {
    return this.auth.isSuperAdmin();
  }

  isSuperAdminUser(user: UserModel): boolean {
    return user.role === 'superadmin';
  }

  getCurrentUserId(): number | null {
    const token = this.auth.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: (users) => this.users.set(users),
      error: () => this.message.set(this.t('couldNotLoadUsers')),
    });
  }

  logout(): void {
    this.auth.logout();
  }

  toggleRole(user: UserModel): void {
    if (user.id === this.currentUserId()) return;
    const newRole = user.role === 'user' ? 'admin' : 'user';
    this.api.updateUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        this.users.update((list) =>
          list.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
        );
        this.message.set(this.t('roleUpdated'));
        setTimeout(() => this.message.set(''), 3000);
      },
      error: () => {
        this.message.set(this.t('couldNotUpdateRole'));
        setTimeout(() => this.message.set(''), 3000);
      },
    });
  }

  changePassword(userId: number, password: string): void {
    this.api.changeUserPassword(userId, password).subscribe({
      next: () => {
        this.message.set(this.t('passwordChanged'));
        setTimeout(() => this.message.set(''), 3000);
      },
      error: () => {
        this.message.set(this.t('couldNotChangePassword'));
        setTimeout(() => this.message.set(''), 3000);
      },
    });
  }

  confirmDeleteUser(user: UserModel): void {
    if (user.id === this.currentUserId()) return;
    const confirmed$ = this.isPhone()
      ? this.bottomSheet.open(ConfirmBottomSheetComponent).afterDismissed()
      : this.dialog.open(ConfirmDialogComponent).afterClosed();

    confirmed$.subscribe((confirmed) => {
      if (!confirmed) return;
      this.api.deleteUser(user.id).subscribe({
        next: () => {
          this.users.update((list) => list.filter((u) => u.id !== user.id));
          this.message.set(this.t('userDeleted'));
          setTimeout(() => this.message.set(''), 3000);
        },
        error: () => {
          this.message.set(this.t('couldNotDeleteUser'));
          setTimeout(() => this.message.set(''), 3000);
        },
      });
    });
  }

  openPasswordModal(user: UserModel): void {
    this.passwordModalUser = user;
    this.newPassword = '';
    this.confirmPassword = '';
    this.openConfirmDialog();
  }

  private openConfirmDialog(): void {
    const confirmed$ = this.isPhone()
      ? this.bottomSheet.open(ConfirmBottomSheetComponent).afterDismissed()
      : this.dialog.open(ConfirmDialogComponent).afterClosed();

    confirmed$.subscribe((confirmed) => {
      if (!confirmed) return;
      this.passwordModalUser = null;
    });
  }
}