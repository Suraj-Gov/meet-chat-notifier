import * as React from "react";
import "./App.css";
import { MessageTypes } from "./types";

const App = () => {
  const [isListening, setIsListening] = React.useState(false);

  React.useEffect(() => {
    // if error revert back to default not listening state
    chrome.runtime.onMessage.addListener((msg: string) => {
      if (msg === "ERROR") {
        setIsListening(false);
      }
    });
    // set the stored value to state
    chrome.storage.local.get(["isListening"], (data) => {
      setIsListening(data.isListening);
    });
    // get the switch div
    const switchDiv = document.getElementById("x");
    switchDiv?.addEventListener("click", () => {
      switchDiv.classList.toggle("on", isListening);
    });
    return () => switchDiv?.removeEventListener("click", () => {});
  }, []);

  const toggleListening = () => {
    const msg: MessageTypes = isListening
      ? { data: false, message: "STOP_LISTEN" }
      : { data: true, message: "START_LISTEN" };
    chrome.runtime.sendMessage(msg, (res) => {
      setIsListening(res);
    });
  };

  return (
    <div className="App">
      <div className="switch-main-container">
        <h1>Notifier {isListening ? "enabled" : "disabled"}</h1>
        <div
          onClick={toggleListening}
          style={{ cursor: "pointer" }}
          className="switch-container"
          id="x"
        >
          <div className="switch-circle"></div>
        </div>
      </div>
      <h2>
        Notifier needs your chat box
        <br />
        to be open to work.
      </h2>
      <p>
        100% private chats. No network calls.
        <br />
        <a
          href="https://www.github.com/Suraj-Gov/meet-chat-notifier"
          target="_blank"
        >
          Source code on GitHub
        </a>
      </p>
    </div>
  );
};

export default App;
