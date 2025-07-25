import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { WinnerService } from '../services/winner.service'; // Import the service

@Component({
  selector: 'app-data-entry',
  imports: [FormsModule, CommonModule],
  templateUrl: './data-entry.component.html',
  styleUrls: ['./data-entry.component.css']
})
export class DataEntryComponent implements OnInit {
  numRaces: number = 8;
  numHorses: number = 11;
  items: any[] = [];
  winners: any[] = [];
  totalstake: number[] = [];
  totalstakePerHorse: number[][] = []; // <-- Add this line
  totalpayout: any[][] = [];
  totalprofitloss: any[][] = [];
  raceNum: number | null = null;
  horseNum: number | null = null;
  betType: number | null = 1; // Default value set to 1 for "Sale"
  _oddsType: number | null = 1; // Default value set to 1 for "Books 500"
  books: number | null = null;
  f500: number | null = null;
  odds100: number | null = null;
  stake: number | null = null;
  tax: number | null = 5;
  payout: number = 0; // Initialize payout to null
  nameClient: string | null = null;
  cancel: number = 0;
  special: number = 0; // Initialize special to 0
  rule4: number = 0; // Initialize rule4 to 0
  errorMessage: string = '';

  constructor(private itemService: DataService, private winnerService: WinnerService) {}
  
  ngOnInit() {
    for (let i = 0; i < this.numRaces; i++) {
      this.totalstake[i] = 0;
      this.totalstakePerHorse[i] = []; // <-- Add this line
      this.totalpayout[i] = [];
      this.totalprofitloss[i] = [];
      for (let j = 0; j < this.numHorses; j++) {
        this.totalstakePerHorse[i][j] = 0; // <-- Add this line
        this.totalpayout[i][j] = 0;
        this.totalprofitloss[i][j] = 0;
      }
    }


    this.itemService.getItems().subscribe(data => {
      this.items = data;

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
              const stake = item.betType === 2 ? -(item.stake || 0) : (item.stake || 0);
              return sum + stake;
            }, 0);
        }

