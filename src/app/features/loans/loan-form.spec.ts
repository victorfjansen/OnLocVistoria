import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { LoanForm } from './loan-form';
import { AssetsService } from '../../core/api/assets.service';
import { ClientsService } from '../../core/api/clients.service';
import { LoansService } from '../../core/api/loans.service';
import type { Asset, Client, Loan } from '../../core/models/domain';

describe('LoanForm', () => {
  const serviceMock = { create: jest.fn() };
  const clientsMock = { list: jest.fn() };
  const assetsMock = { list: jest.fn() };
  const routerMock = { navigate: jest.fn() };
  const messagesMock = { add: jest.fn() };

  const client: Client = {
    id: 'c1',
    responsible: 'Ana',
    document: '11144477735',
    documentType: 'CPF',
    tradeName: 'Acme',
    location: 'Campinas',
    createdAt: '2026-01-01T00:00:00Z'
  };

  const asset: Asset = {
    id: 'a1',
    patrimonyNumber: 'P-1',
    serialNumber: 'SN1',
    description: 'Notebook',
    subItems: [],
    status: 'disponivel'
  };

  const createdLoan: Loan = {
    id: 'l1',
    clientId: 'c1',
    organization: 'UFV',
    date: '2026-01-01T10:00:00Z',
    status: 'sem avarias',
    items: []
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    clientsMock.list.mockReturnValue(of([client]));
    assetsMock.list.mockReturnValue(of([asset]));

    await TestBed.configureTestingModule({
      imports: [LoanForm],
      providers: [
        { provide: LoansService, useValue: serviceMock },
        { provide: ClientsService, useValue: clientsMock },
        { provide: AssetsService, useValue: assetsMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: messagesMock }
      ]
    }).compileComponents();
  });

  it('carrega clientes e equipamentos no construtor', () => {
    const component = TestBed.createComponent(LoanForm).componentInstance;
    expect(component.clients()).toEqual([client]);
    expect(component.assets()).toEqual([asset]);
  });

  it('adiciona e remove itens do formulário', () => {
    const component = TestBed.createComponent(LoanForm).componentInstance;
    component.addItem();
    expect(component.items.length).toBe(1);

    component.removeItem(0);
    expect(component.items.length).toBe(0);
  });

  it('não envia formulário inválido', () => {
    const component = TestBed.createComponent(LoanForm).componentInstance;
    component.submit();

    expect(component.form.touched).toBe(true);
    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('cria empréstimo com itens e patrimônio resolvido', () => {
    const component = TestBed.createComponent(LoanForm).componentInstance;
    component.form.patchValue({
      clientId: 'c1',
      organization: 'UFV',
      date: '2026-01-01T10:00',
      details: '',
      status: 'sem avarias'
    });
    component.addItem();
    component.assetControl(0).setValue('a1');

    serviceMock.create.mockReturnValue(of(createdLoan));
    component.submit();

    expect(serviceMock.create).toHaveBeenCalled();
    const payload = serviceMock.create.mock.calls[0][0];
    expect(payload.clientId).toBe('c1');
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].patrimonyNumber).toBe('P-1');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/emprestimos']);
  });
});
