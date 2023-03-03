import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';
import { CalculateCurrency } from 'src/app/model/calculateCurrency';
import { CurrencyExchangeService } from 'src/app/services/currency-exchange.service';

@Component({
  selector: 'app-currency-exchange',
  templateUrl: './currency-exchange.component.html',
  styleUrls: ['./currency-exchange.component.css']
})
export class CurrencyExchangeComponent implements OnInit {

  rateUSD!: number;
  rateEUR!: number;

  currencyForm!: FormGroup;
  currenciesList: string[] = [];

  @ViewChild('actionLeftInput') actionLeftInput!: ElementRef;
  @ViewChild('actionRightInput') actionRightInput!: ElementRef;

  fromCalculateCurrency!: string;
  toCalculateCurrency!: string;

  constructor(
    private currencyExchangeService: CurrencyExchangeService
  ) { }

  ngOnInit(): void {

    this.currencyForm = new FormGroup({
      leftSelect: new FormControl('USD'),
      leftInput: new FormControl(1),
      rightSelect: new FormControl('UAH'),
      rightInput: new FormControl(1),
    });

    this.getEUR();
    this.getUSD();
    this.getAllCurrency();
    this.calculateRate({
      from: this.currencyForm.value.leftSelect,
      to: this.currencyForm.value.rightSelect,
      amount: 1
    });
  }

  get leftSelect() { return this.currencyForm.get('leftSelect'); }
  get leftInput() { return this.currencyForm.get('leftInput'); }
  get rightSelect() { return this.currencyForm.get('rightSelect'); }
  get rightInput() { return this.currencyForm.get('rightInput'); }

  calculateRate(calculateCurrency: CalculateCurrency) {
    this.currencyExchangeService
      .getSelectRate(
        {
          from: calculateCurrency.from,
          to: calculateCurrency.to,
          amount: calculateCurrency.amount
        })
      .subscribe((res) => {
        this.rightInput?.setValue(res.result[this.currencyForm.value.rightSelect])
      })
  }

  anotherMethod(event: any, value: string, select: string) {
    if (event.isUserInput) {
      if (select == 'rightSelect') {
        this.fromCalculateCurrency = this.currencyForm.value.leftSelect
        this.toCalculateCurrency = value
      } else {
        this.fromCalculateCurrency = value
        this.toCalculateCurrency = this.currencyForm.value.rightSelect
      }

      this.calculateRate({
        from: this.fromCalculateCurrency,
        to: this.toCalculateCurrency,
        amount: this.currencyForm.value.leftInput
      })
    }

  }

  ngAfterViewInit() {

    let rightInputStream$ = fromEvent(this.actionRightInput.nativeElement, 'input')
      .pipe(
        map((e: any) => e.target.value),
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => this.leftInput?.setValue('')),
        filter(e => e.trim()),
        switchMap((amount: any) =>
          this.currencyExchangeService.getSelectRate({
            from: this.currencyForm.value.rightSelect,
            to: this.currencyForm.value.leftSelect,
            amount: amount
          })
        )
      )
      .subscribe((res) => {
        this.leftInput?.setValue(res.result[this.currencyForm.value.leftSelect])
      });


    let leftInputStream$ = fromEvent(this.actionLeftInput.nativeElement, 'input')
      .pipe(
        map((e: any) => e.target.value),
        debounceTime(1000),
        distinctUntilChanged(),
        tap(() => this.rightInput?.setValue('')),
        filter(e => e.trim()),
        switchMap((amount: number) =>
          this.currencyExchangeService.getSelectRate({
            from: this.currencyForm.value.leftSelect,
            to: this.currencyForm.value.rightSelect,
            amount: amount
          })
        )
      )
      .subscribe((res) => {
        this.rightInput?.setValue(res.result[this.currencyForm.value.rightSelect])
      });
  }

  getAllCurrency() {
    this.currencyExchangeService.getAllCurrency()
      .subscribe((res) => {
        this.currenciesList = Object.keys(res.results)
      })
  }

  getUSD() {
    this.currencyExchangeService.getCurrencyRate('USD')
      .subscribe((res) => {
        this.rateUSD = res.result.UAH.toFixed(2);;
      })
  }

  getEUR() {
    this.currencyExchangeService.getCurrencyRate('EUR')
      .subscribe((res) => {
        this.rateEUR = res.result.UAH.toFixed(2);
      })
  }

}
