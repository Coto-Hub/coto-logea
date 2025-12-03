const mysql = require('mysql2');

module.exports = class MealsRequest {
  constructor(connectionMysql) {
    this.connectionMysql = connectionMysql;
  }

  async getAllKindMealsByCompany(id) {
    return new Promise(async (resolve) => {
      const KindMeals = [];
      const query = `
        SELECT k.Id AS 'k_Id', k.Label AS 'k_Label', k.Abbreviation AS 'k_Abbreviation', k.Id_delivery AS 'k_Id_delivery', k.Can_guest AS 'k_Can_guest', k.Is_staff AS 'k_Is_staff', k.Number AS 'k_Number', k.End_date AS 'k_End_date'
        FROM Kind_meals k WHERE k.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            KindMeals.push({
              id: row.k_Id,
              label: row.k_Label,
              abbreviation: row.k_Abbreviation,
              deliveryId: row.k_Id_delivery,
              canGuest: row.k_Can_guest,
              isStaff: row.k_Is_staff,
              order: row.k_Number,
              endDate: row.k_End_date,
            });
          });
        }
        resolve(KindMeals);
      });
    });
  }

  async insertKindMeal(companyId, kindMeal) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Kind_meals (Id_company, Label, Abbreviation, Id_delivery, Can_guest, Is_staff, Number)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `;
      await this.connectionMysql.sql(query, [companyId, kindMeal.label, kindMeal.abbreviation, kindMeal.deliveryId, kindMeal.canGuest, kindMeal.isStaff, kindMeal.order], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de : " + kindMeal.label
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async updateKindMeal(companyId, kindMeal) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Kind_meals
        SET Label = ?, Abbreviation = ?, Id_delivery = ?, Can_guest = ?, Is_staff = ?
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [kindMeal.label, kindMeal.abbreviation, kindMeal.deliveryId, kindMeal.canGuest, kindMeal.isStaff, kindMeal.id, companyId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de : " + kindMeal.label
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async switchKindMealOrder(companyId, a, b) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Kind_meals
        SET Number = ?
        WHERE Id = ? AND Id_company = ?;
        UPDATE Kind_meals
        SET Number = ?
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [b.order, a.id, companyId, a.order, b.id, companyId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de : " + kindMeal.label
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteKindMeal(companyId, endDate, id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Kind_meals
        SET End_date = ?
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [endDate, id, companyId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async getAllUsersByCompany(id) {
    return new Promise(async (resolve) => {
      const users = [];
      const query = `
        SELECT r.Id AS 'r_Id', r.Civility AS 'r_Civility', r.Lastname AS 'r_Lastname', r.Firstname AS 'r_Firstname', r.Created AS 'r_Created', r.Is_active AS 'r_Is_active', r.Is_staff AS 'r_Is_staff', r.Eating_area AS 'r_Eating_area'
        FROM Users r WHERE r.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            users.push({
              id: row.r_Id,
              civility: row.r_Civility,
              lastname: row.r_Lastname,
              firstname: row.r_Firstname,
              eatingArea: row.r_Eating_area,
              created: row.r_Created,
              isStaff: row.r_Is_staff,
              isActive: row.r_Is_active,
            });
          });
        }
        resolve(users);
      });
    });
  }

  async insertUser(companyId, user) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Users (Id_company, Civility, Lastname, Firstname, Is_staff, Eating_area)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      await this.connectionMysql.sql(query, [companyId, user.civility, user.lastname, user.firstname, user.isStaff, user.eatingArea], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: `Une erreur est survenue lors de la création de : ${user.firstname} ${user.lastname}`
          };
        }
        if (result.rows) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async updateUser(companyId, user) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Users
        SET Civility = ?, Lastname = ?, Firstname = ?, Eating_area = ?
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [user.civility, user.lastname, user.firstname, user.eatingArea, user.id, companyId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: `Une erreur est survenue lors de la modification de : ${user.firstname} ${user.lastname}`
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteUser(companyId, id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Users
        SET Is_active = 0
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [id, companyId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async getAllUserMealConfigsByCompany(id) {
    return new Promise(async (resolve) => {
      const userMealConfigs = [];
      const query = `
        SELECT rmc.Id AS 'rmc_Id', rmc.Id_user AS 'rmc_Id_user', rmc.Date_start AS 'rmc_Date_start', rmc.Date_end AS 'rmc_Date_end', rmc.Created AS 'rmc_Created', mc.Id AS 'mc_Id', mc.Id_kind_meal AS 'mc_Id_kind_meal', mc.Delivery AS 'mc_Delivery', mc.Monday AS 'mc_Monday', mc.Tuesday AS 'mc_Tuesday', mc.Wednesday AS 'mc_Wednesday', mc.Thursday AS 'mc_Thursday', mc.Friday AS 'mc_Friday', mc.Saturday AS 'mc_Saturday', mc.Sunday AS 'mc_Sunday', mc.Public_holiday AS 'mc_Public_holiday'
        FROM User_meal_configs rmc
        LEFT JOIN Meal_configs_entries mc ON mc.Id_user_meal_config = rmc.Id
        WHERE rmc.Id_user IN (SELECT Id FROM Users WHERE Id_company = ?);
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            if (!userMealConfigs.find((rmc) => rmc.id === row.rmc_Id)) {
              userMealConfigs.push({
                id: row.rmc_Id,
                userId: row.rmc_Id_user,
                dateStart: row.rmc_Date_start,
                dateEnd: row.rmc_Date_end,
                created: row.rmc_Created ?? null,
                elements: [],
              });
            }
            const rmc = userMealConfigs.find((rmc) => rmc.id === row.rmc_Id);
            if (row.mc_Id && rmc) {
              rmc.elements.push({
                id: row.mc_Id,
                idKindMeal: row.mc_Id_kind_meal,
                delivery: row.mc_Delivery,
                monday: row.mc_Monday,
                tuesday: row.mc_Tuesday,
                wednesday: row.mc_Wednesday,
                thursday: row.mc_Thursday,
                friday: row.mc_Friday,
                saturday: row.mc_Saturday,
                sunday: row.mc_Sunday,
                publicHoliday: row.mc_Public_holiday,
              });
            }
          });
        }
        resolve(userMealConfigs);
      });
    });
  }

  async insertUserMealConfig(userMealConfig) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO User_meal_configs (Id_user, Date_start, Date_end)
        VALUES (?, ?, ?);
      `;
      await this.connectionMysql.sql(query, [userMealConfig.userId, userMealConfig.dateStart, userMealConfig.dateEnd], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de la configuration de repas"
          };
        }
        if (result.rows) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async updateUserMealConfig(userMealConfig) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE User_meal_configs
        SET Date_start = ?
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [userMealConfig.dateStart, userMealConfig.configId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de la configuration de repas"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async updateMealConfig(configId, config) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Meal_configs_entries
        SET Delivery = ?, Monday = ?, Tuesday = ?, Wednesday = ?, Thursday = ?, Friday = ?, Saturday = ?, Sunday = ?, Public_holiday = ?
        WHERE Id_kind_meal = ? AND Id_user_meal_config = ?;
      `;
      await this.connectionMysql.sql(query, [config.delivery, config.monday, config.tuesday, config.wednesday, config.thursday, config.friday, config.saturday, config.sunday, config.publicHoliday, config.idKindMeal, configId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de la configuration de repas"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async updateUserMealConfigEnd(id, dateEnd) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE User_meal_configs
        SET Date_end = ?
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [dateEnd, id], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de la configuration de repas"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async resetUserMealConfigEnd(configId) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE User_meal_configs
        SET Date_end = NULL
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [configId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de la configuration de repas"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteUserMealConfigEntries(idMealConfig) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Meal_configs_entries
        WHERE Id_user_meal_config = ?;
      `;
      await this.connectionMysql.sql(query, [idMealConfig], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de la configuration des repas"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteUserMealConfig(id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM User_meal_configs
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [id], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de la configuration des repas"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async insertMealConfigToUserMealConfig(userMealConfigId, mealConfigs) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Meal_configs_entries (Id_user_meal_config, Id_kind_meal, Delivery, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, Public_holiday)
        VALUES ?;
      `;
      const values = [];
      mealConfigs.map(
        (mealConfig) => {
          values.push([userMealConfigId, mealConfig.idKindMeal, mealConfig.delivery, mealConfig.monday, mealConfig.tuesday, mealConfig.wednesday, mealConfig.thursday, mealConfig.friday, mealConfig.saturday, mealConfig.sunday, mealConfig.publicHoliday]);
        }
      );
      await this.connectionMysql.sql(query, [values], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de la configuration de repas"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteMealConfig(id, deletedIds) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Meal_configs_entries
        WHERE Id_user_meal_config = ? AND Id_kind_meal IN (?);
      `;
      await this.connectionMysql.sql(query, [id, deletedIds], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de la configuration de repas"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async insertGuestToUser(companyId, userId, label, info, nbGuests, isStaff) {
    return new Promise(async (resolve) => {
      const retrunValue = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Guests (Id_company, Id_user, Label, Info, Nb_guests, Is_staff)
        VALUES (?, ?, ?, ?, ?, ?);
      `;
      await this.connectionMysql.sql(query, [companyId, userId, label, info, nbGuests, isStaff], (result) => {
        if (result.error) {
          console.log(result.error);
          retrunValue.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de l'invité"
          };
        }
        if (result.rows) {
          retrunValue.value = result.rows.insertId;
        }
        resolve(retrunValue);
      });
    });
  }

  async updateGuestConfig(idGuest, guestInfo) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Guests
        SET Info = ?
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [guestInfo, idGuest], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de l'invité"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteGuest(idGuest) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Guests
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [idGuest], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de l'invité"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async insertGuestEntries(idGuest, entries) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Guest_entries (Id_guest, Id_kind_meal, Date_start, Date_end)
        VALUES ?;
      `;
      const values = [];
      entries.map(
        (entry) => {
          values.push([idGuest, entry.idKindMeal, entry.dateStart, entry.dateEnd]);
        }
      );
      await this.connectionMysql.sql(query, [values], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création des plats de l'invité"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteGuestEntriesFromIds(ids) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Guest_entries
        WHERE Id IN (?);
      `;
      await this.connectionMysql.sql(query, [ids], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression des plats de l'invité"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteGuestEntries(idGuest) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Guest_entries
        WHERE Id_guest = ?;
      `;
      await this.connectionMysql.sql(query, [idGuest], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de l'invité"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async getAllGuestsByCompany(id) {
    return new Promise(async (resolve) => {
      const guests = [];
      const query = `
        SELECT g.Id AS 'g_Id', g.Id_user AS 'g_Id_user', g.Label AS 'g_Label', g.Info AS 'g_Info', g.Nb_guests AS 'g_Nb_guests', g.Is_staff AS 'g_Is_staff', g.Created AS 'g_Created', ge.Id AS 'ge_Id', ge.Id_kind_meal AS 'ge_Id_kind_meal', ge.Date_start AS 'ge_Date_start', ge.Date_end AS 'ge_Date_end'
        FROM Guests g
        LEFT JOIN Guest_entries ge ON ge.Id_guest = g.Id
        WHERE g.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            if (!guests.find((g) => g.id === row.g_Id)) {
              guests.push({
                id: row.g_Id,
                label: row.g_Label,
                info: row.g_Info,
                userId: row.g_Id_user,
                nbGuests: row.g_Nb_guests,
                elements: [],
                isStaff: row.g_Is_staff,
                created: row.g_Created ?? null,
              });
            }
            const g = guests.find((g) => g.id === row.g_Id);
            if (row.ge_Id && g) {
              g.elements.push({
                id: row.ge_Id,
                idKindMeal: row.ge_Id_kind_meal,
                dateStart: row.ge_Date_start,
                dateEnd: row.ge_Date_end,
              });
            }
          });
        }
        resolve(guests);
      });
    });
  }

  async insertUserEvent(userId) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO User_events (Id_user)
        VALUES (?);
      `;
      await this.connectionMysql.sql(query, [userId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de l'évènement utilisateur"
          };
        }
        if (result.rows) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async deleteUserEvent(id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM User_events
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [id], (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de l'évènement utilisateur"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async insertUserEventEntries(userEventId, entries) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO User_event_entries (Id_user_event, Id_kind_meal, Delivery, Date_start, Date_end, Is_absence)
        VALUES ?;
      `;
      const values = [];
      entries.map(
        (entry) => {
          values.push([userEventId, entry.idKindMeal, entry.delivery, entry.dateStart, entry.dateEnd, entry.isAbsence]);
        }
      );
      await this.connectionMysql.sql(query, [values], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création des changements de l'évènement utilisateur"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteUserEventEntries(userEventId) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM User_event_entries
        WHERE Id_user_event = ?;
      `;
      await this.connectionMysql.sql(query, [userEventId], (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de l'évènement utilisateur"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async getAllUserEventsByCompany(id) {
    return new Promise(async (resolve) => {
      const userEvents = [];
      const query = `
        SELECT ue.Id AS 'ue_Id', ue.Id_user AS 'ue_Id_user', ue.Created AS 'ue_Created', uee.Id AS 'uee_Id', uee.Id_kind_meal AS 'uee_Id_kind_meal', uee.Delivery AS 'uee_Delivery', uee.Date_start AS 'uee_Date_start', uee.Date_end AS 'uee_Date_end', uee.Is_absence AS 'uee_Is_absence'
        FROM User_events ue
        LEFT JOIN User_event_entries uee ON uee.Id_user_event = ue.Id
        WHERE ue.Id_user IN (SELECT Id FROM Users WHERE Id_company = ?);
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            if (!userEvents.find((ue) => ue.id === row.ue_Id)) {
              userEvents.push({
                id: row.ue_Id,
                userId: row.ue_Id_user,
                created: row.ue_Created ? row.ue_Created : null,
                elements: [],
              });
            }
            const ue = userEvents.find((ue) => ue.id === row.ue_Id);
            if (row.uee_Id && ue) {
              ue.elements.push({
                id: row.uee_Id,
                idKindMeal: row.uee_Id_kind_meal,
                delivery: row.uee_Delivery,
                dateStart: row.uee_Date_start,
                dateEnd: row.uee_Date_end,
                isAbsence: row.uee_Is_absence,
              });
            }
          });
        }
        resolve(userEvents);
      });
    });
  }
}