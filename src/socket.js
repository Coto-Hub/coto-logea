import { reactive } from "vue";
import io from 'socket.io-client';
import CryptoJS from "crypto-js";
import moment from "moment";

export const state = reactive({
    filter: {
        residents: {
            isActive: true,
            floors: [],
            isBirthday: false,
            order: 'default',
        },
    },
    company: {},
    menus: [],
    residents: [],
});

const URL = `${import.meta.env.VITE_URL}`;

export const socket = io(URL, {
    path: '/mysocket'
});

socket.connect();

let sessionObjEncrypt = localStorage.getItem("sessionObj");
const sessionObj = sessionObjEncrypt ? CryptoJS.AES.decrypt(sessionObjEncrypt, window.navigator.userAgent) : false;
if (sessionObj) {
    try {
        const str = sessionObj.toString(CryptoJS.enc.Utf8);
        if (str.length > 0) {
            socket.emit("company session", { sessionObj: str })
        } else {
            localStorage.removeItem("sessionObj");
        }
    } catch (e) {
        localStorage.removeItem("sessionObj");
    }
}

socket.on("session", ({ sessionObj }) => {
    const sessionObjEncrypt = CryptoJS.AES.encrypt(sessionObj, navigator.userAgent);
    localStorage.setItem("sessionObj", sessionObjEncrypt.toString());
});

let regex = /\/menus\/[0-9]+\/today/i;
if (regex.test(window.location.pathname)) {
    const id = window.location.pathname.replace('/menus/', '').replace('/today', '');
    socket.emit("init display menu", { id });
}

socket.on("company info", ({ company }) => {
    state.company = company;
    socket.emit("get menus", { id: company.id });
});

socket.on("residents info", ({ allResidents }) => {
    state.residents = allResidents;
});

socket.on("menus info", ({ allMenus }) => {
    state.menus = allMenus;
});

socket.on("menu info", ({ menu }) => {
    state.menus = [menu];
});

socket.on("disconnect client", () => {
    removeData();
    socket.disconnect();
});

socket.on("clear_session", () => {
    localStorage.removeItem("sessionObj");
});

function removeData() {
    state.menus = [];
}