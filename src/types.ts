export type MessageTypes =
  | {
      message: "START_LISTEN" | "CONTENT/START_LISTEN";
      data: true;
    }
  | {
      message: "STOP_LISTEN" | "CONTENT/STOP_LISTEN";
      data: false;
    }
  | {
      message: "TOGGLE_LISTEN";
      data: undefined;
    }
  | {
      message: "GET_LISTEN";
      data: boolean;
    }
  | {
      message: "NOTIFY";
      data: {
        name: string;
        message: string;
        timestamp: string;
      };
    }
  | {
      message: "ERROR";
      data: false;
    }
  | {
      message: "DISABLE_LISTEN";
      data: false;
    }
  | {
      message: "ENABLE_LISTEN";
      data: true;
    };

export type WindowType = { messageWindow: Node };