        // Calculate totalstakePerHorse for each horse in each race
        for (let i = 0; i < this.numRaces; i++) {
          for (let j = 0; j < this.numHorses; j++) {
            this.totalstakePerHorse[i][j] = this.items
              .filter(item =>
                item.raceNum === i + 1 &&
                item.horseNum === j + 1 &&
                item.cancel !== 1 &&
                item.special !== 1
              )
              .reduce((sum, item) => {
                const stake = item.betType === 2 ? -(item.stake || 0) : (item.stake || 0);
                return sum + stake;
              }, 0);
          }
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
                const payoutValue = item.betType === 2 ? -(item.payout || 0) : (item.payout || 0);
                console.log(`Race ${i + 1}, Horse ${j + 1}: Payout Value = ${payoutValue}`);
              //  this.totalpayout[i][j] += payoutValue; // Accumulate payout for
                console.log(item.betType);
                return sum + payoutValue;
              }, 0);
              console.log(winner.rule4Deduction);
            // this.totalpayout[i][j] = payout * (100 - winner.rule4Deduction) / 100; // Store the total payout for horse j in race i
            // Calculate profit/loss: totalstake for the race minus payout for this horse
            this.totalprofitloss[i][j] = this.totalstake[i] - (payout * (100 - winner.rule4Deduction) / 100);
            console.log(`Race ${i + 1}, Horse ${j + 1}: Payout = ${this.totalpayout[i][j]}`);
            // Store the total payout for horse j in race i (after rule4 deduction)
            this.totalpayout[i][j] = payout * (100 - winner.rule4Deduction) / 100;
            // Calculate profit/loss: totalstake for the race minus payout for this horse
            this.totalprofitloss[i][j] = this.totalstake[i] - this.totalpayout[i][j];
          }
        }

      });
    });
  }

  getAvgSumForRace(raceIdx: number): number {
    if (!Array.isArray(this.totalpayout?.[raceIdx]) || !Array.isArray(this.totalstakePerHorse?.[raceIdx])) {
      return 0;
    }
    return this.totalpayout[raceIdx]
      .map((payout: any, idx: number) =>
        payout !== 0 && payout !== 'Withdrawn'
          ? ((+((this.totalstakePerHorse?.[raceIdx]?.[idx]) || 0)) / (+payout || 1) * 500)
          : 0
      )
      .reduce((sum: number, val: number) => sum + (isNaN(val) ? 0 : +val), 0);
  }

  get oddsType(): number | null {
    return this._oddsType;
  }

  set oddsType(value: number | null) {
    this._oddsType = value;
    this.clearFields();
  }

  clearFields() {
    this.books = null;
    this.f500 = null;
    this.stake = null;
    this.odds100 = null;
  }

  saveDataF500() {
    if (this.raceNum === null || this.horseNum === null || this.books === null || this.f500 === null || this.nameClient === null || this.tax === null || this.betType === null) {
      if (this.tax === 0) {
        // Allow tax to be 0
      } else {
        this.errorMessage = 'All fields are required!';
        return;
      }
    }

    this.errorMessage = '';
    const selection = {
      raceNum: this.raceNum ?? 0, // Use nullish coalescing to handle null values
      horseNum: this.horseNum ?? 0,
      betType: this.betType ?? 1,
      oddsType: this.oddsType ?? 1,
      books: this.books ?? 0,
      f500: this.f500 ?? 0,
      odds100: this.odds100 ?? 0,
      stake: (this.books ?? 0) * (this.f500 ?? 0), // Use nullish coalescing for calculations
      payout: (this.books ?? 0) * 500,
      cancel: this.cancel ?? 0, // Provide a default value for cancel
      nameClient: this.nameClient ?? 'Unknown', // Provide a default value for nameClient
      tax: this.tax ?? 5,
      special: this.special ?? 0, // Provide a default value for special
      rule4: this.rule4 ?? 0 // Provide a default value for rule4
    };

    this.itemService.addItem(selection).subscribe(response => {
      // Data saved successfully in F500
    });

    // Clear the fields after saving
    this.raceNum = null;
    this.horseNum = null;
    this.betType = 1; // Reset betType to default value
    this.oddsType = 1; // Reset oddsType to default value
    this.odds100 = null;
    this.stake = null; // Reset stake to null
    this.books = null;
    this.f500 = null;
    this.nameClient = null;
    this.tax = 5; // Reset tax to default value
    this.cancel = 0; // Reset cancel to default value
    this.special = 0; // Provide a default value for special
    this.rule4 = 0; // Provide a default value for rule4
    

    this.itemService.getItems().subscribe(data => {
      this.items = data;
      // Recalculate totals after saving
      this.ngOnInit();
    });

  }

  saveDataOdds() {
    if (this.raceNum === null || this.horseNum === null || this.stake === null || this.odds100 === null || this.nameClient === null || this.tax === null || this.betType === null) {
      if (this.tax === 0) {
        // Allow tax to be 0
      } else {
        this.errorMessage = 'All fields are required!';
        return;
      }
    }

    this.errorMessage = '';

    const selection = {
      raceNum: this.raceNum ?? 0, // Use nullish coalescing to handle null values
      horseNum: this.horseNum ?? 0,
      betType: this.betType ?? 1,
      oddsType: this.oddsType ?? 1,
      f500: this.f500 ?? 0,
      odds100: this.odds100 ?? 0,
      stake: this.stake, // Use nullish coalescing for calculations
      payout: (this.stake ?? 0) * (this.odds100 ?? 0) /100,
      books: ((this.stake ?? 0) * (this.odds100 ?? 0) /100)/500,
      cancel: this.cancel ?? 0, // Provide a default value for cancel
      nameClient: this.nameClient ?? 'Unknown', // Provide a default value for nameClient
      tax: this.tax ?? 5,
      special: this.special ?? 0, // Provide a default value for special
      rule4: this.rule4 ?? 0 // Provide a default value for rule4
    };

    this.itemService.addItem(selection).subscribe(response => {
      // Data saved successfully in F500
    });

    // Clear the fields after saving
    this.raceNum = null;
    this.horseNum = null;
    this.betType = 1; // Reset betType to default value
    this.oddsType = 1; // Reset oddsType to default value
    this.odds100 = null;
    this.stake = null; // Reset stake to null
    this.books = null;
    this.f500 = null;
    this.nameClient = null;
    this.tax = 5; // Reset tax to default value
    this.cancel = 0; // Reset cancel to default value
    this.special = 0; // Provide a default value for special
    this.rule4 = 0; // Provide a default value for rule4  
    

    this.itemService.getItems().subscribe(data => {
      this.items = data;
      // Recalculate totals after saving
      this.ngOnInit();
    });

  }
}