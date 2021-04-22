import * as React from "react";
import "./App.css";
import { MessageTypes } from "./types";

const App = () => {
  const [isListening, setIsListening] = React.useState(false);

  React.useEffect(() => {
    chrome.runtime.onMessage.addListener((msg: string) => {
      if (msg === "ERROR") {
        setIsListening(false);
      }
    });
    chrome.storage.local.get(["isListening"], (data) => {
      setIsListening(data.isListening);
    });
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
      <header className="App-header">
        {isListening ? "Is Listening" : "Not Listening"}
        <button onClick={toggleListening}>
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>
      </header>
    </div>
  );
};

export default App;
