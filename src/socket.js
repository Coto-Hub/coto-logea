import { reactive } from "vue";
import io from 'socket.io-client';
import CryptoJS from "crypto-js";
import moment from "moment";

export const state = reactive({
    url: import.meta.env.VITE_URL,
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
    animations: [],
    reccurences: [],
    plannings: [],
    residents: [],
    decorations: [],
    month_configs: [],
    week_configs: [],
});

// const URL = `${import.meta.env.VITE_URL}`;

export const socket = io(state.url, {
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
    // socket.emit("get menus", { id: company.id });
});

socket.on("animations info", ({ allAnimations }) => {
    state.animations = allAnimations;
    const animList = document.getElementById("update-anim-list");
    if (animList) {
        animList.dispatchEvent(new Event("update"));
    }
});

socket.on("plannings info", ({ allPlannings }) => {
    state.plannings = allPlannings;
    const planningList = document.getElementById("update-planning-list");
    if (planningList) {
        planningList.dispatchEvent(new Event("update"));
    }
});

socket.on("reccurences info", ({ allReccurences }) => {
    state.reccurences = allReccurences;
    const reccurenceList = document.getElementById("update-reccurence-list");
    if (reccurenceList) {
        reccurenceList.dispatchEvent(new Event("update"));
    }
});

socket.on("decorations info", ({ allDecorations }) => {
    state.decorations = allDecorations;
    const decorationsList = document.getElementById("update-decorations");
    if (decorationsList) {
        decorationsList.dispatchEvent(new Event("update"));
    }
});

socket.on("config months info", ({ allMonthConfigs }) => {
    state.month_configs = allMonthConfigs ?? [];
    const allMonthConfigsList = document.getElementById("update-month-configs");
    if (allMonthConfigsList) {
        allMonthConfigsList.dispatchEvent(new Event("update"));
    }
});

socket.on("config weeks info", ({ allWeekConfigs }) => {
    state.week_configs = allWeekConfigs ?? [];
    const allWeekConfigsList = document.getElementById("update-week-configs");
    if (allWeekConfigsList) {
        allWeekConfigsList.dispatchEvent(new Event("update"));
    }
});

socket.on("residents info", ({ allResidents }) => {
    state.residents = allResidents;
    const residentsList = document.getElementById("update-residents");
    if (residentsList) {
        residentsList.dispatchEvent(new Event("update"));
    }
});

socket.on("kind meals info", ({ allKindMeals }) => {
    state.kindMeals = allKindMeals;
    const kindMealsList = document.getElementById("update-kind-meals");
    if (kindMealsList) {
        kindMealsList.dispatchEvent(new Event("update"));
    }
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