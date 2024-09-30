require("dotenv").config();
const httpServer = require("http").createServer();
var CryptoJS = require("crypto-js");

const io = require("socket.io")(httpServer, {
  path: '/mysocket',
  cors: {
    origin: [process.env.SERVER_CORS, "*"],
    credentials: true
  },
});

const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const connectionMysql = require("./bdd/mysql");
const MenusRequest = require("./bdd/menus");
const CompaniesRequest = require("./bdd/companies");
const ResidentsRequest = require("./bdd/residents");

const menusRequest = new MenusRequest(connectionMysql);
const companiesRequest = new CompaniesRequest(connectionMysql);
const residentsRequest = new ResidentsRequest(connectionMysql);

io.on("connection", async (socket) => {
  if (!socket.sessionID) {
    socket.sessionID = randomId(8);
  }

  socket.on("company session", async function ({ sessionObj }) {
    if (sessionObj && socket.sessionID) {
      const obj = decrypt(sessionObj);
      if (obj && obj.companyId) {
        const currentDate = (new Date()).setHours(0, 0, 0, 0);
        if (obj.date == currentDate) {
          await connectCompany(obj.companyId, true);
        }
        else {
          socket.emit('clear_session');
        }
      }
    }
    return;
  });

  socket.on("company connect", async function ({ login, password }) {
    if (login && password && socket.sessionID) {
      const checkCompany = await companiesRequest.checkLogin(login, password);
      if (checkCompany && checkCompany.value) {
        await connectCompany(checkCompany.value);
      }
      else {
        createAlert(socket, 'Connection', checkCompany.alert.error);
      }
    }
    return;
  });

  socket.on("init display menu", async function ({ id }) {
    if (id && socket.sessionID) {
      const menu = await menusRequest.getMenuCompany(id);
      if (menu && menu.value) {
        socket.join(`company:${id}`);
        socket.emit("menu info", { menu: menu.value });
      }
    }
    return;
  });

  socket.on("get menus", async function ({ id }) {
    if (id && socket.sessionID && socket.company) {
      const allMenus = await menusRequest.getAllMenusByCompany(id);
      if (allMenus && allMenus.length) {
        socket.emit("menus info", { allMenus });
      }
    }
    return;
  });

  socket.on("remove menu", async function ({ id }) {
    if (id && socket.sessionID && socket.company) {
      const removeMenuData = await menusRequest.removeMenu(socket.company.id, id);
      if (removeMenuData && removeMenuData.alert) {
        createAlert(socket, removeMenuData.alert.title, removeMenuData.alert.error);
      }
      else {
        emitAllMenus();
      }
    }
    return;
  });

  socket.on("add menu", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newMenuData = await menusRequest.insertMenuInCompany(socket.company.id, data);

      if (newMenuData && newMenuData.alert) {
        createAlert(socket, newMenuData.alert.title, newMenuData.alert.error);
      }
      else {
        emitAllMenus();
      }
    }
    return;
  });

  socket.on("update menu", async function (data) {
    if (data && socket.sessionID && socket.company) {
      let updateMenuData = null;
      if (JSON.stringify(data.midday) == JSON.stringify(data.afternoon) && data.midday.starter == "") {
        updateMenuData = await menusRequest.removeMenu(socket.company.id, data.id);
      }
      else {
        updateMenuData = await menusRequest.updateMenu(socket.company.id, data);
      }

      if (updateMenuData && updateMenuData.alert) {
        createAlert(socket, updateMenuData.alert.title, updateMenuData.alert.error);
      }
      else {
        emitAllMenus();
      }
    }
    return;
  });

  socket.on("add menus from file", async function ({ data }) {
    if (data && socket.sessionID && socket.company) {
      data.forEach(async menu => {
        if (!menu.id) {
          const newMenuData = await menusRequest.insertMenuInCompany(socket.company.id, menu);
          if (newMenuData && newMenuData.alert) {
            createAlert(socket, newMenuData.alert.title, newMenuData.alert.error);
          }
        }
        else {
          const updateMenuData = await menusRequest.updateMenu(socket.company.id, menu);
          if (updateMenuData && updateMenuData.alert) {
            createAlert(socket, updateMenuData.alert.title, updateMenuData.alert.error);
          }
        }
      });

      emitAllMenus();
    }
    return;
  });

  socket.on("add resident", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newResidentData = await residentsRequest.insertResidentInCompany(socket.company.id, data);

      if (newResidentData && newResidentData.alert) {
        createAlert(socket, newResidentData.alert.title, newResidentData.alert.error);
      }
      else {
        emitAllResidents(socket.company.id);
      }
    }
    return;
  });

  socket.on("update resident", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const updateResidentData = await residentsRequest.updateResident(socket.company.id, data);

      if (updateResidentData && updateResidentData.alert) {
        createAlert(socket, updateResidentData.alert.title, updateResidentData.alert.error);
      }
      else {
        emitAllResidents(socket.company.id);
      }
    }
    return;
  });

  socket.on("update resident status", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const editResidentData = await residentsRequest.updateResidentStatus(socket.company.id, data.residentId, data.is_active);

      if (editResidentData && editResidentData.alert) {
        createAlert(socket, editResidentData.alert.title, editResidentData.alert.error);
      }
      else {
        emitAllResidents(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete resident", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const deleteResidentData = await residentsRequest.removeResident(socket.company.id, data.residentId);

      if (deleteResidentData && deleteResidentData.alert) {
        createAlert(socket, deleteResidentData.alert.title, deleteResidentData.alert.error);
      }
      else {
        emitAllResidents(socket.company.id);
      }
    }
    return;
  });

  socket.on("add contact", async function (data) {
    if (data && socket.sessionID && socket.company && data.residentId) {
      const newResidentData = await residentsRequest.insertResidentContact(data);

      if (newResidentData && newResidentData.alert) {
        createAlert(socket, newResidentData.alert.title, newResidentData.alert.error);
      }
      else {
        emitAllResidents(socket.company.id);
      }
    }
    return;
  });

  async function connectCompany(id, isSession = false) {
    const requestCompany = await companiesRequest.getCompanyById(id);
    if (requestCompany && requestCompany.value) {
      socket.company = requestCompany.value;
      socket.join(`admin-company:${id}`);
      socket.emit("company info", { company: requestCompany.value });
      emitAllResidents(id);
      emitAllMenus(id);

      if (!isSession) {
        const currentDate = (new Date()).setHours(0, 0, 0, 0);
        const encrypted = encrypt({ date: currentDate, companyId: id });
        if (encrypted) {
          socket.emit("session", { sessionObj: encrypted });
        }
      }
    }
    else {
      createAlert(socket, 'Erreur', 'Une erreur est survenue.');
    }
  }
});

function createAlert(socket, title, error, isError = true) {
  socket.emit("alert", { title, error, isError });
}

async function emitAllMenus(id) {
  const allMenus = await menusRequest.getAllMenusByCompany(id);
  if (allMenus && allMenus.length) {
    io.to(`company:${id}`).emit("menus info", { allMenus });
    io.to(`admin-company:${id}`).emit("menus info", { allMenus });
  }
}

async function emitAllResidents(id) {
  const allResidents = await residentsRequest.getAllResidentsByCompany(id);
  if (allResidents && allResidents.length) {
    io.to(`admin-company:${id}`).emit("residents info", { allResidents });
  }
}

const HOST = 'localhost';
const PORT = process.env.SERVER_PORT || 3000;

httpServer.listen(PORT, () =>
  console.log(`server listening at http://${HOST}:${PORT}`)
);

function encrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.SECRET,
    {
      keySize: 128 / 8,
      iv: process.env.SECRET,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString();
}

function decrypt(data) {
  return JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data, process.env.SECRET,
    {
      keySize: 128 / 8,
      iv: process.env.SECRET,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })));
}