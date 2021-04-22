import { MessageTypes } from "./types";

let isListening = false;

chrome.storage.local.get(["isListening"], (data) => {
  isListening = !!data.isListening;
});

const sendMessageToContentScript = (message: MessageTypes) => {
  // sending the message to the content_script
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab.id) chrome.tabs.sendMessage(tab.id, message);
  });
};

chrome.runtime.onMessage.addListener(
  (message: MessageTypes, sender, sendResponse) => {
    switch (message) {
      case "START_LISTEN":
        isListening = true;
        chrome.storage.local.set({ isListening: true });
        sendMessageToContentScript("START_LISTEN");
        console.log("listening now");
        sendResponse(true);
        break;
      case "STOP_LISTEN":
        isListening = false;
        chrome.storage.local.set({ isListening: false });
        sendMessageToContentScript("STOP_LISTEN");
        console.log("stopped listening");
        sendResponse(false);
        break;
      case "GET_LISTEN":
        sendResponse(isListening);
        break;
    }
  }
);
