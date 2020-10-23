import { Component, EventEmitter, forwardRef, Input, OnChanges, Output } from '@angular/core';
import { FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';


export function createCounterRangeValidator(maxValue: number, minValue: number) {
  return (c: FormControl) => {
    const err = {
      rangeError: {
        given: c.value,
        max: maxValue || 10,
        min: minValue || 0
      }
    };

    return (c.value > +maxValue || c.value < +minValue) ? err : null;
  };
}

@Component({
  selector: 'app-counter-input',
  templateUrl: './counter-input.component.html',
  styleUrls: ['./counter-input.component.css'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CounterInputComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => CounterInputComponent), multi: true }
  ]
})
export class CounterInputComponent implements ControlValueAccessor, OnChanges {

  @Input() label: string;
  @Input() value = 0;
  @Input() valueMax: number;
  @Input() valueMin: number;
  @Output() valueChange = new EventEmitter<number>();

  propagateChange: any = () => { };
  validateFn: any = () => { };


  get counterValue() {
    return this.value;
  }

  set counterValue(val) {
    if (this.valueMin && val < this.valueMin) {
      this.value = this.valueMin;
    } else if (this.valueMax && val > this.valueMax) {
      this.value = this.valueMax;
    } else {
      this.value = val;
    }
    this.valueChange.emit(this.value);
    this.propagateChange(this.value);
  }

  ngOnChanges(inputs) {
    if (inputs.valueMax || inputs.valueMin) {
      this.validateFn = createCounterRangeValidator(this.valueMax, this.valueMin);
    }
  }

  writeValue(value) {
    if (value) {
      this.counterValue = value;
    }
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() { }

  increase() {
    this.counterValue++;
  }

  decrease() {
    this.counterValue--;
  }

  validate(c: FormControl) {
    return this.validateFn(c);
  }
}
