import { Component, OnInit, TrackByFunction } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, KeyValue } from '@angular/common';
import { DataService } from '../services/data.service';
import { WinnerService } from '../services/winner.service'; // Import the service

@Component({
  selector: 'app-reports',
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})

export class ReportsComponent implements OnInit{
getNetTotalProfitLoss(): number {
  if (!this.groupedItems) return 0;
  // If groupedItems is an array, use it directly; if it's an object, use Object.values
  const groups = Array.isArray(this.groupedItems)
    ? this.groupedItems
    : Object.values(this.groupedItems);
  return groups
    .map(group => this.getProfitLossForGroup(group))
    .reduce((acc, val) => acc + val, 0);
}
showSummaryOnly: any;
trackClientKey!: TrackByFunction<KeyValue<string,any[]>>;
trackItemId: TrackByFunction<any> = () => 0;
  constructor(private itemService: DataService, private winnerService: WinnerService, private http: HttpClient) {}
  items: any[] = [];
  winners: any[] = [];

  ngOnInit() {
    // Initialization logic can go here if needed
    this.itemService.getItems().subscribe(data => {
      this.items = data; //loading list data 
    });
    this.winnerService.getWinners().subscribe(data1 => {
      this.winners = data1; // loading winners data
    });
  }

  get groupedItems() {
    const groups: { [nameClient: string]: any[] } = {};
    for (const item of this.items) {
      if (!item.nameClient) {
        console.warn('Item missing clientName:', item);
      }
      const key = item.nameClient || 'Unknown';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    }
    // Sort items within each group by nameClient (change to another property if needed)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => (a.nameClient || '').localeCompare(b.nameClient || ''));
    });
    return groups;
  }

  compareKeysAsc(a: any, b: any): number {
    return a.key.localeCompare(b.key);
  }

  getTaxAmountForGroup(items: any[]): number {
    return items.reduce((sum, item) => {
      if (item.cancel === 1) return sum;
      // Skip if horseNum is a special winner or rule4Num
      const winner = this.winners.find(w => w.raceNum === item.raceNum);
      const horseNum = Number(item.horseNum);
      if (
        winner &&
        (
          (Array.isArray(winner.specialNum) && winner.specialNum[horseNum - 1] === true) ||
          (Array.isArray(winner.rule4Num) && winner.rule4Num[horseNum - 1] === true)
        )
      ) {
        return sum;
      }
      let stake = Number(item.stake) || 0;
      if (item.betType === 2) {
        stake = -Math.abs(stake);
      }
      let tax = Number(item.tax) || 0;
      return sum + (stake * tax / 100);
    }, 0);
  }

  isWinner(item: any): boolean {
    // Find the winner entry with the same raceNum
    const winner = this.winners.find(w => w.raceNum === item.raceNum);
    if (!winner) return false;

    // Check winNum, specialNum, rule4Num arrays
    const horseNum = Number(item.horseNum);

    // Check winNum
    if (Array.isArray(winner.winNum) && winner.winNum[horseNum - 1] === true) {
      return true;
    }
/*    // Check specialNum
    if (Array.isArray(winner.specialNum) && winner.specialNum[horseNum - 1] === true) {
      return true;
    }
    // Check rule4Num
    if (Array.isArray(winner.rule4Num) && winner.rule4Num[horseNum - 1] === true) {
      return true;
    }*/
    return false;
  }

  isSpecial(item: any): boolean {
    const winner = this.winners.find(w => w.raceNum === item.raceNum);
    const horseNum = Number(item.horseNum);
    return !!(winner && Array.isArray(winner.specialNum) && winner.specialNum[horseNum - 1] === true);
  }

  isRule4(item: any): boolean {
    const winner = this.winners.find(w => w.raceNum === item.raceNum);
    const horseNum = Number(item.horseNum);
    return !!(winner && Array.isArray(winner.rule4Num) && winner.rule4Num[horseNum - 1] === true);
  }

  countWinNumTrue(item: any): number {
    const winner = this.winners.find(w => w.raceNum === item.raceNum);
    if (!winner || !Array.isArray(winner.winNum)) return 1;
    return winner.winNum.filter((v: boolean) => v === true).length || 1;
  }

  getDividedPayout(item: any): number {
    const count = this.countWinNumTrue(item);
    let payout = Number(item.payout) || 0;
 
    // Apply rule4 deduction if applicable
    const winner = this.winners.find(w => w.raceNum === item.raceNum);
    // Check if any value in winner.rule4Num is true
    if (
      winner &&
      Array.isArray(winner.rule4Num) &&
      winner.rule4Num.some((v: any) => v === true) &&
      typeof winner.rule4Deduction === 'number'
    ) {
      payout = payout * (100 - winner.rule4Deduction) / 100;
    }
    return payout / count;
  }

  getProfitLossForGroup(items: any[]): number {
    let totalStake = 0;
    let totalPayout = 0;
    for (const item of items) {
      if (item.cancel === 1) continue; // Skip cancelled items

      // Find winner info for this item's race
      const winner = this.winners.find(w => w.raceNum === item.raceNum);
      const horseNum = Number(item.horseNum);

      // Skip if this horse is a special or rule4 withdrawal
      if (
        winner &&
        (
          (Array.isArray(winner.specialNum) && winner.specialNum[horseNum - 1] === true) ||
          (Array.isArray(winner.rule4Num) && winner.rule4Num[horseNum - 1] === true)
        )
      ) {
        continue;
      }

      // Calculate stake (for betType 2, use positive value)
      let stake = Number(item.stake) || 0;
      if (item.betType === 2) {
        stake = -Math.abs(stake);
      }
      totalStake += stake;

      // Calculate payout only if the item is a winner
      if (this.isWinner(item)) {
        let payout = Number(item.payout) || 0;
        
        if (item.betType === 2) {
          payout = -Math.abs(payout); // Always positive
        }
        // Apply rule4 deduction if applicable
        if (
          winner &&
          Array.isArray(winner.rule4Num) &&
          winner.rule4Num.some((v: any) => v === true) &&
          typeof winner.rule4Deduction === 'number'
        ) {
          payout = payout * (100 - winner.rule4Deduction) / 100;
        }

        // Divide payout by number of winners
        const count = this.countWinNumTrue(item);
        totalPayout += payout / count;
      }
    }
    // Add tax to the profit/loss calculation
    const totalTax = this.getTaxAmountForGroup(items);
    return totalStake - totalPayout + totalTax;
  }

}



  // You can add methods to fetch and display reports as needed
  // For example, you might want to fetch winners or items and display them in the template

