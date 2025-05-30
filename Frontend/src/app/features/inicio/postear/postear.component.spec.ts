import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostearComponent } from './postear.component';

describe('PostearComponent', () => {
  let component: PostearComponent;
  let fixture: ComponentFixture<PostearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
