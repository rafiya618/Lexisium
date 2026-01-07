import { createContext, useState, useCallback, useRef } from "react";

const defaultContextValue = {
  isKeyboardVisible: false,
  setIsKeyboardVisible: () => {},
  currentLanguage: "urdu",
  setCurrentLanguage: () => {},
  activeInputId: null,
  setActiveInputId: () => {},
  registerInput: () => {},
  unregisterInput: () => {},
  focusInput: () => {},
  insertText: () => {},
  backspace: () => {},
  toggleKeyboard: () => {},
  cycleLanguage: () => {},
};

export const KeyboardContext = createContext(defaultContextValue);

export function KeyboardProvider({ children }) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("urdu");
  const [activeInputId, setActiveInputId] = useState(null);
  const inputRefsRef = useRef({});
  const registeredInputsRef = useRef(new Set());

  const registerInput = useCallback((id, ref) => {
    inputRefsRef.current[id] = ref;
    registeredInputsRef.current.add(id);
  }, []);

  const unregisterInput = useCallback((id) => {
    delete inputRefsRef.current[id];
    registeredInputsRef.current.delete(id);
  }, []);

  const focusInput = useCallback((id) => {
    setActiveInputId(id);
    const input = inputRefsRef.current[id];
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const insertText = useCallback((text) => {
    if (!activeInputId) return;
    
    const input = inputRefsRef.current[activeInputId];
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = input.value || "";
    const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);

    // Update the DOM value using native setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(input, newValue);
    
    // Trigger input event (React listens to this)
    const inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);
    
    // Trigger change event
    const changeEvent = new Event("change", { bubbles: true });
    input.dispatchEvent(changeEvent);

    // Update cursor position
    const newPosition = start + text.length;
    setTimeout(() => {
      input.setSelectionRange(newPosition, newPosition);
      input.focus();
    }, 0);
  }, [activeInputId]);

  const backspace = useCallback(() => {
    if (!activeInputId) return;
    
    const input = inputRefsRef.current[activeInputId];
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentValue = input.value || "";

    let newValue;
    if (start !== end) {
      newValue = currentValue.slice(0, start) + currentValue.slice(end);
    } else {
      newValue = currentValue.slice(0, start - 1) + currentValue.slice(start);
    }

    // Update the DOM value using native setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(input, newValue);
    
    // Trigger input event (React listens to this)
    const inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);
    
    // Trigger change event
    const changeEvent = new Event("change", { bubbles: true });
    input.dispatchEvent(changeEvent);

    // Update cursor position
    const newPosition = Math.max(0, start - 1);
    setTimeout(() => {
      input.setSelectionRange(newPosition, newPosition);
      input.focus();
    }, 0);
  }, [activeInputId]);

  const toggleKeyboard = useCallback(() => {
    setIsKeyboardVisible((prev) => !prev);
  }, []);

  const cycleLanguage = useCallback(() => {
    setCurrentLanguage((prev) => {
      if (prev === "urdu") return "pashto";
      if (prev === "pashto") return "roman";
      return "urdu";
    });
  }, []);

  return (
    <KeyboardContext.Provider
      value={{
        isKeyboardVisible,
        setIsKeyboardVisible,
        currentLanguage,
        setCurrentLanguage,
        activeInputId,
        setActiveInputId,
        registerInput,
        unregisterInput,
        focusInput,
        insertText,
        backspace,
        toggleKeyboard,
        cycleLanguage,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}
