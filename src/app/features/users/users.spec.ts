import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { Users } from './users';
import { UsersService } from '../../core/api/users.service';
import type { User } from '../../core/models/domain';

describe('Users', () => {
  const serviceMock = { list: jest.fn(), delete: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  let confirm: ConfirmationService;
  let messages: MessageService;

  const user: User = { id: 'u1', name: 'Ana', email: 'ana@x.com', role: 'Analista' };

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceMock.list.mockReturnValue(of([user]));

    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        { provide: UsersService, useValue: serviceMock },
        { provide: Router, useValue: routerMock },
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();

    confirm = TestBed.inject(ConfirmationService);
    messages = TestBed.inject(MessageService);
  });

  it('carrega usuários no ngOnInit', () => {
    const component = TestBed.createComponent(Users).componentInstance;
    component.ngOnInit();

    expect(serviceMock.list).toHaveBeenCalled();
    expect(component.users()).toEqual([user]);
    expect(component.loading()).toBe(false);
  });

  it('mapeia severidade conforme o papel', () => {
    const component = TestBed.createComponent(Users).componentInstance;
    expect(component.roleSeverity('Gestor')).toBe('success');
    expect(component.roleSeverity('Analista')).toBe('info');
  });

  it('navega para novo usuário', () => {
    const component = TestBed.createComponent(Users).componentInstance;
    component.newUser();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/usuarios/novo']);
  });

  it('exclui usuário após confirmação', () => {
    serviceMock.delete.mockReturnValue(of(undefined));
    const addSpy = jest.spyOn(messages, 'add');

    let accept: (() => void) | undefined;
    jest.spyOn(confirm, 'confirm').mockImplementation((cfg: any) => {
      accept = cfg.accept;
    });

    const component = TestBed.createComponent(Users).componentInstance;
    component.confirmDelete(user);
    accept?.();

    expect(serviceMock.delete).toHaveBeenCalledWith('u1');
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success', summary: 'Usuário excluído' })
    );
  });
});
