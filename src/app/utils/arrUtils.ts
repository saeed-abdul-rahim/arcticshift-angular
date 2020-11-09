export const isBothArrEqual = (a: any[], b: any[]) => a.length === b.length && a.every((el, ix) => el === b[ix]);

export function removeDuplicatesArrObj(objArr: any[], prop: string) {
    return objArr.filter((v, i, a) => a.findIndex(t => (t[prop] === v[prop])) === i);
}

export function uniqueArr(data: string[]): string[] {
    return [...new Set([...data])];
}

export function patchArrObj(newArrObj: any[], origArrObj: any[], property: string) {
    newArrObj.forEach(d => {
      if (origArrObj.some(ed => ed[property] === d[property])) {
        const idx = origArrObj.findIndex(ed => ed[property] === d[property]);
        origArrObj[idx] = d;
      } else {
        origArrObj.push(d);
      }
    });
    return origArrObj;
}

export function leftJoinArrObj(leftArr: any[], rightArr: any[], key1: string, key2: string) {
  return leftArr.map(
    leftObj => ({
        ...rightArr.find(
            rightObj => leftObj[key1] === rightObj[key2]
        ),
        ...leftObj
    })
  );
}
