import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./translations/en.json";
import es from "./translations/es.json";
import sw from "./translations/sw.json";
import ru from "./translations/ru.json";
import uk from "./translations/uk.json";
import ar from "./translations/ar.json";

const detectionOptions = {
    order: ["path", "cookie", "navigator", "localStorage", "subdomain", "queryString", "htmlTag"],
    lookupFromPathIndex: 0,

};
const options = {
    interpolation: {
        formatSeparator: ",",
    },

    debug: false,

    resources: {
        es: {
            translations: es,
        },
        en: {
            translations: en,
        },
        sw: {
            translations: sw,
        },
        ru: {
            translations: ru,
        },
        uk: {
            translations: uk,
        },
        ar: {
            translations: ar,
        },
    },

    fallbackLng: "en",

    ns: ["translations"],

    defaultNS: "translations",

    detection: detectionOptions,

    whitelist: ["en", "es", "sw", "ru", "uk", "ar"],

    react: {
        wait: false,
        bindI18n: "languageChanged loaded",
        bindStore: "added removed",
        nsMode: "default",
    },
};

i18n
    .use(LanguageDetector)
    .init(options);

export default i18n;
