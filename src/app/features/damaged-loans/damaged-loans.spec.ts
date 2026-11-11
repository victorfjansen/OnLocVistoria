import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DamagedLoans } from './damaged-loans';
import { DamagesService } from '../../core/api/damages.service';
import { LoansService } from '../../core/api/loans.service';
import type { Damage, Loan } from '../../core/models/domain';

describe('DamagedLoans', () => {
  const damagesMock = { list: jest.fn() };
  const loansMock = { list: jest.fn() };

  const loan: Loan = {
    id: 'l1',
    clientId: 'c1',
    organization: 'UFV',
    date: '2026-01-01T10:00:00Z',
    status: 'com avarias',
    items: [{ id: 'i1', assetId: 'a1', patrimonyNumber: 'P-1', returned: false }]
  };

  const damage: Damage = {
    id: 'd1',
    loanId: 'l1',
    loanItemId: 'i1',
    description: 'Tela trincada',
    photos: [],
    registeredBy: 'Ana',
    registeredAt: '2026-01-02T10:00:00Z'
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    damagesMock.list.mockReturnValue(of([damage]));
    loansMock.list.mockReturnValue(of([loan]));

    await TestBed.configureTestingModule({
      imports: [DamagedLoans],
      providers: [
        { provide: DamagesService, useValue: damagesMock },
        { provide: LoansService, useValue: loansMock }
      ]
    }).compileComponents();
  });

  it('carrega avarias e empréstimos', () => {
    const component = TestBed.createComponent(DamagedLoans).componentInstance;
    component.ngOnInit();

    expect(damagesMock.list).toHaveBeenCalled();
    expect(loansMock.list).toHaveBeenCalled();
    expect(component.damages()).toEqual([damage]);
    expect(component.loans()).toEqual([loan]);
    expect(component.loading()).toBe(false);
  });

  it('resolve organização do empréstimo', () => {
    const component = TestBed.createComponent(DamagedLoans).componentInstance;
    component.ngOnInit();

    expect(component.loanOrg('l1')).toBe('UFV');
    expect(component.loanOrg('missing')).toBe('—');
  });

  it('resolve número de patrimônio do item avariado', () => {
    const component = TestBed.createComponent(DamagedLoans).componentInstance;
    component.ngOnInit();

    expect(component.itemPatrimony(damage)).toBe('P-1');
  });
});
