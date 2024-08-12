const httpServer = require("http").createServer();

const io = require("socket.io")(httpServer, {
  path: '/mysocket',
  cors: {
    origin: '*',
  },
});

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const connectionMysql = require("./bdd/mysql");
const Request = require("./bdd/request");

const request = new Request(connectionMysql);

io.on("connection", async (socket) => {
  if (!socket.sessionID) {
    socket.sessionID = randomId(8);
    const allMenus = await request.getAllMenus();
    if (allMenus && allMenus.length) {
      socket.emit("menus info", { allMenus });
    }
  }

  socket.on("remove menu", async function({ id }) {
    if (id && socket.sessionID) {
      const removeUserData = await request.removeMenu(id);
      if (removeUserData && removeUserData.alert) {
        createAlert(socket, removeUserData.alert.title, removeUserData.alert.error);
      }
      else {
        emitAllMenus();
      }
    }
    return;
  });

  socket.on("add menu", async function(data) {
    if (data && socket.sessionID) {
      const newUserData = await request.insertMenu(data);

      if (newUserData && newUserData.alert) {
        createAlert(socket, newUserData.alert.title, newUserData.alert.error);
      }
      else {
        emitAllMenus();
      }
    }
    return;
  });

  socket.on("update menu", async function(data) {
    if (data && socket.sessionID) {
      let updateUserData = null;

      if (JSON.stringify(data.midday) == JSON.stringify(data.afternoon) && data.midday.starter == "") {
        updateUserData = await request.removeMenu(data.id);
      }
      else {
        updateUserData = await request.updateMenu(data);
      }

      if (updateUserData && updateUserData.alert) {
        createAlert(socket, updateUserData.alert.title, updateUserData.alert.error);
      }
      else {
        emitAllMenus();
      }
    }
    return;
  });

  socket.on("add menus from file", async function({data}) {
    if (data && socket.sessionID) {
      data.forEach(async menu => {
        if (!menu.id) {
          const newMenuData = await request.insertMenu(menu);
          if (newMenuData && newMenuData.alert) {
            createAlert(socket, newMenuData.alert.title, newMenuData.alert.error);
          }
        }
        else {
          const updateMenuData = await request.updateMenu(menu);
          if (updateMenuData && updateMenuData.alert) {
            createAlert(socket, updateMenuData.alert.title, updateMenuData.alert.error);
          }
        }
      });
      
      emitAllMenus();
    }
    return;
  });
});

function createAlert(socket, title, error, isError = true) {
  socket.emit("alert", { title, error, isError });
}

async function emitAllMenus() {
  const allMenus = await request.getAllMenus();
  if (allMenus && allMenus.length) {
    io.emit("menus info", { allMenus });
  }
}

const HOST = 'localhost';
const PORT = 3005;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://${HOST}:${PORT}`)
);