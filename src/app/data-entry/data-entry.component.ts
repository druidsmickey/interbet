import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-data-entry',
  imports: [FormsModule, CommonModule],
  templateUrl: './data-entry.component.html',
  styleUrls: ['./data-entry.component.css']
})
export class DataEntryComponent implements OnInit {
  numRaces: number = 9;
  numHorses: number = 11;
  items: any[] = [];
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

  constructor(private itemService: DataService) {}
  
  ngOnInit() {
    this.itemService.getItems().subscribe(data => {
      this.items = data;
    });
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
  }
}
