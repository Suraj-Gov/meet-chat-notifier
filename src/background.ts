import { MessageTypes } from "./types";

let isListening = false;

chrome.storage.local.get(["isListening"], (data) => {
  isListening = !!data.isListening;
});

const sendMessageToContentScript = (message: MessageTypes) => {
  // sending the message to the content_script
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab.id)
      chrome.tabs.sendMessage(tab.id, message, (res) => {
        if (!res) {
          chrome.runtime.sendMessage("ERROR");
          chrome.storage.local.set({ isListening: false });
        } else {
          chrome.storage.local.set({ isListening: true });
        }
      });
  });
};

interface notificationData {
  name: string;
  timestamp: string;
  message: string;
}

const sendNotification = (data: notificationData) => {
  let { message, name, timestamp } = data;
  if (message.length > 120) {
    message = message.slice(0, 120);
  }
  chrome.notifications.create(
    `${name}${message}`,
    {
      type: "basic",
      title: `${name} - ${timestamp}`,
      message: message,
      iconUrl: "/bell.svg",
    },
    (notificationId) => {
      console.log("notification pushed with id: ", notificationId);
    }
  );
};

chrome.runtime.onMessage.addListener(
  (message: MessageTypes, sender, sendResponse) => {
    switch (message.message) {
      case "START_LISTEN":
        isListening = true;
        chrome.storage.local.set({ isListening: true });
        sendMessageToContentScript({ data: true, message: "START_LISTEN" });
        console.log("listening now");
        sendResponse(true);
        break;
      case "STOP_LISTEN":
        isListening = false;
        chrome.storage.local.set({ isListening: false });
        sendMessageToContentScript({ data: false, message: "STOP_LISTEN" });
        console.log("stopped listening");
        sendResponse(false);
        break;
      case "GET_LISTEN":
        sendResponse(isListening);
        break;
      case "NOTIFY":
        sendNotification(message.data);
    }
  }
);
