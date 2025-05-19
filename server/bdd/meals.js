module.exports = class MealsRequest {
  constructor(connectionMysql) {
    this.connectionMysql = connectionMysql;
  }

  async getAllKindMealsByCompany(id) {
    return new Promise(async (resolve) => {
      const KindMeals = [];
      const query = `
        SELECT k.Id AS 'k_Id', k.Label AS 'k_Label', k.Can_delivery AS 'k_Can_delivery', k.Is_active AS 'k_Is_active'
        FROM Kind_meals k WHERE k.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            KindMeals.push({
              id: row.k_Id,
              label: row.k_Label,
              canDelivery: row.k_Can_delivery,
              isActive: row.k_Is_active,
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
        INSERT INTO Kind_meals (Id_company, Label, Can_delivery)
        VALUES (?, ?, ?);
      `;
      await this.connectionMysql.sql(query, [companyId, kindMeal.label, kindMeal.canDelivery], (result) => {
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
        SET Label = ?, Can_delivery = ?
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [kindMeal.label, kindMeal.canDelivery, kindMeal.id, companyId], (result) => {
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

  async deleteKindMeal(companyId, id) {
    return new Promise(async (resolve) => {
      const query = `
        UPDATE Kind_meals
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

  async getAllResidentsByCompany(id) {
    return new Promise(async (resolve) => {
      const residents = [];
      const query = `
        SELECT r.Id AS 'r_Id', r.Civility AS 'r_Civility', r.Lastname AS 'r_Lastname', r.Firstname AS 'r_Firstname', r.Created AS 'r_Created', r.Is_active AS 'r_Is_active'
        FROM Residents r WHERE r.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            residents.push({
              id: row.r_Id,
              civility: row.r_Civility,
              lastname: row.r_Lastname,
              firstname: row.r_Firstname,
              created: row.r_Created,
              isActive: row.r_Is_active,
            });
          });
        }
        resolve(residents);
      });
    });
  }

  async insertResident(companyId, resident) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Residents (Id_company, Civility, Lastname, Firstname)
        VALUES (?, ?, ?, ?);
      `;
      await this.connectionMysql.sql(query, [companyId, resident.civility, resident.lastname, resident.firstname], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: `Une erreur est survenue lors de la création du résident : ${resident.firstname} ${resident.lastname}`
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async updateResident(companyId, resident) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Residents
        SET Civility = ?, Lastname = ?, Firstname = ?
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [resident.civility, resident.lastname, resident.firstname, resident.id, companyId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: `Une erreur est survenue lors de la modification du résident : ${resident.firstname} ${resident.lastname}`
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async deleteResident(companyId, id) {
    return new Promise(async (resolve) => {
      const query = `
        UPDATE Residents
        SET Is_active = 0
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [id, companyId], (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression du résident"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async getAllResidentMealConfigsByCompany(id) {
    return new Promise(async (resolve) => {
      const residentMealConfigs = [];
      const query = `
        SELECT rmc.Id AS 'rmc_Id', rmc.Id_resident AS 'rmc_Id_resident', rmc.Date_start AS 'rmc_Date_start', rmc.Date_end AS 'rmc_Date_end', rmc.Created AS 'rmc_Created', mc.Id AS 'mc_Id', mc.Id_kind_meal AS 'mc_Id_kind_meal', mc.Delivery AS 'mc_Delivery', mc.Monday AS 'mc_Monday', mc.Tuesday AS 'mc_Tuesday', mc.Wednesday AS 'mc_Wednesday', mc.Thursday AS 'mc_Thursday', mc.Friday AS 'mc_Friday', mc.Saturday AS 'mc_Saturday', mc.Sunday AS 'mc_Sunday', mc.Public_holiday AS 'mc_Public_holiday'
        FROM Resident_meal_configs rmc
        LEFT JOIN Meal_configs mc ON mc.Id_resident_meal_config = rmc.Id
        WHERE rmc.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            if (!residentMealConfigs.find((rmc) => rmc.id === row.rmc_Id)) {
              residentMealConfigs.push({
                id: row.rmc_Id,
                idResident: row.rmc_Id_resident,
                dateStart: row.rmc_Date_start,
                dateEnd: row.rmc_Date_end,
                created: row.rmc_Created ?? null,
                configs: [],
              });
            }
            const rmc = residentMealConfigs.find((rmc) => rmc.id === row.rmc_Id);
            if (row.mc_Id && rmc) {
              rmc.configs.push({
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
        resolve(residentMealConfigs);
      });
    });
  }

  async insertResidentMealConfig(residentMealConfig) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Resident_meal_configs (Id_resident, Date_start, Date_end)
        VALUES (?, ?, ?);
      `;
      await this.connectionMysql.sql(query, [residentMealConfig.idResident, residentMealConfig.dateStart, residentMealConfig.dateEnd], (result) => {
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

  async updateResidentMealConfig(residentMealConfig) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Resident_meal_configs
        SET Date_start = ?, Date_end = ?
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [residentMealConfig.dateStart, residentMealConfig.dateEnd, residentMealConfig.id], (result) => {
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

  async deleteResidentMealConfig(id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Resident_meal_configs
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [id], (result) => {
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

  async insertMealConfigToResidentMealConfig(residentMealConfigId, mealConfig) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Meal_configs (Id_resident_meal_config, Id_kind_meal, Delivery, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, Public_holiday)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      await this.connectionMysql.sql(query, [residentMealConfigId, mealConfig.idKindMeal, mealConfig.delivery, mealConfig.monday, mealConfig.tuesday, mealConfig.wednesday, mealConfig.thursday, mealConfig.friday, mealConfig.saturday, mealConfig.sunday, mealConfig.publicHoliday], (result) => {
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

  async updateMealConfig(mealConfig) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Meal_configs
        SET Delivery = ?, Monday = ?, Tuesday = ?, Wednesday = ?, Thursday = ?, Friday = ?, Saturday = ?, Sunday = ?, Public_holiday = ?
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [mealConfig.delivery, mealConfig.monday, mealConfig.tuesday, mealConfig.wednesday, mealConfig.thursday, mealConfig.friday, mealConfig.saturday, mealConfig.sunday, mealConfig.publicHoliday, mealConfig.id], (result) => {
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

  async deleteMealConfig(id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Meal_configs
        WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [id], (result) => {
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
}