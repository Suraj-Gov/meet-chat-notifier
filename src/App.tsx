import * as React from "react";
import "./App.css";
import { MessageTypes } from "./types";
import styled from "styled-components";

const SwitchContainer = styled.div<{ isListening: boolean }>`
  background-color: ${({ isListening }) =>
    !isListening ? `#c4c4c4` : `#418bf8`};
`;

const SwitchCircle = styled.div<{ isListening: boolean }>`
  transform: ${({ isListening }) =>
    isListening ? `translateX(110%)` : `translateX(0%)`};
`;

const App = () => {
  const [isListening, setIsListening] = React.useState(false);
  let switchDiv: HTMLElement | null = null;

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
    switchDiv = document.getElementById("x");
  }, []);

  React.useEffect(() => {
    if (isListening) {
      switchDiv?.classList.add("on");
    } else {
      switchDiv?.classList.remove("on");
    }
  }, [isListening]);

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
        <SwitchContainer
          onClick={toggleListening}
          style={{ cursor: "pointer" }}
          className="switch-container"
          isListening={isListening}
          id="x"
        >
          <SwitchCircle
            isListening={isListening}
            className="switch-circle"
          ></SwitchCircle>
        </SwitchContainer>
      </div>
      <div style={{ padding: "1rem", color: "white" }}>
        <h2>
          Notifier needs your chat
          <br />
          box to be open to work.
        </h2>
        <p style={{ paddingTop: "0.8rem" }}>
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
    </div>
  );
};

export default App;
