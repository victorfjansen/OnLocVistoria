import { TestBed } from '@angular/core/testing';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { Approvals } from './approvals';
import { ClientsService } from '../../core/api/clients.service';
import { InspectionsService } from '../../core/api/inspections.service';
import { LoansService } from '../../core/api/loans.service';
import type { Client, Inspection, Loan } from '../../core/models/domain';

describe('Approvals', () => {
  const inspectionsMock = { list: jest.fn(), approve: jest.fn(), reject: jest.fn() };
  const clientsMock = { list: jest.fn() };
  const loansMock = { list: jest.fn() };

  let confirm: ConfirmationService;
  let messages: MessageService;

  const inspection: Inspection = {
    id: 'i1',
    clientId: 'c1',
    loanId: 'l1',
    date: '2026-01-01T10:00:00Z',
    photos: [],
    assessment: 'avaria_por_mau_uso',
    approval: 'pendente',
    archived: false
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    inspectionsMock.list.mockReturnValue(of([inspection]));
    clientsMock.list.mockReturnValue(of([{ id: 'c1', tradeName: 'Acme' } as Client]));
    loansMock.list.mockReturnValue(of([{ id: 'l1', organization: 'UFV' } as Loan]));

    await TestBed.configureTestingModule({
      imports: [Approvals],
      providers: [
        { provide: InspectionsService, useValue: inspectionsMock },
        { provide: ClientsService, useValue: clientsMock },
        { provide: LoansService, useValue: loansMock },
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();

    confirm = TestBed.inject(ConfirmationService);
    messages = TestBed.inject(MessageService);
  });

  function createComponent(): Approvals {
    return TestBed.createComponent(Approvals).componentInstance;
  }

  it('carrega vistorias e calcula pendentes', () => {
    const component = createComponent();
    component.ngOnInit();

    expect(inspectionsMock.list).toHaveBeenCalled();
    expect(component.pending()).toHaveLength(1);
    expect(component.loading()).toBe(false);
  });

  it('resolve nome do cliente e organização do empréstimo', () => {
    const component = createComponent();
    component.ngOnInit();

    expect(component.clientName('c1')).toBe('Acme');
    expect(component.clientName('missing')).toBe('—');
    expect(component.loanOrg('l1')).toBe('UFV');
    expect(component.loanFor('l1')?.organization).toBe('UFV');
    expect(component.loanFor('missing')).toBeNull();
  });

  it('seleciona vistoria para exibir detalhes', () => {
    const component = createComponent();
    component.viewDetails(inspection);
    expect(component.selected()).toBe(inspection);
  });

  it('aprova a vistoria a partir do diálogo', () => {
    inspectionsMock.approve.mockReturnValue(of(inspection));
    const addSpy = jest.spyOn(messages, 'add');

    const component = createComponent();
    component.ngOnInit();
    component.viewDetails(inspection);

    let accept: (() => void) | undefined;
    jest.spyOn(confirm, 'confirm').mockImplementation((cfg: any) => {
      accept = cfg.accept;
    });

    component.approveFromDialog();
    accept?.();

    expect(inspectionsMock.approve).toHaveBeenCalledWith('i1');
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', summary: 'Aprovado' })
    );
    expect(component.selected()).toBeNull();
  });

  it('reprova a vistoria a partir do diálogo', () => {
    inspectionsMock.reject.mockReturnValue(of(inspection));
    const addSpy = jest.spyOn(messages, 'add');

    const component = createComponent();
    component.viewDetails(inspection);

    let accept: (() => void) | undefined;
    jest.spyOn(confirm, 'confirm').mockImplementation((cfg: any) => {
      accept = cfg.accept;
    });

    component.rejectFromDialog();
    accept?.();

    expect(inspectionsMock.reject).toHaveBeenCalledWith('i1');
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'info', summary: 'Reprovado' })
    );
  });
});
