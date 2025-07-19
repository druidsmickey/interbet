import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { DataService } from '../services/data.service';
import { WinnerService } from '../services/winner.service'; // Import the service

@Component({
  selector: 'app-chart',
  imports: [CommonModule, FormsModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent implements OnInit {
  items: any[] = [];
  winners: any[] = [];
  numRaces: number = 8;
  numHorses: number = 11;
  totalstake: number[] = [];
  totalpayout: any[][] = [];
  totalprofitloss: any[][] = [];

  constructor(private itemService: DataService, private winnerService: WinnerService, private http: HttpClient) {}

  ngOnInit() {

    for (let i = 0; i < this.numRaces; i++) {
      this.totalstake[i] = 0;
      this.totalpayout[i] = [];
      this.totalprofitloss[i] = [];
      for (let j = 0; j < this.numHorses; j++) {
        this.totalpayout[i][j] = 0;
        this.totalprofitloss[i][j] = 0;
      }
    }
  

    this.itemService.getItems().subscribe(itemsData => {
      this.items = itemsData;

      this.winnerService.getWinners().subscribe(winnersData => {
        this.winners = winnersData;

        // Build a map for quick winner lookup by raceNum
        const winnerMap = new Map<number, any>();
        for (const winner of this.winners) {
          winnerMap.set(winner.raceNum, winner);
        }

        // Calculate totalstake for each race, ignoring items with cancel=1, special=1,
        // or winner.specialNum[horseNum-1]=true, or winner.rule4Num[horseNum-1]=true
        for (let race = 0; race < this.numRaces; race++) {
          this.totalstake[race] = this.items
            .filter(item => {
              if (
                item.raceNum !== race + 1 ||
                item.cancel === 1 ||
                item.special === 1
              ) {
                return false;
              }
              const winner = winnerMap.get(item.raceNum);
              // If winner or winner.specialNum or winner.rule4Num is missing, include the item
              if (!winner || !winner.specialNum || !winner.rule4Num) return true;
              // Exclude if winner.specialNum[horseNum-1] is true or winner.rule4Num[horseNum-1] is true
              if (winner.specialNum[item.horseNum - 1] === true) return false;
              if (winner.rule4Num[item.horseNum - 1] === true) return false;
              return true;
            })
            .reduce((sum, item) => {
              const stake = item.bettype === 2 ? -(item.stake || 0) : (item.stake || 0);
              return sum + stake;
            }, 0);
        }

        // Calculate totalpayout for each horse in each race
        for (let i = 0; i < this.numRaces; i++) {
          for (let j = 0; j < this.numHorses; j++) {
            const winner = winnerMap.get(i + 1);
            if (!winner) {
              console.log(winner);
              continue;
            }
            if (
              !winner.specialNum ||
              !winner.rule4Num ||
              (winner.specialNum && winner.specialNum[j] === true) ||
              (winner.rule4Num && winner.rule4Num[j] === true)
            ) {
              this.totalpayout[i][j] = 'Withdrawn';
              this.totalprofitloss[i][j] = 'Withdrawn';
              console.log(`Race ${i + 1}, Horse ${j + 1}: Withdrawn`);
              continue;
            }
            // Sum payout for all items for this race/horse, ignoring cancel/special
            const payout = this.items
              .filter(item =>
                item.raceNum === i + 1 &&         // Only items for the current race (i+1 because i is 0-based)
                item.horseNum === j + 1 &&        // Only items for the current horse (j+1 because j is 0-based)
                item.cancel !== 1 &&              // Exclude cancelled items
                item.special !== 1                // Exclude special items
              )
              .reduce((sum, item) => {
                const payoutValue = item.bettype === 2 ? -(item.payout || 0) : (item.payout || 0);
                console.log(`Race ${i + 1}, Horse ${j + 1}: Payout Value = ${payoutValue}`);
                return sum + payoutValue;
              }, 0);
              console.log(winner.rule4Deduction);
            // this.totalpayout[i][j] = payout * (100 - winner.rule4Deduction) / 100; // Store the total payout for horse j in race i
            // Calculate profit/loss: totalstake for the race minus payout for this horse
            this.totalprofitloss[i][j] = this.totalstake[i] - (payout * (100 - winner.rule4Deduction) / 100);
            console.log(`Race ${i + 1}, Horse ${j + 1}: Stake = ${this.totalstake[i]}, Payout = ${payout}, Profit/Loss = ${this.totalprofitloss[i][j]}`);
          }
        }

      });

    });

  }
};
