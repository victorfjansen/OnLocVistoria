import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Login } from './login';
import { AuthService } from '../../core/auth/auth.service';

describe('Login', () => {
  const authMock = { login: jest.fn() };
  const routerMock = { navigate: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();
  });

  function createComponent(): Login {
    return TestBed.createComponent(Login).componentInstance;
  }

  it('deve criar o componente com formulário inválido', () => {
    const component = createComponent();
    expect(component).toBeTruthy();
    expect(component.form.invalid).toBe(true);
  });

  it('valida e-mail e senha', () => {
    const component = createComponent();
    component.form.patchValue({ email: 'invalido', password: '123' });
    expect(component.email.hasError('email')).toBe(true);
    expect(component.password.hasError('minlength')).toBe(true);
  });

  it('não autentica com formulário inválido', () => {
    const component = createComponent();
    component.submit();
    expect(authMock.login).not.toHaveBeenCalled();
    expect(component.form.touched).toBe(true);
  });

  it('autentica e navega para o dashboard', () => {
    authMock.login.mockReturnValue(of({ id: 'u1', name: 'Ana', email: 'ana@x.com', role: 'Analista' }));
    const component = createComponent();
    component.form.patchValue({ email: 'ana@x.com', password: '123456' });
    component.submit();

    expect(authMock.login).toHaveBeenCalledWith('ana@x.com', '123456');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.loading).toBe(false);
  });

  it('exibe mensagem de erro em credenciais inválidas', () => {
    authMock.login.mockReturnValue(throwError(() => new Error('401')));
    const component = createComponent();
    component.form.patchValue({ email: 'ana@x.com', password: '123456' });
    component.submit();

    expect(component.errorMessage).toBeTruthy();
    expect(component.loading).toBe(false);
  });
});
