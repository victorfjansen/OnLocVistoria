import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { Inspections } from './inspections';
import { ClientsService } from '../../core/api/clients.service';
import { InspectionsService } from '../../core/api/inspections.service';
import { LoansService } from '../../core/api/loans.service';
import type { Client, Inspection, Loan } from '../../core/models/domain';

describe('Inspections', () => {
  const inspectionsMock = { list: jest.fn() };
  const clientsMock = { list: jest.fn() };
  const loansMock = { list: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    inspectionsMock.list.mockReturnValue(of([]));
    clientsMock.list.mockReturnValue(of([{ id: 'c1', tradeName: 'Acme' } as Client]));
    loansMock.list.mockReturnValue(of([{ id: 'l1', organization: 'UFV' } as Loan]));

    await TestBed.configureTestingModule({
      imports: [Inspections],
      providers: [
        { provide: InspectionsService, useValue: inspectionsMock },
        { provide: ClientsService, useValue: clientsMock },
        { provide: LoansService, useValue: loansMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  it('carrega vistorias, clientes e empréstimos', () => {
    const component = TestBed.createComponent(Inspections).componentInstance;
    component.ngOnInit();

    expect(inspectionsMock.list).toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('resolve nomes de cliente e organização', () => {
    const component = TestBed.createComponent(Inspections).componentInstance;
    component.ngOnInit();

    expect(component.clientName('c1')).toBe('Acme');
    expect(component.clientName('missing')).toBe('—');
    expect(component.loanOrg('l1')).toBe('UFV');
  });

  it('mapeia rótulo e severidade da avaliação', () => {
    const component = TestBed.createComponent(Inspections).componentInstance;
    expect(component.assessmentLabel('avaria_por_mau_uso')).toBe('Com avaria');
    expect(component.assessmentLabel('sem_avaria')).toBe('Sem avaria');
    expect(component.assessmentSeverity('avaria_por_mau_uso')).toBe('danger');
    expect(component.assessmentSeverity('sem_avaria')).toBe('success');
  });

  it('mapeia rótulo e severidade da aprovação', () => {
    const component = TestBed.createComponent(Inspections).componentInstance;
    expect(component.approvalLabel('pendente')).toBe('Pendente');
    expect(component.approvalLabel('aprovado')).toBe('Aprovado');
    expect(component.approvalLabel('reprovado')).toBe('Reprovado');
    expect(component.approvalSeverity('pendente')).toBe('warn');
    expect(component.approvalSeverity('aprovado')).toBe('success');
    expect(component.approvalSeverity('reprovado')).toBe('danger');
  });

  it('navega para nova vistoria', () => {
    const component = TestBed.createComponent(Inspections).componentInstance;
    component.newInspection();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/devolucoes/nova']);
  });
});
