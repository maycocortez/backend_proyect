import moment from "moment";

export const dateShort = () => {
  let date = moment().format("HH:mm");
  return date;
};