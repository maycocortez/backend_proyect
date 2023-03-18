import { fileURLToPath } from 'url'
import { dirname } from 'path'
import moment from "moment";
export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename) //IMPORTO TODO ESTO PARA USAR DIRNAME

export const dateShort = () => {
    let date = moment().format("HH:mm");
    return date;
  };