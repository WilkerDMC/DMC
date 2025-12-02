
import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-procuracao',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './procuracao.html',
  styleUrls: ['./procuracao.scss'],
})
export class ProcuracaoComponent {
  view: 'form' | 'preview' | 'due-diligence' = 'form';
  step = 1;
  formData = {
    grantor: { name: '', cpf: '', rg: '', address: '' },
    grantee: { name: '', cpf: '', rg: '', address: '' },
    powers: '',
    validity: ''
  };

  nextStep() {
    if (this.isStepValid() && this.step < 3) this.step++;
  }
  prevStep() {
    if (this.step > 1) this.step--;
  }
  isStepValid(): boolean {
    if (this.step === 1) {
      const g = this.formData.grantor;
      return !!(g.name && g.cpf && g.rg && g.address);
    }
    if (this.step === 2) {
      const g = this.formData.grantee;
      return !!(g.name && g.cpf && g.rg && g.address);
    }
    if (this.step === 3) {
      return !!(this.formData.powers && this.formData.validity);
    }
    return false;
  }
  onSubmit() {
    // Aqui você pode trocar para preview ou gerar a procuração
    // Exemplo: this.view = 'preview';
    alert('Procuração gerada!');
  }
}
