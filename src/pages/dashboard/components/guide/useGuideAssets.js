import { computed } from "vue";
import { useI18n } from "vue-i18n";

const imageModules = import.meta.glob(
  "/src/assets/images/guide/**/*.{png,jpg,jpeg,webp,svg}",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
);

const IMAGE_BASE_PATH = "/src/assets/images/guide";

const normalizeGuideLang = (locale) => {
  const lang = String(locale || "").toLowerCase();

  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("th")) return "th";
  return "zh";
};

const getGuideImage = (lang, fileName) => {
  const langPath = `${IMAGE_BASE_PATH}/${lang}/${fileName}`;
  const zhPath = `${IMAGE_BASE_PATH}/zh/${fileName}`;
  const oldPath = `${IMAGE_BASE_PATH}/${fileName}`;

  return (
    imageModules[langPath] ||
    imageModules[zhPath] ||
    imageModules[oldPath] ||
    ""
  );
};

export function useGuideAssets() {
  const { locale } = useI18n();

  const guideLang = computed(() => normalizeGuideLang(locale.value));

  const guideAssets = computed(() => ({
    guide: getGuideImage(guideLang.value, "guide.png"),

    step11: getGuideImage(guideLang.value, "step1-1.png"),
    step12: getGuideImage(guideLang.value, "step1-2.png"),
    step13: getGuideImage(guideLang.value, "step1-3.png"),
    step14: getGuideImage(guideLang.value, "step1-4.png"),

    step21: getGuideImage(guideLang.value, "step2-1.png"),
    step22: getGuideImage(guideLang.value, "step2-2.png"),
    step23: getGuideImage(guideLang.value, "step2-3.png"),

    step31: getGuideImage(guideLang.value, "step3-1.png"),
    step311: getGuideImage(guideLang.value, "step3-1-1.png"),
    step32: getGuideImage(guideLang.value, "step3-2.png"),
  }));

  return {
    guideLang,
    guideAssets,
  };
}
