import { MessageTypes } from "./types";

let prevMessageSender: string = "";
// init messageWindow
let messageWindow: Node | null = null;

const createNotification = (
  name: string,
  message: string,
  timestamp: string
) => {
  // TODO: do not show notification if name is 'You'
  if (message === undefined) {
    return;
  }
  // chrome.notifications.create(name + message, {
  //   title: name,
  //   message: message,
  // });
  console.log({ name, message, timestamp });
  prevMessageSender = name;
};

let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      // @ts-ignore
      const name = mutation.addedNodes[0].dataset.senderName;
      // @ts-ignore
      const timestamp = mutation.addedNodes[0].dataset.formattedTimestamp;
      if (name && timestamp) {
        const message =
          // @ts-ignore
          mutation.addedNodes[0].childNodes[1].childNodes[0].dataset
            .messageText;
        createNotification(name, message, timestamp);
      } else {
        // @ts-ignore
        if (mutation.addedNodes[0].classList.length === 1) {
          // @ts-ignore
          const message = mutation.addedNodes[0].dataset.messageText;
          createNotification(prevMessageSender, message, "now");
        }
      }
      if (mutation.addedNodes[0].childNodes[1]) {
        observer.observe(mutation.addedNodes[0].childNodes[1], {
          childList: true,
        });
      }
    }
  });
});

// getting the messageWindow from the DOM
const getMessageWindow = () => {
  // prettier-ignore
  function getElementByXpath(path:string) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }
  // https://stackoverflow.com/questions/10596417/is-there-a-way-to-get-element-by-xpath-using-javascript-in-selenium-webdriver
  const messageWindow = getElementByXpath(
    "/html/body/div[1]/c-wiz/div[1]/div/div[9]/div[3]/div[4]/div/div[2]/div[2]/div[2]/span[2]/div/div[2]"
  );
  if (messageWindow) observer.observe(messageWindow, { childList: true });
  console.log(messageWindow, "got message window");
};

const stopMessageWindow = () => {
  messageWindow = null;
};

chrome.runtime.onMessage.addListener(
  (message: MessageTypes, sender, sendResponse) => {
    switch (message) {
      case "START_LISTEN":
        getMessageWindow();
        break;
      case "STOP_LISTEN":
        stopMessageWindow();
    }
    return true;
  }
);

// getting the messageWindow on load
getMessageWindow();
if (messageWindow === null) {
  chrome.storage.local.set({ isListening: false });
}
