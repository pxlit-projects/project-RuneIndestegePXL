import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Filter } from '../../models/filter.model';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule, 
  MatIcon],
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent {
  filter: Filter = { author: '', content: '', startDate: undefined, endDate: undefined };

  @Output() filterChanged = new EventEmitter<Filter>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit(form: any) {
    if (form.valid) {
      const processedFilter: Filter = {
        author: this.filter.author?.toLowerCase() || '',
        content: this.filter.content?.toLowerCase() || '',
        startDate: this.filter.startDate ? new Date(this.filter.startDate) : undefined,
        endDate: this.filter.endDate ? new Date(this.filter.endDate) : undefined
      };

      // end of day :p 
      if (processedFilter.endDate) {
        processedFilter.endDate.setHours(23, 59, 59, 999);
      }

      this.filterChanged.emit(processedFilter);

    }
  }

}
