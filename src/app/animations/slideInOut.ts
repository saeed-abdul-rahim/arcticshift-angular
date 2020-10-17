import { animate, style, transition, trigger } from '@angular/animations';

export const slideInOut = trigger('slideInOutAnimation', [
    transition(':enter', [
        style({
            transform: 'translateX(-5%)',
            opacity: 0
        }),
        animate('200ms ease-in', style({
            transform: 'translateX(0%)',
            opacity: 1
        }))
    ]),
    transition(':leave', [
        animate('200ms ease-in', style({
            transform: 'translateX(-5%)',
            opacity: 0
        }))
    ])
]);
