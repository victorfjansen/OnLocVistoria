import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { Clients } from './clients';
import { ClientsService } from '../../core/api/clients.service';
import type { Client } from '../../core/models/domain';

describe('Clients', () => {
  const serviceMock = { list: jest.fn(), delete: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  let confirm: ConfirmationService;
  let messages: MessageService;

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
    serviceMock.list.mockReturnValue(of([client]));

    await TestBed.configureTestingModule({
      imports: [Clients],
      providers: [
        { provide: ClientsService, useValue: serviceMock },
        { provide: Router, useValue: routerMock },
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();

    confirm = TestBed.inject(ConfirmationService);
    messages = TestBed.inject(MessageService);
  });

  it('carrega clientes após o debounce da busca', (done) => {
    TestBed.createComponent(Clients);
    setTimeout(() => {
      try {
        expect(serviceMock.list).toHaveBeenCalled();
        done();
      } catch (error) {
        done(error);
      }
    }, 350);
  });

  it('navega para novo, detalhe e edição', fakeAsync(() => {
    const component = TestBed.createComponent(Clients).componentInstance;

    component.newClient();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/clientes/novo']);

    component.open(client);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/clientes', 'c1']);

    component.edit(client);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/clientes', 'c1', 'editar']);
  }));

  it('exclui cliente após confirmação', fakeAsync(() => {
    serviceMock.delete.mockReturnValue(of(undefined));
    const addSpy = jest.spyOn(messages, 'add');

    let accept: (() => void) | undefined;
    jest.spyOn(confirm, 'confirm').mockImplementation((cfg: any) => {
      accept = cfg.accept;
    });

    const component = TestBed.createComponent(Clients).componentInstance;

    component.confirmDelete(client);
    accept?.();

    expect(serviceMock.delete).toHaveBeenCalledWith('c1');
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', summary: 'Cliente excluído' })
    );
  }));
});
