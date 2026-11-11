import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

import { Shell } from './shell';
import { AuthService } from '../core/auth/auth.service';
import type { User } from '../core/models/domain';

describe('Shell', () => {
  function setup(user: User | null) {
    const authMock = { user: () => user, logout: jest.fn() };
    TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([]),
        ConfirmationService,
        MessageService,
        { provide: AuthService, useValue: authMock }
      ]
    });
    return authMock;
  }

  it('calcula iniciais a partir do nome do usuário', async () => {
    setup({ id: 'u1', name: 'Ana Souza', email: 'ana@x.com', role: 'Gestor' });
    await TestBed.compileComponents();
    const component = TestBed.createComponent(Shell).componentInstance;
    expect(component.initials).toBe('AS');
  });

  it('calcula iniciais para nome com uma única palavra', async () => {
    setup({ id: 'u1', name: 'Maria', email: 'm@x.com', role: 'Analista' });
    await TestBed.compileComponents();
    const component = TestBed.createComponent(Shell).componentInstance;
    expect(component.initials).toBe('M');
  });

  it('oculta itens de Gestor para Analista', async () => {
    setup({ id: 'u1', name: 'Ana Souza', email: 'ana@x.com', role: 'Analista' });
    await TestBed.compileComponents();
    const component = TestBed.createComponent(Shell).componentInstance;
    const routes = component.visibleItems().map((item) => item.route);
    expect(routes).not.toContain('/aprovacoes');
    expect(routes).not.toContain('/usuarios');
    expect(routes).toHaveLength(6);
  });

  it('exibe todos os itens para Gestor', async () => {
    setup({ id: 'u2', name: 'Bruno Lima', email: 'b@x.com', role: 'Gestor' });
    await TestBed.compileComponents();
    const component = TestBed.createComponent(Shell).componentInstance;
    expect(component.visibleItems()).toHaveLength(8);
  });

  it('encerra a sessão ao chamar logout', async () => {
    const authMock = setup({ id: 'u1', name: 'Ana', email: 'ana@x.com', role: 'Analista' });
    await TestBed.compileComponents();
    const component = TestBed.createComponent(Shell).componentInstance;
    component.logout();
    expect(authMock.logout).toHaveBeenCalled();
  });
});
