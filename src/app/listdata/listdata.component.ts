import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listdata',
  imports: [CommonModule, FormsModule],
  templateUrl: './listdata.component.html',
  styleUrl: './listdata.component.css'
})

export class ListdataComponent implements OnInit {
  items: any[] = [];

  constructor(private itemService: DataService, private http: HttpClient) {}

  ngOnInit() {
    this.itemService.getItems().subscribe(data => {
      this.items = data.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt).getTime();
        const dateB = new Date(b.date || b.createdAt).getTime();
        return dateB - dateA; // latest first
      });
    });
  }

  loadItems() {
    this.itemService.getItems().subscribe(data => this.items = data);
  }

  updateCancelStatus(item: any) {
    const newCancelValue = item.cancel === 1 ? 0 : 1; // Toggle cancel value
    console.log('Updating cancel status for item:', item._id, 'New value:', newCancelValue);

    this.itemService.updateCancelStatus(item._id, newCancelValue).subscribe(
      (response) => {
        console.log('Cancel status updated successfully:', response); // Log success response
        item.cancel = newCancelValue; // Update the local item's cancel value
      },
      (error) => {
        console.error('Failed to update cancel status:', error); // Log error response
      }
    );
  }
}
