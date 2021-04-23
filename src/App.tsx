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
  const [switchEnabled, setSwitchEnabled] = React.useState(false);
  let switchDiv: HTMLElement | null = null;

  React.useEffect(() => {
    // if error revert back to default not listening state
    chrome.runtime.onMessage.addListener((msg: MessageTypes) => {
      if (msg.message === "ERROR") {
        setIsListening(false);
      }
    });
    // set the stored value to state
    chrome.storage.local.get(["isListening"], (data) => {
      setIsListening(data.isListening);
    });
    // get the switch div
    switchDiv = document.getElementById("x");
    // get the current tab
    // https://gist.github.com/javiersantos/c3e9ae2adba72e898f99
    chrome.tabs.query(
      { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
      ([tab]) => {
        // allowing google meet sessions
        // disallowing the google meet home screen
        if (tab.url && tab.url.length > 35) {
          tab.url.slice(0, 24) === "https://meet.google.com/"
            ? setSwitchEnabled(true)
            : setSwitchEnabled(false);
        }
      }
    );
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
      {switchEnabled && (
        <div className="switch-main-container">
          <h1>{`Notifier ${isListening ? "enabled" : "disabled"}`}</h1>
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
      )}
      <div style={{ padding: "1rem", color: "white" }}>
        <h2>
          Notifier needs your chat
          <br />
          box to be open to work.
        </h2>
        <p style={{ paddingTop: "0.8rem", lineHeight: "1.4rem" }}>
          100% private chats. No network calls.
          <br />
          <a
            style={{ color: "blue" }}
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
