import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { ClientDetail } from './client-detail';
import { ClientsService } from '../../core/api/clients.service';
import type { Client, Loan } from '../../core/models/domain';

describe('ClientDetail', () => {
  const serviceMock = { get: jest.fn(), loans: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  const client: Client = {
    id: 'c1',
    responsible: 'Ana',
    document: '11144477735',
    documentType: 'CPF',
    tradeName: 'Acme',
    location: 'Campinas',
    createdAt: '2026-01-01T00:00:00Z'
  };

  const loan: Loan = {
    id: 'l1',
    clientId: 'c1',
    organization: 'UFV',
    date: '2026-01-01T10:00:00Z',
    status: 'com avarias',
    items: []
  };

  function configure(routeId: string | null): void {
    TestBed.configureTestingModule({
      imports: [ClientDetail],
      providers: [
        { provide: ClientsService, useValue: serviceMock },
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
    serviceMock.get.mockReturnValue(of(client));
    serviceMock.loans.mockReturnValue(of([loan]));
  });

  it('carrega cliente e empréstimos', async () => {
    configure('c1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(ClientDetail).componentInstance;
    component.ngOnInit();

    expect(serviceMock.get).toHaveBeenCalledWith('c1');
    expect(serviceMock.loans).toHaveBeenCalledWith('c1');
    expect(component.client()).toEqual(client);
    expect(component.loans()).toEqual([loan]);
    expect(component.loading()).toBe(false);
  });

  it('não carrega quando não há id na rota', async () => {
    configure(null);
    await TestBed.compileComponents();

    const component = TestBed.createComponent(ClientDetail).componentInstance;
    component.ngOnInit();

    expect(serviceMock.get).not.toHaveBeenCalled();
  });

  it('mapeia rótulo e severidade do status do empréstimo', async () => {
    configure('c1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(ClientDetail).componentInstance;
    expect(component.statusLabel('com avarias')).toBe('Com avarias');
    expect(component.statusSeverity('com avarias')).toBe('danger');
    expect(component.statusLabel('sem avarias')).toBe('Sem avarias');
    expect(component.statusSeverity('sem avarias')).toBe('success');
  });

  it('navega para edição e volta para a lista', async () => {
    configure('c1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(ClientDetail).componentInstance;
    component.ngOnInit();

    component.edit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/clientes', 'c1', 'editar']);

    component.back();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/clientes']);
  });
});
