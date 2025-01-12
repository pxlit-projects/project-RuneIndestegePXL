import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FilterComponent } from './filter.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule,
        FilterComponent,
        BrowserAnimationsModule 
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit filterChanged event with processed filter on form submit', () => {
    spyOn(component.filterChanged, 'emit');

    const startDate = new Date('2023-01-01T00:00:00');
    const endDate = new Date('2023-01-02T00:00:00');

    component.filter = {
      author: 'John',
      content: 'Test content',
      startDate: startDate,
      endDate: endDate
    };

    const form = {
      valid: true,
      value: component.filter
    };

    component.onSubmit(form);

    const emittedValue = (component.filterChanged.emit as jasmine.Spy).calls.mostRecent().args[0];
    
    expect(emittedValue.author).toBe('john');
    expect(emittedValue.content).toBe('test content');
    expect(emittedValue.startDate.getFullYear()).toBe(2023);
    expect(emittedValue.startDate.getMonth()).toBe(0);
    expect(emittedValue.startDate.getDate()).toBe(1);
    
    expect(emittedValue.endDate.getFullYear()).toBe(2023);
    expect(emittedValue.endDate.getMonth()).toBe(0);
    expect(emittedValue.endDate.getDate()).toBe(2);
    expect(emittedValue.endDate.getHours()).toBe(23);
    expect(emittedValue.endDate.getMinutes()).toBe(59);
    expect(emittedValue.endDate.getSeconds()).toBe(59);
    expect(emittedValue.endDate.getMilliseconds()).toBe(999);
  });

  it('should not emit filterChanged event if form is invalid', () => {
    spyOn(component.filterChanged, 'emit');

    const form = {
      valid: false,
      value: component.filter
    };

    component.onSubmit(form);

    expect(component.filterChanged.emit).not.toHaveBeenCalled();
  });
});