import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WinnerService } from '../services/winner.service'; // Import the service

@Component({
  selector: 'app-winner',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './winner.component.html',
  styleUrl: './winner.component.css'
})
export class WinnerComponent implements OnInit {
  winnerForm: FormGroup;
  errorMessage: string = '';
  winners: any[] = []; // Store loaded winners
  showRule4Chkboxes: any;
  showSpecialChkboxes: any;
  items: any[] = [];
  numRaces: number = 8;
  numHorses: number = 11;
  rule4Deduction: number = 0; 

  constructor(private fb: FormBuilder, private winnerService: WinnerService) {

    this.winnerForm = this.fb.group({
      raceRadio: [null],
      winnerChkboxes: this.fb.array(Array(this.numHorses).fill(false)), // Use numHorses for array size
      specialChkboxes: this.fb.array(Array(this.numHorses).fill(false)), // Use numHorses for array size
      rule4Chkboxes: this.fb.array(Array(this.numHorses).fill(false)), // Use numHorses for array size
      rule4Deduction: 0,
    });
  }


  ngOnInit() {
    this.loadWinners(); // Load winners when the page is loaded

  }

  get winnerChkboxes(): FormArray {
    return this.winnerForm.get('winnerChkboxes') as FormArray;
  }

  get specialChkboxes(): FormArray {
    return this.winnerForm.get('specialChkboxes') as FormArray;
  }

  get rule4Chkboxes(): FormArray {
    return this.winnerForm.get('rule4Chkboxes') as FormArray;
  }

  get raceRadio() {
    return this.winnerForm.get('raceRadio');
  }

  get rule4DeductionControl() {
    return this.winnerForm.get('rule4Deduction');
  }

  saveWinner() {
    let rule4DeductionValue = this.rule4DeductionControl?.value;
    if (rule4DeductionValue === '' || rule4DeductionValue === null || isNaN(rule4DeductionValue)) {
      rule4DeductionValue = 0;
    }

    const formData = {
      raceNum: this.raceRadio ? this.raceRadio.value : null,
      winNum: this.winnerChkboxes.value,
      specialNum: this.specialChkboxes.value,
      rule4Num: this.rule4Chkboxes.value,
      rule4Deduction: Number(rule4DeductionValue)
    };

    this.winnerService.saveWinner(formData).subscribe({
      next: () => {
        this.winnerChkboxes.controls.forEach(control => control.setValue(false)); // Clear all
        this.specialChkboxes.controls.forEach(control => control.setValue(false)); // Clear all early check
        this.rule4Chkboxes.controls.forEach(control => control.setValue(false)); // Clear all rule4 check
        this.showRule4Chkboxes = false; // Reset rule4 checkboxes visibility
        this.showSpecialChkboxes = false; // Reset special checkboxes visibility
        this.winnerForm.get('rule4Deduction')?.setValue(0); // <-- Reset FormControl value
        if (this.raceRadio) {
          this.raceRadio.setValue(null); // Clear raceNum selection
        }
        this.loadWinners(); // Reload winners after saving
      },
      error: (err) => {
        console.error('Error saving winner:', err);
        this.errorMessage = 'Failed to save winner.';
      }
    });
  }

  loadWinners() {
    this.winnerService.getWinners().subscribe({
      next: (data) => {
        this.winners = data;
      },
      error: (err) => {
        console.error('Error loading winners:', err);
        this.errorMessage = 'Failed to load winners.';
      }
    });
  }

  updateCheckboxes() {
    const selectedRaceNum = this.raceRadio ? this.raceRadio.value : null;
    this.winnerChkboxes.controls.forEach(control => control.setValue(false)); // Clear all
    this.specialChkboxes.controls.forEach(control => control.setValue(false)); // Clear all early check
    this.rule4Chkboxes.controls.forEach(control => control.setValue(false)); // Clear all rule4 check
    this.showRule4Chkboxes = false; // Reset rule4 checkboxes visibility
    this.showSpecialChkboxes = false; // Reset special checkboxes visibility
    this.rule4Deduction = 0; // Reset rule4 deduction percentage
    this.winnerForm.get('rule4Deduction')?.setValue(null); // Also reset form control

    if (selectedRaceNum !== null) {
      const raceData = this.winners.find(winner => winner.raceNum === selectedRaceNum);
      if (raceData) {
        // Set winnerChkboxes if winNum exists and is an array
        if (Array.isArray(raceData.winNum)) {
          this.winnerChkboxes.controls.forEach((control, index) => {
            control.setValue(!!raceData.winNum[index]);
          });
        }
        // Set specialChkboxes if specialNum exists and is an array
        if (Array.isArray(raceData.specialNum)) {
          this.specialChkboxes.controls.forEach((control, index) => {
            control.setValue(!!raceData.specialNum[index]);
          });
          this.showSpecialChkboxes = raceData.specialNum.some((v: any) => !!v);
        }
        // Set rule4Chkboxes if rule4Num exists and is an array
        if (Array.isArray(raceData.rule4Num)) {
          this.rule4Chkboxes.controls.forEach((control, index) => {
            control.setValue(!!raceData.rule4Num[index]);
          });
          this.showRule4Chkboxes = raceData.rule4Num.some((v: any) => !!v);
          this.winnerForm.get('rule4Deduction')?.setValue(raceData.rule4Deduction || null); // <-- Update form control value
        }
      }
    }
  }

  onRaceNumChange() {
    this.updateCheckboxes(); // Update checkboxes based on raceNum
  }

  onShowRule4ChkboxesChange() {
    if (!this.showRule4Chkboxes) {
      this.winnerForm.get('rule4Deduction')?.setValue(null);
    }
  }
}
