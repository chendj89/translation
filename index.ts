import path from "path";
import { scan } from "./src/utils";
const root = path.join(__dirname);
import { raw } from "./package.json";

scan(root, raw);
