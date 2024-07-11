export const getPermutations = <T>(originalList: T[]): T[][] => {
  const { length } = originalList;
  const list: T[] = [...originalList];
  const result: T[][] = [list];
  const c: number[] = new Array(length).fill(0);
  let i: number = 0;
  let k: number;
  let p: T;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = list[i];
      list[i] = list[k];
      list[k] = p;
      ++c[i];
      i = 1;
      result.push([...list]);
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
};
