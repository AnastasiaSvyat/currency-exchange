import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CalculateCurrency } from '../model/calculateCurrency';

@Injectable({
  providedIn: 'root'
})
export class CurrencyExchangeService {

  private endpoint = `https://api.fastforex.io/`;


  constructor(
    private httpClient: HttpClient,
  ) { }

  getSelectRate(calculateCurrency: CalculateCurrency): Observable<any> {
    const url = `${this.endpoint}convert?from=${calculateCurrency.from}&to=${calculateCurrency.to}&amount=${calculateCurrency.amount}&api_key=2f0b844d9d-6fd45b7678-rqwryv`
    return this.httpClient.get<any>(url)
      .pipe(
        catchError(error => EMPTY)
      )
  }

  getAllCurrency() {
    const url = `${this.endpoint}fetch-all?from=UAH&api_key=2f0b844d9d-6fd45b7678-rqwryv`
    return this.httpClient.get<any[]>(url)
      .pipe(
        catchError(error => {
          console.log('error: ', error);
          return of(error);
        })
      );
  }

  getCurrencyRate(currency: string) {
    const url = `${this.endpoint}fetch-one?from=${currency}&to=UAH&api_key=2f0b844d9d-6fd45b7678-rqwryv`
    return this.httpClient.get<any[]>(url)
      .pipe(
        catchError(error => {
          console.log('error: ', error);
          return of(error);
        })
      );
  }

}
