import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';  
import { WinnerService } from '../services/winner.service';

@Component({
  selector: 'app-params',
  imports: [FormsModule,CommonModule],
  templateUrl: './params.component.html',
  styleUrl: './params.component.css'
})
export class ParamsComponent implements OnInit {
  items: any[] = [];
  winner: any[] = [];
  raceNum: string = '';
  horseNum: string = '';
  numRaces: number = 8;
  numHorses: number = 11;
  constructor(private itemService: DataService, private winnerService:WinnerService, private http: HttpClient) {}

  ngOnInit() {
    this.itemService.getItems().subscribe(data => {
      this.items = data;
    });
    this.winnerService.getWinners().subscribe(data => {
      this.winner = data;
    });
  }

  updateSpecial() {
    const race = Number(this.raceNum);
    const horse = Number(this.horseNum);

    if (
      Number.isInteger(race) && race >= 1 && race <= this.numRaces &&
      Number.isInteger(horse) && horse >= 1 && horse <= this.numHorses
    ) {
      // Check against winner array
      // Assuming winner is an array of objects with numRace and specialNum (array)
      const winnerMatch = this.winner.find(w =>
        w.raceNum == race &&
        Array.isArray(w.specialNum) &&
        w.specialNum[horse - 1] == true
      );

      if (winnerMatch) {
        // Update items where numRace and numHorse match
        this.items.forEach(item => {
          if (item.raceNum == race && item.horseNum == horse) {
            item.special = 1;
            console.log('Item updated:', item);
            // Persist the change to the database
            this.itemService.updateItemSpecial(item._id,item.special ).subscribe({
              next: (res) => console.log('Database updated:', res),
              error: (err) => console.error('Update failed:', err)
            });
          }
        });
      }

      console.log('Update Special clicked', this.raceNum, this.horseNum);

      this.raceNum = '';
      this.horseNum = '';
    }
  }
  cancelSpecial() {
    const race = Number(this.raceNum);
    const horse = Number(this.horseNum);

    if (
      Number.isInteger(race) && race >= 1 && race <= this.numRaces &&
      Number.isInteger(horse) && horse >= 1 && horse <= this.numHorses
    ) {
      // Check against winner array
      // Assuming winner is an array of objects with numRace and specialNum (array)
      const winnerMatch = this.winner.find(w =>
        w.raceNum == race &&
        Array.isArray(w.specialNum) &&
        w.specialNum[horse - 1] == true
      );

      if (winnerMatch) {
        // Update items where numRace and numHorse match
        this.items.forEach(item => {
          if (item.raceNum == race && item.horseNum == horse) {
            item.special = 0;
            console.log('Item updated:', item);
            // Persist the change to the database
            this.itemService.cancelSpecial(item._id,item.special ).subscribe({
              next: (res) => console.log('Database updated:', res),
              error: (err) => console.error('Update failed:', err)
            });
          }
        });
      }

      console.log('Update Special clicked', this.raceNum, this.horseNum);

      this.raceNum = '';
      this.horseNum = '';
    }
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
