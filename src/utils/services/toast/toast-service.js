import { notifications } from "@mantine/notifications";

export const notifySuccess = (msg) => {
  notifications.show({
    message: msg,
    color: "green",
  });
};

export const notifyError = (msg) => {
  notifications.show({
    message: msg,
    color: "#ff454df2",
  });
};

export const notifyInfo = (msg) => {
  notifications.show({
    message: msg,
    color: "blue",
  });
};

// Warning Toast
export const notifyWarning = (msg) => {
  notifications.show({
    message: msg,
    color: "yellow",
  });
};