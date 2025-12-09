import { createI18n } from "vue-i18n";
import { getBrowserLang } from "@/utils";

import zh from "./modules/zh";
import th from "./modules/th";

const i18n = createI18n({
  allowComposition: true,
  legacy: false,
  locale: getBrowserLang(),
  messages: {
    zh,
    th,
  },
});

export default i18n;
export const $t = i18n.global.t;
