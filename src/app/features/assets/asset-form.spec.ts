import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { AssetForm } from './asset-form';
import { AssetsService } from '../../core/api/assets.service';
import type { Asset } from '../../core/models/domain';

describe('AssetForm', () => {
  const serviceMock = {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    isPatrimonyTaken: jest.fn()
  };
  const routerMock = { navigate: jest.fn() };
  const messagesMock = { add: jest.fn() };

  const asset: Asset = {
    id: 'a1',
    patrimonyNumber: 'P-1',
    serialNumber: 'SN1',
    description: 'Notebook',
    subItems: [{ id: 's1', name: 'Carregador', patrimonyNumber: 'P-1.1' }],
    status: 'disponivel'
  };

  function configure(routeId: string | null): void {
    TestBed.configureTestingModule({
      imports: [AssetForm],
      providers: [
        { provide: AssetsService, useValue: serviceMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: messagesMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: jest.fn(() => routeId) } } }
        }
      ]
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    serviceMock.isPatrimonyTaken.mockReturnValue(of(false));
  });

  it('cria formulário de novo equipamento sem id', async () => {
    configure(null);
    await TestBed.compileComponents();

    const component = TestBed.createComponent(AssetForm).componentInstance;
    expect(component.isEdit).toBe(false);
    expect(component.formTitle).toBe('Novo equipamento');
  });

  it('adiciona e remove subitens', async () => {
    configure(null);
    await TestBed.compileComponents();

    const component = TestBed.createComponent(AssetForm).componentInstance;
    component.addSubItem({ id: 's1', name: 'Carregador', patrimonyNumber: 'P-1.1' });
    expect(component.subItems.length).toBe(1);

    component.removeSubItem(0);
    expect(component.subItems.length).toBe(0);
  });

  it('não envia formulário inválido', fakeAsync(() => {
    configure(null);
    TestBed.compileComponents();
    const component = TestBed.createComponent(AssetForm).componentInstance;

    component.submit();
    expect(component.form.touched).toBe(true);
    expect(serviceMock.create).not.toHaveBeenCalled();
    tick();
  }));

  it('cria equipamento quando formulário é válido', fakeAsync(() => {
    configure(null);
    TestBed.compileComponents();
    const component = TestBed.createComponent(AssetForm).componentInstance;

    component.form.patchValue({
      patrimonyNumber: 'P-2',
      serialNumber: 'SN2',
      description: 'Projetor',
      status: 'disponivel'
    });
    component.form.controls.patrimonyNumber.updateValueAndValidity();
    tick();

    serviceMock.create.mockReturnValue(of(asset));
    component.submit();

    expect(serviceMock.create).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/equipamentos']);
  }));

  it('carrega e atualiza equipamento em modo edição', fakeAsync(() => {
    configure('a1');
    serviceMock.get.mockReturnValue(of(asset));
    TestBed.compileComponents();

    const component = TestBed.createComponent(AssetForm).componentInstance;
    component.ngOnInit();
    tick();

    expect(component.isEdit).toBe(true);
    expect(component.form.value.description).toBe('Notebook');
    expect(component.subItems.length).toBe(1);

    component.form.controls.patrimonyNumber.updateValueAndValidity();
    tick();

    serviceMock.update.mockReturnValue(of(asset));
    component.submit();

    expect(serviceMock.update).toHaveBeenCalledWith('a1', expect.objectContaining({ description: 'Notebook' }));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/equipamentos']);
  }));
});
