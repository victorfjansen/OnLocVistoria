import { TestBed } from '@angular/core/testing';

import { ComingSoon } from './coming-soon';

describe('ComingSoon', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ComingSoon] }).compileComponents();
  });

  it('usa o título padrão', () => {
    const fixture = TestBed.createComponent(ComingSoon);
    expect(fixture.componentInstance.title()).toBe('Em construção');
  });

  it('aceita título informado via input', () => {
    const fixture = TestBed.createComponent(ComingSoon);
    fixture.componentRef.setInput('title', 'Relatórios');
    expect(fixture.componentInstance.title()).toBe('Relatórios');
  });
});
