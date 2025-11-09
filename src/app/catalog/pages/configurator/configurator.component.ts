import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ShapeSelectorComponent } from '../../components/shape-selector/shape-selector.component';
import { MaterialSelectorComponent } from '../../components/material-selector/material-selector.component';
import { DimensionSelectorComponent } from '../../components/dimension-selector/dimension-selector.component';
import { PriceDisplayComponent } from '../../components/price-display/price-display.component';

@Component({
  selector: 'app-configurator',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    ShapeSelectorComponent, 
    MaterialSelectorComponent, 
    DimensionSelectorComponent, 
    PriceDisplayComponent
  ],
  templateUrl: './configurator.component.html',
  styleUrls: ['./configurator.component.css']
})
export class ConfiguratorComponent {
  // Logique pour gérer l'état de la configuration et les appels à l'API 'quotes/estimate'
}