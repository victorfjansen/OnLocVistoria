import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { InspectionWizard } from './inspection-wizard';
import { ClientsService } from '../../core/api/clients.service';
import { InspectionsService } from '../../core/api/inspections.service';
import type { Client, Loan } from '../../core/models/domain';

describe('InspectionWizard', () => {
  const clientsMock = { list: jest.fn(), loans: jest.fn() };
  const inspectionsMock = { create: jest.fn() };
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

  const loan: Loan = {
    id: 'l1',
    clientId: 'c1',
    organization: 'UFV',
    date: '2026-01-01T10:00:00Z',
    status: 'sem avarias',
    items: [{ id: 'i1', assetId: 'a1', patrimonyNumber: 'P-1', returned: false }]
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    clientsMock.list.mockReturnValue(of([client]));
    clientsMock.loans.mockReturnValue(of([loan]));

    await TestBed.configureTestingModule({
      imports: [InspectionWizard],
      providers: [
        { provide: ClientsService, useValue: clientsMock },
        { provide: InspectionsService, useValue: inspectionsMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: messagesMock }
      ]
    }).compileComponents();
  });

  function createComponent(): InspectionWizard {
    return TestBed.createComponent(InspectionWizard).componentInstance;
  }

  it('carrega clientes no construtor', () => {
    const component = createComponent();
    expect(clientsMock.list).toHaveBeenCalled();
    expect(component.clients()).toEqual([client]);
  });

  it('avança e volta nas etapas', () => {
    const component = createComponent();
    expect(component.step()).toBe(1);
    component.next();
    expect(component.step()).toBe(2);
    component.back();
    expect(component.step()).toBe(1);
  });

  it('alterna devolução de itens e remove fotos', () => {
    const component = createComponent();
    component.toggleReturned('i1', true);
    expect(component.returnedItems['i1']).toBe(true);

    component.photos.set([{ url: 'blob:1' }, { url: 'blob:2' }]);
    component.removePhoto(0);
    expect(component.photos()).toHaveLength(1);
  });

  it('carrega empréstimos ao trocar o cliente', () => {
    const component = createComponent();
    component.onClientChange('c1');

    expect(clientsMock.loans).toHaveBeenCalledWith('c1');
    expect(component.loans()).toEqual([loan]);
    expect(component.selectedLoan).toBeNull();
  });

  it('resolve o empréstimo selecionado', () => {
    const component = createComponent();
    component.selectedLoanId = 'l1';
    component.loans.set([loan]);
    expect(component.selectedLoan?.organization).toBe('UFV');
  });

  it('avisa quando não há avaliação ao submeter', () => {
    const component = createComponent();
    component.selectedClientId = 'c1';
    component.selectedLoanId = 'l1';
    component.loans.set([loan]);
    component.submit();

    expect(messagesMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn', summary: 'Avaliação' })
    );
    expect(inspectionsMock.create).not.toHaveBeenCalled();
  });

  it('avisa quando há avaria sem descrição', () => {
    const component = createComponent();
    component.selectedClientId = 'c1';
    component.selectedLoanId = 'l1';
    component.loans.set([loan]);
    component.assessment = 'avaria_por_mau_uso';
    component.submit();

    expect(messagesMock.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'warn', summary: 'Avaliação' })
    );
    expect(inspectionsMock.create).not.toHaveBeenCalled();
  });

  it('registra vistoria sem avaria e navega', () => {
    inspectionsMock.create.mockReturnValue(of({ id: 'x' }));

    const component = createComponent();
    component.selectedClientId = 'c1';
    component.selectedLoanId = 'l1';
    component.loans.set([loan]);
    component.assessment = 'sem_avaria';
    component.submit();

    expect(inspectionsMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'c1',
        loanId: 'l1',
        assessment: 'sem_avaria'
      })
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/devolucoes']);
  });

  it('registra vistoria com avaria e descrição', () => {
    inspectionsMock.create.mockReturnValue(of({ id: 'x' }));

    const component = createComponent();
    component.selectedClientId = 'c1';
    component.selectedLoanId = 'l1';
    component.loans.set([loan]);
    component.assessment = 'avaria_por_mau_uso';
    component.damageItemId = 'i1';
    component.damageDescription = 'Tela trincada';
    component.submit();

    expect(inspectionsMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        assessment: 'avaria_por_mau_uso',
        damages: [{ loanItemId: 'i1', description: 'Tela trincada', photos: [] }]
      })
    );
  });
});
