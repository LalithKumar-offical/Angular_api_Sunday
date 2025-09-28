import { TestBed } from '@angular/core/testing';
import { RoleGuard } from './role-guard';
import { RouterTestingModule } from '@angular/router/testing';
import { inject } from '@angular/core/testing';
import { Router } from '@angular/router';

describe('RoleGuard', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [RoleGuard]
    });
  });

  it('should be created', inject([RoleGuard], (guard: RoleGuard) => {
    expect(guard).toBeTruthy();
  }));
});
