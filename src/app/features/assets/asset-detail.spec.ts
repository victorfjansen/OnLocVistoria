import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { AssetDetail } from './asset-detail';
import { AssetsService } from '../../core/api/assets.service';
import type { Asset, Loan } from '../../core/models/domain';

describe('AssetDetail', () => {
  const serviceMock = { get: jest.fn(), loans: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  const asset: Asset = {
    id: 'a1',
    patrimonyNumber: 'P-1',
    serialNumber: 'SN1',
    description: 'Notebook',
    subItems: [],
    status: 'emprestado'
  };

  const loan: Loan = {
    id: 'l1',
    clientId: 'c1',
    organization: 'UFV',
    date: '2026-01-01T10:00:00Z',
    status: 'sem avarias',
    items: []
  };

  function configure(routeId: string | null): void {
    TestBed.configureTestingModule({
      imports: [AssetDetail],
      providers: [
        { provide: AssetsService, useValue: serviceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: jest.fn(() => routeId) } } }
        }
      ]
    });
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceMock.get.mockReturnValue(of(asset));
    serviceMock.loans.mockReturnValue(of([loan]));
  });

  it('carrega equipamento e histórico de empréstimos', async () => {
    configure('a1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(AssetDetail).componentInstance;
    component.ngOnInit();

    expect(serviceMock.get).toHaveBeenCalledWith('a1');
    expect(serviceMock.loans).toHaveBeenCalledWith('a1');
    expect(component.asset()).toEqual(asset);
    expect(component.loans()).toEqual([loan]);
    expect(component.loading()).toBe(false);
  });

  it('não carrega quando não há id na rota', async () => {
    configure(null);
    await TestBed.compileComponents();

    const component = TestBed.createComponent(AssetDetail).componentInstance;
    component.ngOnInit();

    expect(serviceMock.get).not.toHaveBeenCalled();
  });

  it('mapeia rótulo e severidade de status e empréstimo', async () => {
    configure('a1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(AssetDetail).componentInstance;
    expect(component.statusLabel('avariado')).toBe('Avariado');
    expect(component.statusSeverity('avariado')).toBe('danger');
    expect(component.loanLabel('sem avarias')).toBe('Sem avarias');
    expect(component.loanSeverity('com avarias')).toBe('danger');
  });

  it('navega para edição e volta para a lista', async () => {
    configure('a1');
    await TestBed.compileComponents();

    const component = TestBed.createComponent(AssetDetail).componentInstance;
    component.ngOnInit();

    component.edit();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/equipamentos', 'a1', 'editar']);

    component.back();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/equipamentos']);
  });
});
