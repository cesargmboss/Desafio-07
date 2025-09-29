import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Veiculo } from '../models/veiculo.model';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CarroVin } from '../utils/carroVinInterface';
import {  Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: 'app-dashboard',
  imports: [ReactiveFormsModule, CommonModule, MenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  vehicles: Veiculo[] = [];
  selectedVehicle!: Veiculo;
  carVin!: CarroVin;
  reqVin!: Subscription;

  private vehicleVinMap: { [key: number]: string } = {
    1: "2FRHDUYS2Y63NHD22454",
    2: "2RFAASDY54E4HDU34874",
    3: "2FRHDUYS2Y63NHD22455",
    4: "2RFAASDY54E4HDU34875",
  };

  selectCarForms = new FormGroup({
    carId: new FormControl(''),
  });

  vinForm = new FormGroup({
    vin: new FormControl(''),
  });

  loadVinDataOnInput() {
    this.vinForm.controls.vin.valueChanges.subscribe((value) => {
      if (this.reqVin) {
        this.reqVin.unsubscribe();
      }
     
      const vinValue = value as string;

      if (vinValue) {
        this.reqVin = this.dashboardservice
          .buscarVin(vinValue)
          .subscribe((res) => {
            this.carVin = res;
          }, (error) => {
              this.carVin = undefined as any;
          });
      } else {
        this.carVin = undefined as any;
      }
    });
  }

  constructor(private dashboardservice: DashboardService) { }

  ngOnInit(): void {
    this.dashboardservice.getVehicles().subscribe((res) => {
      this.vehicles = res.vehicles;

      if (this.vehicles.length > 0) {
        const defaultId = String(this.vehicles[0].id);
        this.selectCarForms.controls.carId.setValue(defaultId, { emitEvent: true });
      }
    });
   
    this.selectCarForms.controls.carId.valueChanges.subscribe((id) => {
      const selectedId = Number(id);
     
      this.selectedVehicle = this.vehicles.find(v => Number(v.id) === selectedId) as Veiculo;
     
      const defaultVin = this.vehicleVinMap[selectedId];

      if (defaultVin) {
        this.vinForm.controls.vin.setValue(defaultVin, { emitEvent: false });
        if (this.reqVin) {
          this.reqVin.unsubscribe();
        }
       
        this.reqVin = this.dashboardservice
          .buscarVin(defaultVin)
          .subscribe((res) => {
            this.carVin = res;
          });
      } else {
          this.vinForm.controls.vin.setValue('', { emitEvent: false });
          this.carVin = undefined as any;
      }
    });
   
    this.loadVinDataOnInput();
  }

  ngOnDestroy(): void {
    if (this.reqVin) {
      this.reqVin.unsubscribe();
    }
  }
}