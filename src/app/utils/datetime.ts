type Time = {
    hour: number,
    minute: number,
    second: number
};

export function getTimeObjFromStr(timeStr: string): Time {
    try {
        const arrTime = timeStr.split(':').map(Number);
        const datetime: Time = {
            hour: 0,
            minute: 0,
            second: 0
        };
        arrTime.forEach((t, i) => {
            switch (i) {
                case 0: datetime.hour = t;
                        break;
                case 1: datetime.minute = t;
                        break;
                case 2: datetime.second = t;
                        break;
            }
        });
        return datetime;
    } catch (e) {
        throw e;
    }
}

export function dateToHrMin(datetime: Date) {
    try {
        const timeStr = datetime.toTimeString().split(' ')[0];
        const timeStrArr = timeStr.split(':');
        timeStrArr.pop();
        return timeStrArr.join(':');
    } catch (_) {
        return '00:00';
    }
}

export function dateToUTC(date: Date) {
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
    );
}
