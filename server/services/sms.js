import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const BASE_URL =
    process.env.TEXTBEE_BASE_URL;

const API_KEY =
    process.env.TEXTBEE_API_KEY;

const DEVICE_ID =
    process.env.TEXTBEE_DEVICE_ID;
console.log("BASE_URL:", BASE_URL);
console.log("API_KEY:", API_KEY);
console.log("DEVICE_ID:", DEVICE_ID);
export const sendSMS = async (

    phoneNumber,

    message

) => {

    try {

        const response =
            await axios.post(

                `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,

                {

                    recipients: [phoneNumber],

                    message

                },

                {

                    headers: {

                        "x-api-key": API_KEY

                    }

                }

            );

        console.log("TEXTBEE RESPONSE");

        console.dir(response.data, {
            depth: null
        });

        return response.data;

    }

    catch (error) {

        console.log(

            "TextBee Error:",

            error.response?.data ||

            error.message

        );

        throw error;

    }

};