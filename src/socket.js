import { reactive } from "vue";
import io from 'socket.io-client';

export const state = reactive({
    data: {},
    menus: [],
});

//const URL = 'http://localhost:3005';
const URL = 'https://logea.coto-app.xyz';

export const socket = io(URL, {
    path: '/mysocket'
});
  
socket.on("menus info", ({ allMenus }) => {
    state.menus = allMenus;
});
  
socket.on("disconnect client", () => {
    removeData();
    socket.disconnect();
});
  
socket.on("clear_session", () => {
    removeData();
});
  
function removeData() {
    state.menus = [];
}