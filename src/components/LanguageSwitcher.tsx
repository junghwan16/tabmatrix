import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`px-2 py-1 text-sm rounded ${
          i18n.language === "en"
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        onClick={() => changeLanguage("en")}
      >
        {t("language.en")}
      </button>
      <button
        className={`px-2 py-1 text-sm rounded ${
          i18n.language === "ko"
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        onClick={() => changeLanguage("ko")}
      >
        {t("language.ko")}
      </button>
    </div>
  );
}
