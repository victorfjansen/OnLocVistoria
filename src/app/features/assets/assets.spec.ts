import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { Assets } from './assets';
import { AssetsService } from '../../core/api/assets.service';
import type { Asset } from '../../core/models/domain';

describe('Assets', () => {
  const serviceMock = { list: jest.fn(), delete: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  let confirm: ConfirmationService;
  let messages: MessageService;

  const asset: Asset = {
    id: 'a1',
    patrimonyNumber: 'P-1',
    serialNumber: 'SN1',
    description: 'Notebook',
    subItems: [],
    status: 'disponivel'
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceMock.list.mockReturnValue(of([asset]));

    await TestBed.configureTestingModule({
      imports: [Assets],
      providers: [
        { provide: AssetsService, useValue: serviceMock },
        { provide: Router, useValue: routerMock },
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();

    confirm = TestBed.inject(ConfirmationService);
    messages = TestBed.inject(MessageService);
  });

  function createComponent(): Assets {
    return TestBed.createComponent(Assets).componentInstance;
  }

  it('carrega equipamentos no construtor', () => {
    const component = createComponent();
    expect(serviceMock.list).toHaveBeenCalled();
    expect(component.assets()).toEqual([asset]);
  });

  it('mapeia rótulo e severidade do status', () => {
    const component = createComponent();
    expect(component.label('disponivel')).toBe('Disponível');
    expect(component.severity('disponivel')).toBe('success');
    expect(component.severity('emprestado')).toBe('info');
    expect(component.severity('avariado')).toBe('danger');
  });

  it('navega para novo, detalhe e edição', () => {
    const component = createComponent();
    component.newAsset();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/equipamentos/novo']);

    component.open(asset);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/equipamentos', 'a1']);

    component.edit(asset);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/equipamentos', 'a1', 'editar']);
  });

  it('exclui equipamento após confirmação', () => {
    serviceMock.delete.mockReturnValue(of(undefined));
    const addSpy = jest.spyOn(messages, 'add');

    let accept: (() => void) | undefined;
    jest.spyOn(confirm, 'confirm').mockImplementation((cfg: any) => {
      accept = cfg.accept;
    });

    const component = createComponent();
    component.confirmDelete(asset);
    accept?.();

    expect(serviceMock.delete).toHaveBeenCalledWith('a1');
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', summary: 'Equipamento excluído' })
    );
  });
});
