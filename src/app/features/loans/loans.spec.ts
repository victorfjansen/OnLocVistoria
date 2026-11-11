import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { Loans } from './loans';
import { ClientsService } from '../../core/api/clients.service';
import { LoansService } from '../../core/api/loans.service';
import type { Client, Loan } from '../../core/models/domain';

describe('Loans', () => {
  const serviceMock = { list: jest.fn() };
  const clientsMock = { list: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  const loan: Loan = {
    id: 'l1',
    clientId: 'c1',
    organization: 'UFV',
    date: '2026-01-01T10:00:00Z',
    status: 'sem avarias',
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

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceMock.list.mockReturnValue(of([loan]));
    clientsMock.list.mockReturnValue(of([client]));

    await TestBed.configureTestingModule({
      imports: [Loans],
      providers: [
        { provide: LoansService, useValue: serviceMock },
        { provide: ClientsService, useValue: clientsMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  it('carrega empréstimos e clientes após o debounce', fakeAsync(() => {
    const component = TestBed.createComponent(Loans).componentInstance;
    tick(200);

    expect(serviceMock.list).toHaveBeenCalled();
    expect(component.clients()).toEqual([client]);
  }));

  it('calcula opções de clientes para o filtro', fakeAsync(() => {
    const component = TestBed.createComponent(Loans).componentInstance;
    tick(200);

    expect(component.clientOptions()).toEqual([
      { label: 'Todos os clientes', value: '' },
      { label: 'Acme', value: 'c1' }
    ]);
  }));

  it('resolve nome do cliente e rótulo/severidade do status', fakeAsync(() => {
    const component = TestBed.createComponent(Loans).componentInstance;
    tick(200);

    expect(component.clientName('c1')).toBe('Acme');
    expect(component.clientName('missing')).toBe('—');
    expect(component.label('sem avarias')).toBe('Sem avarias');
    expect(component.severity('com avarias')).toBe('danger');
  }));

  it('navega para detalhe e novo empréstimo', fakeAsync(() => {
    const component = TestBed.createComponent(Loans).componentInstance;
    tick(200);

    component.open(loan);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/emprestimos', 'l1']);

    component.newLoan();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/emprestimos/novo']);
  }));
});
