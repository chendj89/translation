import { load } from "cheerio";
import http from "http";
export function translation(word: string) {
  return new Promise((resolve, reject) => {
    http.get(`http://dict.youdao.com/w/eng/${word}`, (res) => {
      let html = ``;
      res.on("data", (data) => {
        html += data.toString();
      });
      res.on("end", () => {
        let $ = load(html);
        let $pronounce = $(".wordbook-js .pronounce");
        // 发音方式
        let $lang = $pronounce.eq(1);
        // 英标
        let soundmark = $lang.find(".phonetic").html();
        // 中文意思
        let desc = $(".trans-container")
          .eq(0)
          .find("ul li")
          .map(function () {
            return $(this).html();
          })
          .get();
        resolve({
          name: word,
          soundmark: soundmark,
          src: `https://dict.youdao.com/dictvoice?audio=${word}&type=2`,
          desc: desc,
        });
      });
    });
  });
}
