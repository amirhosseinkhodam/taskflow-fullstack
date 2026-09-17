import { BreakpointObserver } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CommentListComponent } from '../../../../../src/app/features/comments/components/comment-list';
import { ConfirmBottomSheetComponent } from '../../../../../src/app/shared/components/confirm-bottom-sheet';
import { ConfirmDialogComponent } from '../../../../../src/app/shared/components/confirm-dialog';
import { LanguageService } from '../../../../../src/app/shared/services/language';
import { createMockLanguageService } from '../../../../support/language';
import type { CommentModel } from '@shared/types/task';

describe('CommentListComponent', () => {
  let fixture: ComponentFixture<CommentListComponent>;

  const mockComments: CommentModel[] = [
    {
      id: 11,
      taskId: 1,
      userId: 7,
      userName: 'Ada',
      content: 'First comment',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
  ];

  let dialogOpen: jest.Mock;
  let bottomSheetOpen: jest.Mock;

  function setup(isPhone: boolean, confirmed: boolean | undefined) {
    dialogOpen = jest
      .fn()
      .mockReturnValue({ afterClosed: () => of(confirmed) });
    bottomSheetOpen = jest
      .fn()
      .mockReturnValue({ afterDismissed: () => of(confirmed) });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CommentListComponent, NoopAnimationsModule],
      providers: [
        { provide: LanguageService, useValue: createMockLanguageService() },
        { provide: MatDialog, useValue: { open: dialogOpen } },
        { provide: MatBottomSheet, useValue: { open: bottomSheetOpen } },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: isPhone }) },
        },
      ],
    });

    fixture = TestBed.createComponent(CommentListComponent);
    fixture.componentRef.setInput('comments', mockComments);
    fixture.componentRef.setInput('currentUserId', 7);
    fixture.detectChanges();
  }

  function clickDelete(): void {
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll(
        'button',
      ) as ArrayLike<HTMLButtonElement>,
    );
    const deleteBtn = buttons.find((b) =>
      b.textContent?.includes('deleteComment'),
    );
    expect(deleteBtn).toBeTruthy();
    deleteBtn!.click();
    fixture.detectChanges();
  }

  it('opens the shared confirm dialog on desktop, not a native confirm', () => {
    const nativeConfirm = jest.fn();
    window.confirm = nativeConfirm;
    setup(false, true);

    clickDelete();

    expect(dialogOpen).toHaveBeenCalledTimes(1);
    expect(dialogOpen.mock.calls[0][0]).toBe(ConfirmDialogComponent);
    expect(bottomSheetOpen).not.toHaveBeenCalled();
    expect(nativeConfirm).not.toHaveBeenCalled();
  });

  it('opens the shared confirm bottom sheet on mobile', () => {
    setup(true, true);

    clickDelete();

    expect(bottomSheetOpen).toHaveBeenCalledTimes(1);
    expect(bottomSheetOpen.mock.calls[0][0]).toBe(ConfirmBottomSheetComponent);
    expect(dialogOpen).not.toHaveBeenCalled();
  });

  it('passes comment-specific translation keys to the confirmation', () => {
    setup(false, true);

    clickDelete();

    expect(dialogOpen.mock.calls[0][1]).toEqual({
      data: { title: 'deleteComment', message: 'confirmDeleteComment' },
    });
  });

  it('emits onDelete only once the user confirms', () => {
    setup(false, true);
    const emitted: number[] = [];
    fixture.componentInstance.onDelete.subscribe((id) => emitted.push(id));

    clickDelete();

    expect(emitted).toEqual([11]);
  });

  it('does not emit onDelete when the user cancels', () => {
    setup(false, false);
    const emitted: number[] = [];
    fixture.componentInstance.onDelete.subscribe((id) => emitted.push(id));

    clickDelete();

    expect(emitted).toEqual([]);
  });

  it('does not emit onDelete when the sheet is dismissed without a choice', () => {
    setup(true, undefined);
    const emitted: number[] = [];
    fixture.componentInstance.onDelete.subscribe((id) => emitted.push(id));

    clickDelete();

    expect(emitted).toEqual([]);
  });
});
