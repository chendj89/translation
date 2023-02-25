/**
 * 差集
 * 记A，B是两个集合，
 * 则所有属于A且不属于B的元素构成的集合，
 * 叫做集合A减集合B(或集合A与集合B之差)，
 * 类似地，对于集合A、B，
 * 把集合{x∣x∈A,且x∉B}叫做A与B的差集
 * A-B={x∣x∈A,且x∉B}
 * B-A={x∣x∈B,且x∉A}
 * @param arr1
 * @param arr2
 * @returns
 */
export function diffSet<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.concat(arr2).filter((e) => arr1.includes(e) && !arr2.includes(e));
}