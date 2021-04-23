import { MessageTypes } from "./types";

let isListening = false;

chrome.storage.local.set({ isListening: false });

// uses tabs query to send the correct tab's cscript
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
    `${name}${message}${Math.random().toFixed(4)}`,
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
  (message: MessageTypes, _, sendResponse) => {
    switch (message.message) {
      // user input to start listening
      case "START_LISTEN":
        isListening = true;
        chrome.storage.local.set({ isListening: true });
        sendMessageToContentScript({
          data: true,
          message: "CONTENT/START_LISTEN",
        });
        sendResponse(true);
        break;
      // user input to stop listening
      case "STOP_LISTEN":
        isListening = false;
        chrome.storage.local.set({ isListening: false });
        sendMessageToContentScript({
          data: false,
          message: "CONTENT/STOP_LISTEN",
        });
        sendResponse(false);
        break;
      // get listening status
      case "GET_LISTEN":
        sendResponse(isListening);
        break;
      // message passing to notify the user
      case "NOTIFY":
        sendNotification(message.data);
    }
  }
);
