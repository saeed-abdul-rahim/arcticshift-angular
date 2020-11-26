export const toTitle = (title: string) => title.replace(/(^|\s)\S/g, t => t.toUpperCase());
export const joinByHyphen = (str: string) => str.split(' ').join('-');
