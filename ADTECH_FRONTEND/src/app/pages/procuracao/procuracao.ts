———————————————————————————

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgIf, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DueDiligence } from '../due-diligence/due-diligence';

@Component({
  selector: 'app-procuracao',
  standalone: true,
  imports: [NgIf, FormsModule, DatePipe, NgClass],
  templateUrl: './procuracao.html',
  styleUrls: ['./procuracao.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
  export class ProcuracaoComponent {
  step = 1;
  procGerada = false;
  DueDiligenceGerada = false;
  expandir = false;
  expandir2 = false;
  dataAtual = new Date();
  formData = {
    grantor: {name: '', cpf: '', rg: '', endereco: '', email: '',},
    grantee: {name: '', cpf: '', rg: '', endereco: '', email: '',},
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
      return !! (g.name && g.cpf && g.rg && g.endereco && g.email);
    }
      else if (this.step === 2) {
      const t = this.formData.grantee;
      return !! (t.name && t.cpf && t.rg && t.endereco && t.email);
    }
      else if (this.step === 3) {
      return true;
    }
      else if (this.step === 4) {
      return true;
    }
      else if (this.step === 5) {
      return true;
    }
    return false;
  }
  gerarProcuracao() {
    this.procGerada = true;
    this.nextStep();
  }

  gerarDueDiligence() {
    this.DueDiligenceGerada = true;
    this.nextStep();
  }

  baixarProcuracao() {
    const g = this.formData.grantor;
    const t = this.formData.grantee;
    const conteudo = `Eu, ${g.name}, portador do CPF ${g.cpf} e RG ${g.rg}, residente em ${g.endereco}, nomeio como meu procurador ${t.name},
    portador do CPF ${t.cpf} e RG ${t.rg}, residente em ${t.endereco}, para agir em meu nome conforme os termos estabelecidos nesta procuração.`;
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "procuração.txt";
    a.click();
  }

  voltarParaEdicao() {
    this.procGerada = false;
    this.DueDiligenceGerada = false;
    this.step = 1;
  }

  editarProcuracao() {
    this.DueDiligenceGerada = false;
    this.step = 2;
  }
}
