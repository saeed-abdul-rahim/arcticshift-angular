export function removeDuplicatesArrObj(objArr: any[], prop: string) {
    return objArr.filter((v, i, a) => a.findIndex(t => (t[prop] === v[prop])) === i);
}

export function uniqueArr(data: string[]): string[] {
    return [...new Set([...data])];
}
