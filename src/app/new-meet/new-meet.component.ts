import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';  
import { WinnerService } from '../services/winner.service';

@Component({
  selector: 'app-new-meet',
  imports: [FormsModule,CommonModule],
  templateUrl: './new-meet.component.html',
  styleUrl: './new-meet.component.css'
})
export class NewMeetComponent implements OnInit{
  items: any[] = [];
  winner: any[] = [];
  
  constructor(private itemService: DataService, private winnerService:WinnerService, private http: HttpClient) {}

  ngOnInit() {
    this.itemService.getItems().subscribe(data => {
      this.items = data;
    });
    this.winnerService.getWinners().subscribe(data => {
      this.winner = data;
    });
  }

  resetAll() {
    this.itemService.resetAll().subscribe(data => {
      this.items = data;
    });
    this.winnerService.resetAll().subscribe(data => {
      this.winner = data;
    });
  }
}
