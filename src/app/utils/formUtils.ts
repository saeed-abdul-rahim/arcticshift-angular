import { FormArray, FormGroup } from '@angular/forms';

export function getFormGroupArrayValues(formArray: FormArray) {
    const keys: any = {};
    formArray.controls.forEach((formGroup: FormGroup) => {
        const { controls } = formGroup;
        Object.keys(controls).forEach((key: string) => {
            Object.assign(keys, { [key]: controls[key].value });
        });
    });
    return keys;
}
