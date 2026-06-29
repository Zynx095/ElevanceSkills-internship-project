import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import {
  translations
} from "./translations";

const LanguageContext =
  createContext();

export const LanguageProvider =
  ({ children }) => {

    const [language,
      setLanguage] =
      useState("English");

    useEffect(() => {

      const user =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "{}"
        );

      if (
        user.language
      ) {

        setLanguage(
          user.language
        );

      }

    }, []);

    const translate =
      (text) => {

        return (
          translations[
          language
          ]?.[text] ||
          text
        );

      };

    return (
      <LanguageContext.Provider
        value={{
          language,
          setLanguage,
          translate
        }}
      >
        {children}
      </LanguageContext.Provider>
    );

  };

export const useLanguage =
  () =>
    useContext(
      LanguageContext
    );