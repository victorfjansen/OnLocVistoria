import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { UserForm } from './user-form';
import { UsersService } from '../../core/api/users.service';
import type { User } from '../../core/models/domain';

describe('UserForm', () => {
  const serviceMock = { create: jest.fn(), isEmailTaken: jest.fn() };
  const routerMock = { navigate: jest.fn() };
  const messagesMock = { add: jest.fn() };

  const user: User = { id: 'u1', name: 'Ana', email: 'ana@x.com', role: 'Analista' };

  beforeEach(async () => {
    jest.clearAllMocks();
    serviceMock.isEmailTaken.mockReturnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [UserForm],
      providers: [
        { provide: UsersService, useValue: serviceMock },
        { provide: Router, useValue: routerMock },
        { provide: MessageService, useValue: messagesMock }
      ]
    }).compileComponents();
  });

  it('valida e-mail obrigatório e formato', () => {
    const component = TestBed.createComponent(UserForm).componentInstance;
    component.form.patchValue({ name: 'Ana', email: 'invalido', role: 'Analista' });
    expect(component.email.hasError('email')).toBe(true);
  });

  it('não envia formulário inválido', () => {
    const component = TestBed.createComponent(UserForm).componentInstance;
    component.submit();

    expect(component.form.touched).toBe(true);
    expect(serviceMock.create).not.toHaveBeenCalled();
  });

  it('cria usuário com formulário válido', fakeAsync(() => {
    const component = TestBed.createComponent(UserForm).componentInstance;
    component.form.patchValue({ name: 'Ana', email: 'ana@x.com', role: 'Analista' });
    component.form.controls.email.updateValueAndValidity();
    tick();

    serviceMock.create.mockReturnValue(of(user));
    component.submit();

    expect(serviceMock.create).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@x.com',
      role: 'Analista'
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/usuarios']);
  }));
});
