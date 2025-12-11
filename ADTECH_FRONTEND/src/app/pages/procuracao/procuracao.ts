import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-procuracao',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './procuracao.html',
  styleUrls: ['./procuracao.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProcuracaoDigital {
  view: 'form' | 'preview' | 'due-diligence' = 'form';
  step = 1;
  procGerada = false;
  expandir = false;
  expandir2 = false;
  dataAtual = new Date();

  formData = {
    grantor: { name: '', cpf: '', rg: '', endereco: '', email: '' },
    grantee: { name: '', cpf: '', rg: '', endereco: '', email: '' },
    powers: '',
    validity: ''
  };

  nextStep() {
    if (this.isStepValid() && this.step < 5) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  isStepValid(): boolean {
    if (this.step === 1) {
      const g = this.formData.grantor;
      return !!(g.name && g.cpf && g.rg && g.endereco && g.email);
    }
    if (this.step === 2) {
      const g = this.formData.grantee;
      return !!(g.name && g.cpf && g.rg && g.endereco && g.email);
    }
    if (this.step === 3) {
      return true; // Apenas conferência, sempre válido
    }
    return false;
  }

  gerarProcuracao() {
    if (this.step === 2) {
      this.step = 3;
    } else if (this.step === 3) {
      this.step = 4;
      this.procGerada = true;
    } else if (this.step === 4) {
      this.step = 5;
    }
  }

  baixarProcuracao() {
    alert('Funcionalidade de download será implementada em breve!');
    console.log('Baixando procuração...', this.formData);
  }

  baixarDueDiligence() {
    alert('Funcionalidade de download de Due Diligence será implementada em breve!');
    console.log('Baixando Due Diligence...', this.formData);
  }

  onSubmit() {
    // Aqui você pode trocar para preview ou gerar a procuração
    // Exemplo: this.view = 'preview';
    alert('Procuração gerada!');
  }
}
