import { TestBed } from '@angular/core/testing';

import { Forbidden } from './forbidden';

describe('Forbidden', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Forbidden] }).compileComponents();
  });

  it('deve criar o componente', () => {
    const fixture = TestBed.createComponent(Forbidden);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
