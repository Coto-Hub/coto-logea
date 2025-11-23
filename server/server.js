require("dotenv").config();
const httpServer = require("http").createServer(httpHandler);
var CryptoJS = require("crypto-js");

const io = require("socket.io")(httpServer, {
  path: '/mysocket',
  cors: {
    origin: [process.env.SERVER_CORS, "*"],
    credentials: true
  },
});

const fs = require("fs");
const crypto = require("crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");

const connectionMysql = require("./bdd/mysql");
const MenusRequest = require("./bdd/menus");
const CompaniesRequest = require("./bdd/companies");
const PlanningsRequest = require("./bdd/plannings");
const MealsRequest = require("./bdd/meals");
const path = require("path");
const { emit } = require("process");

const menusRequest = new MenusRequest(connectionMysql);
const companiesRequest = new CompaniesRequest(connectionMysql);
const planningsRequest = new PlanningsRequest(connectionMysql);
const mealsRequest = new MealsRequest(connectionMysql);

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

  socket.on("remove menu", async function ({ date }) {
    if (date && socket.sessionID && socket.company) {
      const removeMenuData = await menusRequest.removeMenu(socket.company.id, date);
      if (removeMenuData && removeMenuData.alert) {
        createAlert(socket, removeMenuData.alert.title, removeMenuData.alert.error);
      }
      else {
        emitAllMenus(socket.company.id);
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
        emitAllMenus(socket.company.id);
      }
    }
    return;
  });

  socket.on("update menu", async function (data) {
    if (data && socket.sessionID && socket.company) {
      let updateMenuData = null;
      if (JSON.stringify(data.midday) == JSON.stringify(data.afternoon) && data.midday.starter == "") {
        updateMenuData = await menusRequest.removeMenu(socket.company.id, data.date);
      }
      else {
        updateMenuData = await menusRequest.updateMenu(socket.company.id, data);
      }

      if (updateMenuData && updateMenuData.alert) {
        createAlert(socket, updateMenuData.alert.title, updateMenuData.alert.error);
      }
      else {
        emitAllMenus(socket.company.id);
      }
    }
    return;
  });

  socket.on("init animations planning", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newAnimationPlanningData = await planningsRequest.initAnimationPlanning(socket.company.id, data);
      if (newAnimationPlanningData && newAnimationPlanningData.alert) {
        createAlert(socket, newAnimationPlanningData.alert.title, newAnimationPlanningData.alert.error);
      }
      else {
        emitAllPlannings(socket.company.id);
      }
    }
  });

  socket.on("add menus from file", async function ({ data }) {
    if (data && socket.sessionID && socket.company) {
      data.forEach(async menu => {
        if (!menu.exist) {
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

      emitAllMenus(socket.company.id);
    }
    return;
  });

  socket.on("add animation", async function (data) {
    if (data && socket.sessionID && socket.company) {
      if (data.icons.length) {
        await data.icons.forEach(async icon => {
          if (icon.src.startsWith("data:image")) {
            try {
              if (!fs.existsSync(`./uploads/${socket.company.id}`)) {
                fs.mkdirSync(`./uploads/${socket.company.id}`);
              }
            } catch (err) {
              console.error(err);
            }
            icon.path = `./uploads/${socket.company.id}/${randomId(14)}.png`;
            fs.writeFileSync(icon.path, Buffer.from(icon.src.replace(/^data:image\/\w+;base64,/, ""), 'base64'));
          }
        });
      }
      const newAnimationData = await planningsRequest.insertAnimation(socket.company.id, data);

      if (newAnimationData && newAnimationData.alert) {
        createAlert(socket, newAnimationData.alert.title, newAnimationData.alert.error);
      }
      else {
        emitAllAnimations(socket.company.id);
      }
    }
    return;
  });

  socket.on("add reccurence", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newReccurenceData = await planningsRequest.insertReccurenceAnimation(data);

      if (newReccurenceData && newReccurenceData.alert) {
        createAlert(socket, newReccurenceData.alert.title, newReccurenceData.alert.error);
      }
      else {
        emitAllReccurences(socket.company.id);
      }
    }
    return;
  });

  socket.on("add animation planning", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newAnimationPlanningData = await planningsRequest.insertAnimationPlanning(socket.company.id, data);
      if (newAnimationPlanningData && newAnimationPlanningData.alert) {
        createAlert(socket, newAnimationPlanningData.alert.title, newAnimationPlanningData.alert.error);
      }
      else {
        emitAllPlannings(socket.company.id);
      }
    }
    return;
  });

  socket.on("add decoration", async function (data) {
    if (data && socket.sessionID && socket.company) {
      if (data.iconId == null) {
        try {
          if (!fs.existsSync(`./uploads/${socket.company.id}`)) {
            fs.mkdirSync(`./uploads/${socket.company.id}`);
          }
        } catch (err) {
          console.error(err);
        }
        data.path = `./uploads/${socket.company.id}/${randomId(14)}.png`;
        fs.writeFileSync(data.path, Buffer.from(data.src.replace(/^data:image\/\w+;base64,/, ""), 'base64'));

        const newIconData = await planningsRequest.insertIconDefault(socket.company.id, data);
        if (newIconData && newIconData.alert) {
          createAlert(socket, newIconData.alert.title, newIconData.alert.error);
          return;
        }
        else {
          emitAllAnimations(socket.company.id);
          data.iconId = newIconData.value;
        }
      }
      const newDecorationData = await planningsRequest.insertDecoration(socket.company.id, data);
      if (newDecorationData && newDecorationData.alert) {
        createAlert(socket, newDecorationData.alert.title, newDecorationData.alert.error);
      }
      else {
        emitAllDecorations(socket.company.id);
      }
    }
    return;
  });

  socket.on("add month config", async function (data) {
    if (data && socket.sessionID && socket.company) {
      if (data.iconLeft.path) {
        try {
          if (!fs.existsSync(`./uploads/${socket.company.id}`)) {
            fs.mkdirSync(`./uploads/${socket.company.id}`);
          }
        } catch (err) {
          console.error(err);
        }
        const dataPath = `./uploads/${socket.company.id}/${randomId(14)}.png`;
        fs.writeFileSync(dataPath, Buffer.from(data.iconLeft.path.replace(/^data:image\/\w+;base64,/, ""), 'base64'));

        const newIconData = await planningsRequest.insertIconDefault(socket.company.id, {
          label: "Déco",
          path: dataPath,
        });
        if (newIconData && newIconData.alert) {
          createAlert(socket, newIconData.alert.title, newIconData.alert.error);
          return;
        }
        else {
          emitAllAnimations(socket.company.id);
          data.iconLeft.id = newIconData.value;
        }
      }
      if (data.iconRight.path) {
        try {
          if (!fs.existsSync(`./uploads/${socket.company.id}`)) {
            fs.mkdirSync(`./uploads/${socket.company.id}`);
          }
        } catch (err) {
          console.error(err);
        }
        const dataPath = `./uploads/${socket.company.id}/${randomId(14)}.png`;
        fs.writeFileSync(dataPath, Buffer.from(data.iconRight.path.replace(/^data:image\/\w+;base64,/, ""), 'base64'));

        const newIconData = await planningsRequest.insertIconDefault(socket.company.id, {
          label: "Déco",
          path: dataPath,
        });
        if (newIconData && newIconData.alert) {
          createAlert(socket, newIconData.alert.title, newIconData.alert.error);
          return;
        }
        else {
          emitAllAnimations(socket.company.id);
          data.iconRight.id = newIconData.value;
        }
      }
      const newMonthConfigData = await planningsRequest.insertMonthConfig(socket.company.id, data);

      if (newMonthConfigData && newMonthConfigData.alert) {
        createAlert(socket, newMonthConfigData.alert.title, newMonthConfigData.alert.error);
      }
      else {
        emitAllMonthConfigs(socket.company.id);
      }
    }
    return;
  });

  socket.on("add week config", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newWeekConfigData = await planningsRequest.insertWeekConfig(socket.company.id, data);

      if (newWeekConfigData && newWeekConfigData.alert) {
        createAlert(socket, newWeekConfigData.alert.title, newWeekConfigData.alert.error);
      }
      else {
        emitAllWeekConfigs(socket.company.id);
      }
    }
    return;
  });

  socket.on("add user", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newUserData = await mealsRequest.insertUser(socket.company.id, data);

      if (newUserData && newUserData.alert) {
        createAlert(socket, newUserData.alert.title, newUserData.alert.error);
      }
      else {
        if (newUserData.value) {
          socket.emit('current add user', { id: newUserData.value });
        }
        emitAllUsers(socket.company.id);
      }
    }
    return;
  });

  socket.on("add kind meal", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newKindMealData = await mealsRequest.insertKindMeal(socket.company.id, data);

      if (newKindMealData && newKindMealData.alert) {
        createAlert(socket, newKindMealData.alert.title, newKindMealData.alert.error);
      }
      else {
        emitAllKindMeals(socket.company.id);
      }
    }
    return;
  });

  socket.on("add user meal config", async function (data) {
    if (data && socket.sessionID && socket.company) {
      if (data.previousConfig) {
        await mealsRequest.updateUserMealConfigEnd(data.previousConfig.id, data.previousConfig.dateEnd);
      }
      const newUserMealConfigData = await mealsRequest.insertUserMealConfig(data);

      if (newUserMealConfigData && newUserMealConfigData.alert) {
        createAlert(socket, newUserMealConfigData.alert.title, newUserMealConfigData.alert.error);
      }
      else if (newUserMealConfigData.value) {
        const newMealConfigData = data.configList.length ? await mealsRequest.insertMealConfigToUserMealConfig(newUserMealConfigData.value, data.configList) : {};
        if (newMealConfigData && newMealConfigData.alert) {
          createAlert(socket, newMealConfigData.alert.title, newMealConfigData.alert.error);
        }
        else {
          emitAllUserMealConfigs(socket.company.id);
        }
      }
    }
    return;
  });

  socket.on("add meal config to user", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newMealConfigData = await mealsRequest.insertMealConfigToUserMealConfig(data);

      if (newMealConfigData && newMealConfigData.alert) {
        createAlert(socket, newMealConfigData.alert.title, newMealConfigData.alert.error);
      }
      else {
        emitAllUserMealConfigs(socket.company.id);
      }
    }
    return;
  });

  socket.on("add guest", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newGuest = await mealsRequest.insertGuestToUser(socket.company.id, data.userId, data.label, data.nbGuests, data.isStaff);

      if (newGuest && newGuest.alert) {
        createAlert(socket, newGuest.alert.title, newGuest.alert.error);
      }
      else if (newGuest.value) {
        const newGuestEntries = await mealsRequest.insertGuestEntries(newGuest.value, data.entries);
        if (newGuestEntries && newGuestEntries.alert) {
          createAlert(socket, newGuestEntries.alert.title, newGuestEntries.alert.error);
        }
        else {
          emitAllGuests(socket.company.id);
        }
      }
    }
    return;
  });

  socket.on("add user event", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const newUserEventData = await mealsRequest.insertUserEvent(data.userId);

      if (newUserEventData && newUserEventData.alert) {
        createAlert(socket, newUserEventData.alert.title, newUserEventData.alert.error);
      }
      else if (newUserEventData.value) {
        const newEventEntries = data.entries.length ? await mealsRequest.insertUserEventEntries(newUserEventData.value, data.entries) : {};
        if (newEventEntries && newEventEntries.alert) {
          createAlert(socket, newEventEntries.alert.title, newEventEntries.alert.error);
        }
        else {
          emitAllUserEvents(socket.company.id);
        }
      }
    }
  });

  socket.on("edit animation", async function (data) {
    if (data && socket.sessionID && socket.company) {
      if (data.newIcons.length) {
        await data.newIcons.forEach(async icon => {
          if (icon.src.startsWith("data:image")) {
            try {
              if (!fs.existsSync(`./uploads/${socket.company.id}`)) {
                fs.mkdirSync(`./uploads/${socket.company.id}`);
              }
            } catch (err) {
              console.error(err);
            }
            icon.path = `./uploads/${socket.company.id}/${randomId(14)}.png`;
            fs.writeFileSync(icon.path, Buffer.from(icon.src.replace(/^data:image\/\w+;base64,/, ""), 'base64'));
          }
        });
        const insertIconAnimationData = await planningsRequest.insertIconAnimation(data.id, data.newIcons);
        if (insertIconAnimationData && insertIconAnimationData.alert) {
          createAlert(socket, insertIconAnimationData.alert.title, insertIconAnimationData.alert.error);
        }
      }
      if (data.removeIcons.length) {
        const removeIconAnimationData = await planningsRequest.removeIconAnimation(socket.company.id, data.id, data.removeIcons);
        if (removeIconAnimationData && removeIconAnimationData.alert) {
          createAlert(socket, removeIconAnimationData.alert.title, removeIconAnimationData.alert.error);
        }
      }
      if (data.label != data.lastLabel) {
        const updateAnimationData = await planningsRequest.updateAnimation(socket.company.id, data);

        if (updateAnimationData && updateAnimationData.alert) {
          createAlert(socket, updateAnimationData.alert.title, updateAnimationData.alert.error);
        }
      }

      emitAllAnimations(socket.company.id);
    }
    return;
  });

  socket.on("edit reccurence", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const updateReccurenceData = await planningsRequest.updateReccurence(socket.company.id, data);

      if (updateReccurenceData && updateReccurenceData.alert) {
        createAlert(socket, updateReccurenceData.alert.title, updateReccurenceData.alert.error);
      }

      emitAllReccurences(socket.company.id);
    }
    return;
  });

  socket.on("edit animation planning", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const updateAnimationPlanningData = await planningsRequest.updateAnimationPlanning(socket.company.id, data);

      if (updateAnimationPlanningData && updateAnimationPlanningData.alert) {
        createAlert(socket, updateAnimationPlanningData.alert.title, updateAnimationPlanningData.alert.error);
      }

      emitAllPlannings(socket.company.id);
    }
    return;
  });

  socket.on("edit decoration", async function (data) {
    if (data && socket.sessionID && socket.company) {
      if (data.iconId == null) {
        try {
          if (!fs.existsSync(`./uploads/${socket.company.id}`)) {
            fs.mkdirSync(`./uploads/${socket.company.id}`);
          }
        } catch (err) {
          console.error(err);
        }
        data.path = `./uploads/${socket.company.id}/${randomId(14)}.png`;
        fs.writeFileSync(data.path, Buffer.from(data.src.replace(/^data:image\/\w+;base64,/, ""), 'base64'));

        const newIconData = await planningsRequest.insertIconDefault(socket.company.id, data);
        if (newIconData && newIconData.alert) {
          createAlert(socket, newIconData.alert.title, newIconData.alert.error);
          return;
        }
        else {
          emitAllAnimations(socket.company.id);
          data.iconId = newIconData.value;
        }
      }
      const updateDecorationData = await planningsRequest.updateDecoration(socket.company.id, data);

      if (updateDecorationData && updateDecorationData.alert) {
        createAlert(socket, updateDecorationData.alert.title, updateDecorationData.alert.error);
      }

      emitAllDecorations(socket.company.id);
    }
    return;
  });

  socket.on("edit month config", async function (data) {
    if (data && socket.sessionID && socket.company) {
      if (data.iconLeft.path) {
        try {
          if (!fs.existsSync(`./uploads/${socket.company.id}`)) {
            fs.mkdirSync(`./uploads/${socket.company.id}`);
          }
        } catch (err) {
          console.error(err);
        }
        const dataPath = `./uploads/${socket.company.id}/${randomId(14)}.png`;
        fs.writeFileSync(dataPath, Buffer.from(data.iconLeft.path.replace(/^data:image\/\w+;base64,/, ""), 'base64'));

        const newIconData = await planningsRequest.insertIconDefault(socket.company.id, {
          label: "Déco",
          path: dataPath,
        });
        if (newIconData && newIconData.alert) {
          createAlert(socket, newIconData.alert.title, newIconData.alert.error);
          return;
        }
        else {
          emitAllAnimations(socket.company.id);
          data.iconLeft.id = newIconData.value;
        }
      }
      if (data.iconRight.path) {
        try {
          if (!fs.existsSync(`./uploads/${socket.company.id}`)) {
            fs.mkdirSync(`./uploads/${socket.company.id}`);
          }
        } catch (err) {
          console.error(err);
        }
        const dataPath = `./uploads/${socket.company.id}/${randomId(14)}.png`;
        fs.writeFileSync(dataPath, Buffer.from(data.iconRight.path.replace(/^data:image\/\w+;base64,/, ""), 'base64'));

        const newIconData = await planningsRequest.insertIconDefault(socket.company.id, {
          label: "Déco",
          path: dataPath,
        });
        if (newIconData && newIconData.alert) {
          createAlert(socket, newIconData.alert.title, newIconData.alert.error);
          return;
        }
        else {
          emitAllAnimations(socket.company.id);
          data.iconRight.id = newIconData.value;
        }
      }
      const updateMonthConfigData = await planningsRequest.updateMonthConfig(socket.company.id, data);

      if (updateMonthConfigData && updateMonthConfigData.alert) {
        createAlert(socket, updateMonthConfigData.alert.title, updateMonthConfigData.alert.error);
      }

      emitAllMonthConfigs(socket.company.id);
    }
    return;
  });

  socket.on("edit week config", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const updateWeekConfigData = await planningsRequest.updateWeekConfig(socket.company.id, data);

      if (updateWeekConfigData && updateWeekConfigData.alert) {
        createAlert(socket, updateWeekConfigData.alert.title, updateWeekConfigData.alert.error);
      }

      emitAllWeekConfigs(socket.company.id);
    }
    return;
  });

  socket.on("edit user", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const updateUserData = await mealsRequest.updateUser(socket.company.id, data);

      if (updateUserData && updateUserData.alert) {
        createAlert(socket, updateUserData.alert.title, updateUserData.alert.error);
      }

      emitAllUsers(socket.company.id);
    }
    return;
  });

  socket.on("edit kind meal", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const updateKindMealData = await mealsRequest.updateKindMeal(socket.company.id, data);

      if (updateKindMealData && updateKindMealData.alert) {
        createAlert(socket, updateKindMealData.alert.title, updateKindMealData.alert.error);
      }

      emitAllKindMeals(socket.company.id);
    }
    return;
  });

  socket.on("switch kind meal order", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const switchKindMealOrderData = await mealsRequest.switchKindMealOrder(socket.company.id, data.a, data.b);

      if (switchKindMealOrderData && switchKindMealOrderData.alert) {
        createAlert(socket, switchKindMealOrderData.alert.title, switchKindMealOrderData.alert.error);
      }

      emitAllKindMeals(socket.company.id);
    }
    return;
  });

  socket.on("edit user meal config", async function (data) {
    if (data && socket.sessionID && socket.company) {
      if (data.previousConfig) {
        await mealsRequest.updateUserMealConfigEnd(data.previousConfig.id, data.previousConfig.dateEnd);
      }
      const updateUserMealConfigData = await mealsRequest.updateUserMealConfig(data);

      if (updateUserMealConfigData && updateUserMealConfigData.alert) {
        createAlert(socket, updateUserMealConfigData.alert.title, updateUserMealConfigData.alert.error);
      }
      else {
        if (data.adedEntries && data.adedEntries.length) {
          await mealsRequest.insertMealConfigToUserMealConfig(data.configId, data.adedEntries);
        }
        if (data.deletedEntries && data.deletedEntries.length) {
          await mealsRequest.deleteMealConfig(data.configId, data.deletedEntries);
        }
        if (data.editedEntries && data.editedEntries.length) {
          for (const entry of data.editedEntries) {
            await mealsRequest.updateMealConfig(data.configId, entry);
          }
        }
        emitAllUserMealConfigs(socket.company.id);
      }
    }
    return;
  });

  socket.on("edit user meal config end", async function (data) {
    if (data && data.configId != null && socket.sessionID && socket.company) {
      const stopConfigData = await mealsRequest.updateUserMealConfigEnd(data.configId, data.date);
      if (stopConfigData && stopConfigData.alert) {
        createAlert(socket, stopConfigData.alert.title, stopConfigData.alert.error);
      }
      else {
        emitAllUserMealConfigs(socket.company.id);
        emitAllUsers(socket.company.id);
      }
    }
    return;
  });

  socket.on("edit meal config to user", async function (data) {
    if (data && socket.sessionID && socket.company) {
      const updateMealConfigData = await mealsRequest.updateMealConfig(data);

      if (updateMealConfigData && updateMealConfigData.alert) {
        createAlert(socket, updateMealConfigData.alert.title, updateMealConfigData.alert.error);
      }

      emitAllUserMealConfigs(socket.company.id);
    }
    return;
  });

  socket.on("delete animation", async function (id) {
    if (id != null && socket.sessionID && socket.company) {
      const removeAnimationData = await planningsRequest.disabledAnimation(socket.company.id, id);
      if (removeAnimationData && removeAnimationData.alert) {
        createAlert(socket, removeAnimationData.alert.title, removeAnimationData.alert.error);
      }
      else {
        emitAllAnimations(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete reccurence", async function (id) {
    if (id != null && socket.sessionID && socket.company) {
      const removeReccurenceData = await planningsRequest.removeReccurence(socket.company.id, id);
      if (removeReccurenceData && removeReccurenceData.alert) {
        createAlert(socket, removeReccurenceData.alert.title, removeReccurenceData.alert.error);
      }
      else {
        emitAllReccurences(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete animation planning", async function (id) {
    if (id != null && socket.sessionID && socket.company) {
      const removeDecorationData = await planningsRequest.removeDecorationFromAnimation(socket.company.id, id);
      const removeAnimationPlanningData = await planningsRequest.removeAnimationPlanning(socket.company.id, id);
      if (removeAnimationPlanningData && removeAnimationPlanningData.alert) {
        createAlert(socket, removeAnimationPlanningData.alert.title, removeAnimationPlanningData.alert.error);
      }
      else {
        emitAllPlannings(socket.company.id);
        emitAllDecorations(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete decorations planning", async function (data) {
    if (data != null && socket.sessionID && socket.company) {
      const removeDecorationsData = await planningsRequest.removeDecorations(socket.company.id, data);
      if (removeDecorationsData && removeDecorationsData.alert) {
        createAlert(socket, removeDecorationsData.alert.title, removeDecorationsData.alert.error);
      }
      else {
        emitAllPlannings(socket.company.id);
        emitAllDecorations(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete decoration", async function (id) {
    if (id != null && socket.sessionID && socket.company) {
      const removeDecorationData = await planningsRequest.removeDecoration(socket.company.id, id);
      if (removeDecorationData && removeDecorationData.alert) {
        createAlert(socket, removeDecorationData.alert.title, removeDecorationData.alert.error);
      }
      else {
        emitAllDecorations(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete user", async function (id) {
    if (id != null && socket.sessionID && socket.company) {
      const deleteUserData = await mealsRequest.deleteUser(socket.company.id, id);
      if (deleteUserData && deleteUserData.alert) {
        createAlert(socket, deleteUserData.alert.title, deleteUserData.alert.error);
      }
      else {
        emitAllUsers(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete kind meal", async function (data) {
    if (data && data.id != null && socket.sessionID && socket.company) {
      const removeKindMealData = await mealsRequest.deleteKindMeal(socket.company.id, data.date, data.id);
      if (removeKindMealData && removeKindMealData.alert) {
        createAlert(socket, removeKindMealData.alert.title, removeKindMealData.alert.error);
      }
      else {
        emitAllKindMeals(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete user meal config", async function (data) {
    if (data && data.configId != null && socket.sessionID && socket.company) {
      if (data.previousConfig) {
        await mealsRequest.updateUserMealConfigEnd(data.previousConfig.id, data.previousConfig.dateEnd);
      }
      await mealsRequest.deleteUserMealConfigEntries(data.configId);
      const removeUserMealConfigData = await mealsRequest.deleteUserMealConfig(data.configId);
      if (removeUserMealConfigData && removeUserMealConfigData.alert) {
        createAlert(socket, removeUserMealConfigData.alert.title, removeUserMealConfigData.alert.error);
      }
      else {
        emitAllUserMealConfigs(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete user event meal", async function (id) {
    if (id != null && socket.sessionID && socket.company) {
      await mealsRequest.deleteUserEventEntries(id);
      const removeUserEventConfigData = await mealsRequest.deleteUserEvent(id);
      if (removeUserEventConfigData && removeUserEventConfigData.alert) {
        createAlert(socket, removeUserEventConfigData.alert.title, removeUserEventConfigData.alert.error);
      }
      else {
        emitAllUserEvents(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete meal config to user", async function (id) {
    if (id != null && socket.sessionID && socket.company) {
      const removeMealConfigData = await mealsRequest.removeMealConfig(id);
      if (removeMealConfigData && removeMealConfigData.alert) {
        createAlert(socket, removeMealConfigData.alert.title, removeMealConfigData.alert.error);
      }
      else {
        emitAllUserMealConfigs(socket.company.id);
      }
    }
    return;
  });

  socket.on("delete guest", async function (id) {
    if (id != null && socket.sessionID && socket.company) {
      await mealsRequest.deleteGuestEntries(id);
      const removeGuestData = await mealsRequest.deleteGuest(id);
      if (removeGuestData && removeGuestData.alert) {
        createAlert(socket, removeGuestData.alert.title, removeGuestData.alert.error);
      }
      else {
        emitAllGuests(socket.company.id);
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
      // emitAllUsers(id);
      emitAllMenus(id);
      emitAllAnimations(id);
      emitAllReccurences(id);
      emitAllPlannings(id);
      emitAllDecorations(id);
      emitAllMonthConfigs(id);
      emitAllWeekConfigs(id);
      emitAllKindMeals(id);
      emitAllUserMealConfigs(id);
      emitAllUsers(id);
      emitAllGuests(id);
      emitAllUserEvents(id);

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

async function emitAllAnimations(id) {
  emitAllIcons(id);
  const allAnimations = await planningsRequest.getAllAnimationsByCompany(id);
  if (allAnimations && allAnimations.length) {
    io.to(`admin-company:${id}`).emit("animations info", { allAnimations });
  }
}

async function emitAllIcons(id) {
  const allIcons = await planningsRequest.getAllIconsByCompany(id);
  if (allIcons && allIcons.length) {
    io.to(`admin-company:${id}`).emit("icons info", { allIcons });
  }
}

async function emitAllReccurences(id) {
  const allReccurences = await planningsRequest.getAllReccurencesByCompany(id);
  if (allReccurences && allReccurences.length) {
    io.to(`admin-company:${id}`).emit("reccurences info", { allReccurences });
  }
}

async function emitAllPlannings(id) {
  const allPlannings = await planningsRequest.getAllPlanningsByCompany(id);
  if (allPlannings && allPlannings.length) {
    io.to(`admin-company:${id}`).emit("plannings info", { allPlannings });
  }
}

async function emitAllDecorations(id) {
  const allDecorations = await planningsRequest.getAllDecorationsByCompany(id);
  if (allDecorations) {
    io.to(`admin-company:${id}`).emit("decorations info", { allDecorations });
  }
}

async function emitAllMonthConfigs(id) {
  const allMonthConfigs = await planningsRequest.getAllMonthConfigByCompany(id);
  if (allMonthConfigs && allMonthConfigs.length) {
    io.to(`admin-company:${id}`).emit("config months info", { allMonthConfigs });
  }
}

async function emitAllWeekConfigs(id) {
  const allWeekConfigs = await planningsRequest.getAllWeekConfigByCompany(id);
  if (allWeekConfigs && allWeekConfigs.length) {
    io.to(`admin-company:${id}`).emit("config weeks info", { allWeekConfigs });
  }
}

async function emitAllKindMeals(id) {
  const allKindMeals = await mealsRequest.getAllKindMealsByCompany(id);
  if (allKindMeals && allKindMeals.length) {
    io.to(`admin-company:${id}`).emit("kind meals info", { allKindMeals });
  }
}

async function emitAllUserMealConfigs(id) {
  const allUserMealConfigs = await mealsRequest.getAllUserMealConfigsByCompany(id);
  if (allUserMealConfigs && allUserMealConfigs.length) {
    io.to(`admin-company:${id}`).emit("user meal configs info", { allUserMealConfigs });
  }
}

async function emitAllUsers(id) {
  const allUsers = await mealsRequest.getAllUsersByCompany(id);
  if (allUsers && allUsers.length) {
    io.to(`admin-company:${id}`).emit("users info", { allUsers });
  }
}

async function emitAllGuests(id) {
  const allGuests = await mealsRequest.getAllGuestsByCompany(id);
  if (allGuests && allGuests.length) {
    io.to(`admin-company:${id}`).emit("guests info", { allGuests });
  } else {
    io.to(`admin-company:${id}`).emit("guests info", { allGuests: [] });
  }
}

async function emitAllUserEvents(id) {
  const allUserEvents = await mealsRequest.getAllUserEventsByCompany(id);
  if (allUserEvents && allUserEvents.length) {
    io.to(`admin-company:${id}`).emit("user events info", { allUserEvents });
  }
  else {
    io.to(`admin-company:${id}`).emit("user events info", { allUserEvents: [] });
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

function httpHandler(req, res) {
  fs.readFile(`.${req.url}`, function (err, data) {
    if (err == null) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': process.env.SERVER_CORS,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
      res.write(data);
      res.end();
    }
  });
}