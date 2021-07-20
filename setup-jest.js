import $ from "jquery";
import { localStorageMock } from "./src/__mocks__/localStorage";
global.$ = global.jQuery = $;

//Add Storage for employee

export function setSessionStorage(user) {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: user,
    })
  );
}
