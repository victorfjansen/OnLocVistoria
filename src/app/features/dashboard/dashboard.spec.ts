import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Dashboard } from './dashboard';
import { AssetsService } from '../../core/api/assets.service';
import { ClientsService } from '../../core/api/clients.service';
import { DamagesService } from '../../core/api/damages.service';
import { InspectionsService } from '../../core/api/inspections.service';
import { LoansService } from '../../core/api/loans.service';
import { AuthService } from '../../core/auth/auth.service';
import type { Client, Inspection, Loan } from '../../core/models/domain';

describe('Dashboard', () => {
  const clientsMock = { list: jest.fn() };
  const assetsMock = { list: jest.fn() };
  const loansMock = { list: jest.fn() };
  const inspectionsMock = { list: jest.fn() };
  const damagesMock = { list: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    clientsMock.list.mockReturnValue(of([]));
    assetsMock.list.mockReturnValue(of([]));
    loansMock.list.mockReturnValue(of([]));
    inspectionsMock.list.mockReturnValue(of([]));
    damagesMock.list.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: ClientsService, useValue: clientsMock },
        { provide: AssetsService, useValue: assetsMock },
        { provide: LoansService, useValue: loansMock },
        { provide: InspectionsService, useValue: inspectionsMock },
        { provide: DamagesService, useValue: damagesMock },
        { provide: AuthService, useValue: { user: () => null } },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  function createComponent(): Dashboard {
    return TestBed.createComponent(Dashboard).componentInstance;
  }

  it('carrega dados e calcula os cards', () => {
    clientsMock.list.mockReturnValue(of([{ id: 'c1', tradeName: 'Acme' } as Client]));
    assetsMock.list.mockReturnValue(of([{ id: 'a1' } as any]));
    loansMock.list.mockReturnValue(of([{ id: 'l1' } as Loan]));
    inspectionsMock.list.mockReturnValue(
      of([
        { id: 'i1', approval: 'pendente' },
        { id: 'i2', approval: 'aprovado' }
      ] as Inspection[])
    );
    damagesMock.list.mockReturnValue(of([{ id: 'd1' } as any]));

    const component = createComponent();
    component.ngOnInit();

    const cards = component.cards();
    expect(cards.find((c) => c.label === 'Clientes')?.value).toBe(1);
    expect(cards.find((c) => c.label === 'Equipamentos')?.value).toBe(1);
    expect(cards.find((c) => c.label === 'Devoluções pendentes')?.value).toBe(1);
    expect(cards.find((c) => c.label === 'Aprovadas')?.value).toBe(1);
    expect(cards.find((c) => c.label === 'Avariados')?.value).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('ordena devoluções recentes por data decrescente', () => {
    inspectionsMock.list.mockReturnValue(
      of([
        { id: 'i1', date: '2026-01-01T10:00:00Z', approval: 'pendente' },
        { id: 'i2', date: '2026-03-01T10:00:00Z', approval: 'aprovado' },
        { id: 'i3', date: '2026-02-01T10:00:00Z', approval: 'reprovado' }
      ] as Inspection[])
    );

    const component = createComponent();
    component.ngOnInit();

    expect(component.recent().map((i) => i.id)).toEqual(['i2', 'i3', 'i1']);
  });

  it('resolve nome do cliente e organização do empréstimo', () => {
    clientsMock.list.mockReturnValue(of([{ id: 'c1', tradeName: 'Acme' } as Client]));
    loansMock.list.mockReturnValue(of([{ id: 'l1', organization: 'UFV' } as Loan]));

    const component = createComponent();
    component.ngOnInit();

    expect(component.clientName('c1')).toBe('Acme');
    expect(component.clientName('missing')).toBe('—');
    expect(component.loanOrg('l1')).toBe('UFV');
    expect(component.loanOrg('missing')).toBe('—');
  });

  it('mapeia rótulo e severidade de aprovação', () => {
    const component = createComponent();
    expect(component.approvalLabel('pendente')).toBe('Pendente');
    expect(component.approvalLabel('aprovado')).toBe('Aprovado');
    expect(component.approvalLabel('reprovado')).toBe('Reprovado');
    expect(component.approvalSeverity('pendente')).toBe('warn');
    expect(component.approvalSeverity('aprovado')).toBe('success');
    expect(component.approvalSeverity('reprovado')).toBe('danger');
  });

  it('navega ao clicar em um card', () => {
    const component = createComponent();
    component.go('/clientes');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('desliga o loading quando ocorre erro no carregamento', () => {
    clientsMock.list.mockReturnValue(throwError(() => new Error('erro')));
    const component = createComponent();
    component.ngOnInit();
    expect(component.loading()).toBe(false);
  });
});
