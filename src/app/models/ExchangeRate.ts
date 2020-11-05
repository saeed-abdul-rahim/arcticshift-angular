export type ExchangeRate = {
    success: boolean;
    base: string;
    date: string;
    rates: {
        [key: string]: number;
    }
};
