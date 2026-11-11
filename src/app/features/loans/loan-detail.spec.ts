import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { LoanDetail } from './loan-detail';
import { ClientsService } from '../../core/api/clients.service';
import { LoansService } from '../../core/api/loans.service';
import type { Client, Loan } from '../../core/models/domain';

describe('LoanDetail', () => {
  const serviceMock = { get: jest.fn() };
  const clientsMock = { get: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  const loan: Loan = {
    id: 'l1',
    clientId: 'c1',
    organization: 'UFV',
    date: '2026-01-01T10:00:00Z',
    status: 'com avarias',
    items: []
  };

  const client: Client = {
    id: 'c1',
    responsible: 'Ana',
    document: '11144477735',
    documentType: 'CPF',
    tradeName: 'Acme',
    location: 'Campinas',
    createdAt: '2026-01-01T00:00:00Z'
  };

  function configure(routeId: string | null): void {
    TestBed.configureTestingModule({
      imports: [LoanDetail],
      providers: [
        { provide: LoansService, useValue: serviceMock },
        { provide: ClientsService, useValue: clientsMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: jest.fn(() => routeId) } } }
        }
      ]
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    serviceMock.get.mockReturnValue(of(loan));
    clientsMock.get.mockReturnValue(of(client));
  });

  it('carrega empréstimo e cliente', async () => {
    configure('l1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(LoanDetail).componentInstance;
    component.ngOnInit();

    expect(serviceMock.get).toHaveBeenCalledWith('l1');
    expect(clientsMock.get).toHaveBeenCalledWith('c1');
    expect(component.loan()).toEqual(loan);
    expect(component.client()).toEqual(client);
    expect(component.loading()).toBe(false);
  });

  it('não carrega quando não há id na rota', async () => {
    configure(null);
    await TestBed.compileComponents();

    const component = TestBed.createComponent(LoanDetail).componentInstance;
    component.ngOnInit();

    expect(serviceMock.get).not.toHaveBeenCalled();
  });

  it('mapeia rótulo e severidade do status', async () => {
    configure('l1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(LoanDetail).componentInstance;
    expect(component.label('com avarias')).toBe('Com avarias');
    expect(component.severity('com avarias')).toBe('danger');
  });

  it('volta para a lista', async () => {
    configure('l1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(LoanDetail).componentInstance;
    component.back();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/emprestimos']);
  });
});
