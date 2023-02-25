import fs from "fs-extra";
import path from "path";
import { diffSet } from "../utils";
import { translation } from "./translation";
import { en } from "../../package.json";

/**
 * 扫描目录
 * @param {String} root
 * @param {String} dist 默认目录 "src/raw/"
 */
export default async function index(root: string) {
  // 单词目录文件
  const list = path.join(root, en.list);
  // 单词数据目录
  const dir = path.join(root, en.dist.root, en.dist.dir);
  // 确保文件一定存在
  fs.ensureFileSync(list);
  // 读取单词目录文件中数据
  let listData: any = fs.readFileSync(list, "utf-8");
  // 单词目录文件数据判空和转换为数组对象
  if (listData&&listData.trim()) {
    listData = listData.replace(";", "").trim();
    try {
      listData = eval(`${listData}`);
    } catch (error) {
      console.log(error);
    }
  } else {
    listData = [];
  }
  const listDataArray = listData.map((item:typeof en.word.construction) => item.name);
 
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
    listDataArray,
    words.map((item) => item.replace(".json", ""))
  );

  if (diff.length) {
    for await (const iterator of diff) {
      const data = await translation(iterator);
      const _wordPath = path.join(
        root,
        en.dist.root,
        en.dist.dir,
        `${iterator}.${en.dist.extname}`
      );
      fs.ensureFileSync(_wordPath);
      fs.writeFileSync(_wordPath, JSON.stringify(data, null, 2), "utf-8");
    }
    const _list = path.join(root, en.dist.root, en.dist.list);
    fs.ensureFileSync(_list);
    fs.writeFileSync(_list, JSON.stringify(listData, null, 2));
  }else {
    console.log("没有新单词添加")
  }
  // 需要删除的单词数据的单词
  let diff2 = diffSet(
    words.map((item) => item.replace(`.${en.dist.extname}`, "")),
    listDataArray
  );
  // 删除不需要的单词数据的单词
  if (diff2.length) {
    for await (const iterator of diff2) {
      const _wordPath = path.join(
        root,
        en.dist.root,
        en.dist.dir,
        `${iterator}.${en.dist.extname}`
      );
      if (fs.existsSync(_wordPath)) {
        fs.unlinkSync(_wordPath);
      }
    }
  }else {
    console.log("没有单词被删除")
  }
}
