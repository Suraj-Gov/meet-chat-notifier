import { MessageTypes } from "./types";

let isListening = false;

chrome.storage.local.set({ isListening: false });

const sendMessageToContentScript = async (message: MessageTypes) => {
  await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const [tab] = tabs;
    if (tabs.length === 0) {
      const msg: MessageTypes = {
        data: false,
        message: "ERROR",
      };
      chrome.runtime.sendMessage(msg);
    } else if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, message, (res) => {
        console.log(res, "received data from cs");
      });
    }
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
        sendMessageToContentScript({
          data: true,
          message: "CONTENT/START_LISTEN",
        });
        sendResponse(true);
        break;
      case "STOP_LISTEN":
        isListening = false;
        chrome.storage.local.set({ isListening: false });
        sendMessageToContentScript({
          data: false,
          message: "CONTENT/STOP_LISTEN",
        });
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
