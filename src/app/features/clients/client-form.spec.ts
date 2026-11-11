import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { ClientForm } from './client-form';
import { ClientsService } from '../../core/api/clients.service';
import type { Client } from '../../core/models/domain';

describe('ClientForm', () => {
  const serviceMock = {
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    isDocumentTaken: jest.fn()
  };
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

  function configure(routeId: string | null): void {
    TestBed.configureTestingModule({
      imports: [ClientForm],
      providers: [
        { provide: ClientsService, useValue: serviceMock },
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
    serviceMock.isDocumentTaken.mockReturnValue(of(false));
  });

  it('cria formulário de novo cliente sem id', async () => {
    configure(null);
    await TestBed.compileComponents();

    const component = TestBed.createComponent(ClientForm).componentInstance;
    expect(component.isEdit).toBe(false);
    expect(component.formTitle).toBe('Novo cliente');
  });

  it('valida CPF conforme o tipo selecionado', async () => {
    configure(null);
    await TestBed.compileComponents();

    const component = TestBed.createComponent(ClientForm).componentInstance;
    component.form.patchValue({
      tradeName: 'Acme',
      responsible: 'Ana',
      documentType: 'CPF',
      document: '123'
    });
    expect(component.document.hasError('cpfCnpj')).toBe(true);
  });

  it('não envia formulário inválido', fakeAsync(() => {
    configure(null);
    TestBed.compileComponents();
    const component = TestBed.createComponent(ClientForm).componentInstance;

    component.submit();
    expect(component.form.touched).toBe(true);
    expect(serviceMock.create).not.toHaveBeenCalled();
    tick();
  }));

  it('cria cliente com documento somente dígitos', fakeAsync(() => {
    configure(null);
    TestBed.compileComponents();
    const component = TestBed.createComponent(ClientForm).componentInstance;

    component.form.patchValue({
      tradeName: 'Acme',
      responsible: 'Ana',
      documentType: 'CPF',
      document: '111.444.777-35',
      location: 'Campinas'
    });
    component.form.controls.document.updateValueAndValidity();
    tick();

    serviceMock.create.mockReturnValue(of(client));
    component.submit();

    expect(serviceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ document: '11144477735', documentType: 'CPF' })
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/clientes']);
  }));

  it('carrega e atualiza cliente em modo edição', fakeAsync(() => {
    configure('c1');
    serviceMock.get.mockReturnValue(of(client));
    TestBed.compileComponents();

    const component = TestBed.createComponent(ClientForm).componentInstance;
    component.ngOnInit();
    tick();

    expect(component.isEdit).toBe(true);
    expect(component.form.value.tradeName).toBe('Acme');
    expect(component.form.value.document).toBe('111.444.777-35');

    component.form.controls.document.updateValueAndValidity();
    tick();

    serviceMock.update.mockReturnValue(of(client));
    component.submit();

    expect(serviceMock.update).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({ document: '11144477735' })
    );
  }));
});
