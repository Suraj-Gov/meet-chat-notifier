import { MessageTypes } from "./types";

// when consecutive messages are received from the same sender, this value is used as the sender's name
// initially empty
let prevMessageSender: string = "";
// init messageWindow
let messageWindow: Node | null = null;

// sends a notification to the background script to create a notification
const createNotification = (
  name: string,
  message: string,
  timestamp: string
) => {
  // if sender is You, do not create notification
  if (message === undefined || name === "You") {
    prevMessageSender = "You";
    return;
  }
  // build the msg payload
  const msg: MessageTypes = {
    data: {
      name,
      message,
      timestamp,
    },
    message: "NOTIFY",
  };
  chrome.runtime.sendMessage(msg);
  // set the latest sender's name as prevMessageSender
  prevMessageSender = name;
};

// if the user stops listening
const stopMessageWindow = () => {
  // @ts-ignore
  messageWindow = null;
  observer.disconnect();
  chrome.storage.local.set({ isListening: false });
  console.log("stopped listening");
};

// creating observer
// if a new change is observed, it is pushed to the addedNodes stack
// from the new mutation, get the name, timestamp
// if name && timestamp then get the messageText and create notification
// else if it is a consecutive message, get the messageText and create notification as prevMessageSender and Date.now
// ts-ignores are used here because dataset type is not present in the doctypes, but are definitely present on the DOM
let observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "class") {
      stopMessageWindow();
    }
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
          createNotification(
            prevMessageSender,
            message,
            new Date().toLocaleTimeString().slice(0, -3)
          );
          // the timestamp is like xx:xx
        }
      }
      // if it is a first message kind of thing
      // observe the consecutive messages
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
  // this is the Xpath to capture the messageWindow
  messageWindow = getElementByXpath(
    "/html/body/div[1]/c-wiz/div[1]/div/div[9]/div[3]/div[4]/div/div[2]/div[2]/div[2]/span[2]/div/div[2]"
  );
  // if messageWindow is not found
  if (messageWindow === null) {
    alert(
      "Unable to capture the message window. Please keep the chat tab open and try again."
    );
    chrome.storage.local.set({ isListening: false });
    return;
  }
  // else start listening now
  console.log("listening now");
  if (messageWindow) {
    // @ts-ignore
    messageWindow.style.transition = "all 1s ease-in-out";
    // @ts-ignore
    messageWindow.style.backgroundColor = "rgb(238, 238, 238)";
    const id = setInterval(() => {
      if (messageWindow === null) {
        clearInterval(id);
        return;
      }
      // @ts-ignore
      if (messageWindow.style.backgroundColor === "rgb(238, 238, 238)") {
        // @ts-ignore
        messageWindow.style.backgroundColor = "rgb(255, 255, 255)";
      } else {
        // @ts-ignore
        messageWindow.style.backgroundColor = "rgb(238, 238, 238)";
      }
    }, 1000);
    // if the listener is activated after some existing messages
    // these observers are useful
    // observe the main messageDiv
    // @ts-ignore
    observer.observe(messageWindow.offsetParent, { attributes: true });
    observer.observe(messageWindow, { childList: true });
    // select the container that holds the messages
    messageWindow.childNodes.forEach((child) => {
      // observe the container's child nodes
      child.childNodes.forEach((childChild) => {
        observer.observe(childChild, { childList: true });
      });
    });
  }
};

// listen to messages
chrome.runtime.onMessage.addListener(
  (message: MessageTypes, _, sendResponse) => {
    switch (message.message) {
      case "CONTENT/START_LISTEN":
        getMessageWindow();
        break;
      case "CONTENT/STOP_LISTEN":
        stopMessageWindow();
        break;
    }
    // response is sent as true, because this is async
    sendResponse(true);
    // https://stackoverflow.com/questions/54126343/how-to-fix-unchecked-runtime-lasterror-the-message-port-closed-before-a-respon
  }
);
