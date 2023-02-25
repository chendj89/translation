import fs from "fs-extra";
import path from "path";
import { translation } from "./translation";
import { word } from "../../package.json";
const catalogPath = word;
const wordPath = "json";

/**
 * 扫描目录
 * @param {String} root
 * @param {String} dist 默认目录 "src/raw/"
 */
export async function scan(root: string, dist: string = "src/raw/") {
  // 单词目录文件
  const file = path.join(root, dist, catalogPath);
  // 单词数据目录
  const dir = path.join(root, dist, wordPath);
  // 确保文件一定存在
  fs.ensureFileSync(file);
  fs.ensureFileSync(path.join(root, dist, wordPath, "1.json"));
  fs.ensureFileSync(path.join(root, dist, wordPath, "2.json"));
  // 读取单词目录文件中数据
  let list: any = fs.readFileSync(file, "utf-8");
  // 单词目录文件数据判空和转换为数组对象
  if (list) {
    list = JSON.parse(list);
  } else {
    list = ["hello"];
  }
  // 确保单词数据目录存在
  fs.ensureDirSync(dir);
  // 读取所有单词数据文件路径 没有则是空数组
  const words = fs.readdirSync(dir);
  // 如果单词目录为空 那么放弃当前扫描任务
  if (list.length == 0) {
    return;
  }
  // 找出没有单词数据的单词
  let diff = diffSet(
    list,
    words.map((item) => item.replace(".json", ""))
  );

  if (diff.length) {
    for await (const iterator of diff) {
      const data = await translation(iterator);
      const _wordPath = path.join(root, dist, wordPath, `${iterator}.json`);
      fs.ensureFileSync(_wordPath);
      fs.writeFileSync(_wordPath, JSON.stringify(data, null, 2), "utf-8");
    }
  }
  // 需要删除的单词数据的单词
  let diff2 = diffSet(
    words.map((item) => item.replace(".json", "")),
    list
  );
  // 删除不需要的单词数据的单词
  if (diff2.length) {
    for await (const iterator of diff2) {
      const _wordPath = path.join(root, dist, wordPath, `${iterator}.json`);
      if (fs.existsSync(_wordPath)) {
        fs.unlinkSync(_wordPath);
      }
    }
  }
}

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
