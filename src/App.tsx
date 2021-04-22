import * as React from "react";
import "./App.css";
import { MessageTypes } from "./types";

const App = () => {
  const [isListening, setIsListening] = React.useState(false);

  React.useEffect(() => {
    // const msg: MessageTypes = "GET_LISTEN";
    // chrome.runtime.sendMessage(msg, (res) => {
    //   setIsListening(res);
    // });
    chrome.storage.local.get(["isListening"], (data) => {
      setIsListening(data.isListening);
    });
  }, []);

  const toggleListening = () => {
    const msg: MessageTypes = isListening ? "STOP_LISTEN" : "START_LISTEN";
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
