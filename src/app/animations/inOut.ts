import { trigger, transition, style, animate } from '@angular/animations';

export const inOut = trigger('inOutAnimation', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-out',
        style({ opacity: 1 }))
    ]),
    transition(':leave', [
        style({ opacity: 1 }),
        animate('0.2s ease-in',
        style({ opacity: 0 }))
    ])
]);

export const inOut5 = trigger('inOut5Animation', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-out',
        style({ opacity: 0.5 }))
    ]),
    transition(':leave', [
        style({ opacity: 0.5 }),
        animate('0.2s ease-in',
        style({ opacity: 0 }))
    ])
]);

export const inOutWidth = trigger('inOutWidthAnimation', [
    transition(':enter', [
        style({ opacity: 0, width: 0 }),
        animate('0.4s ease-out',
        style({ opacity: 1, width: '*' }))
    ]),
    transition(':leave', [
        style({ opacity: 1, width: '*' }),
        animate('0s ease-in',
        style({ opacity: 0, width: 0 }))
    ])
]);
