// Regra (puxa a API)
// Função e o end-point

import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';

 @Injectable({
    providedIn: "root",
})

export class RegisterService {
    private readonly API_URL = "http://127.0.0.1:8000/docs#/";
    // Registro cartório
    constructor(private http: HttpClient) { }
    registerOffice(userData: any): Observable<any> {
        return this.http.post<any>('${this.API_URL}auth/criar_conta_auth_criar_conta_post', userData);
    }

    // Registro advogado
    registerAttorney(userData: any): Observable<any> {
        return this.http.post<any>('${this.API_URL}auth/criar_conta_auth_criar_conta_post', userData);
    }

    // Registro do cliente
    registerCustomer(userData: any): Observable<any> {
        return this.http.post<any>('${this.API_URL}auth/criar_conta_cliente', userData);
    }
}
