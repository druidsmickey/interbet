import { Routes } from '@angular/router';
import { DataEntryComponent } from './data-entry/data-entry.component';
import { HomeComponent } from './home/home.component';
import { WinnerComponent } from './winner/winner.component';
import { ListdataComponent } from './listdata/listdata.component';  
import { ChartComponent } from './chart/chart.component'; // Import the ChartComponent
import { ParamsComponent } from './params/params.component'; // Import the ParamsComponent
import { ReportsComponent } from './reports/reports.component'; // Import the ReportsComponent

export const routes: Routes = [
    {
        path:'',
        component: HomeComponent,
    },
    {
        path:'home',
        component: HomeComponent,
    },
    {
        path:'dataentry',
        component: DataEntryComponent,
    }
    ,
    {
        path:'chart',
        component: ChartComponent,
    }
    ,
    {
        path:'listdata',
        component: ListdataComponent,
    }
    ,
    {
        path:'winner',
        component: WinnerComponent,
    },
    {
        path:'params',
        component: ParamsComponent,
    },
    {
        path:'reports',
        component: ReportsComponent,
    }                 
];
