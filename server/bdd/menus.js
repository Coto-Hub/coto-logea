module.exports = class Request {
  constructor(connectionMysql) {
    this.connectionMysql = connectionMysql;
  }

  async getAllMenusByCompany(id) {
    return new Promise(async (resolve) => {
      const Menus = [];
      const query = `
        SELECT Id, Midday_starter, Midday_dish, Midday_dessert, Afternoon_starter, Afternoon_dish, Afternoon_dessert, Day
        FROM Menus WHERE Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            Menus.push({
              id: row.id,
              date: row.Day,
              midday: {
                starter: row.Midday_starter,
                dish: row.Midday_dish,
                dessert: row.Midday_dessert
              },
              afternoon: {
                starter: row.Afternoon_starter,
                dish: row.Afternoon_dish,
                dessert: row.Afternoon_dessert
              }
            });
          });
        }
        resolve(Menus);
      });
    });
  }

  async getMenuCompany(id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const currentDateTime = new Date().addHours(2).toISOString().slice(0, 10).replace("T", " ");
      const query = `
        SELECT Id, Midday_starter, Midday_dish, Midday_dessert, Afternoon_starter, Afternoon_dish, Afternoon_dessert, Day
        FROM Menus WHERE Id_company = ? AND Day = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id), currentDateTime], (result) => {
        const row = (result.rows && result.rows.length) ? result.rows[0] : null;
        if (row) {
          info.value = {
            id: row.Id,
            date: row.Day,
            midday: {
              starter: row.Midday_starter,
              dish: row.Midday_dish,
              dessert: row.Midday_dessert
            },
            afternoon: {
              starter: row.Afternoon_starter,
              dish: row.Afternoon_dish,
              dessert: row.Afternoon_dessert
            }
          };
        }
        resolve(info);
      });
    });
  }

  async updateMenu(companyId, menu) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Menus
        SET Midday_starter = ?, Midday_dish = ?, Midday_dessert = ?, Afternoon_starter = ?, Afternoon_dish = ?, Afternoon_dessert = ?
        WHERE Day = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [menu.midday.starter, menu.midday.dish, menu.midday.dessert, menu.afternoon.starter, menu.afternoon.dish, menu.afternoon.dessert, menu.date, companyId], async (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification du menu. Date:" + menu.date
          };
        }
        resolve(info);
      });
    });
  }

  async removeMenu(companyId, date) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Menus WHERE Day = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [date, companyId], async (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue.",
            disconnect: true,
          };
        }
        resolve(info);
      });
    });
  }

  async insertMenuInCompany(companyId, menu) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Menus (Id_company, Day, Midday_starter, Midday_dish, Midday_dessert, Afternoon_starter, Afternoon_dish, Afternoon_dessert) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [companyId, menu.date, menu.midday.starter, menu.midday.dish, menu.midday.dessert, menu.afternoon.starter, menu.afternoon.dish, menu.afternoon.dessert], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création du menu. Date:" + menu.date
          };
        }
        if (result.rows && result.rows.insertId) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }
}

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + (h * 60 * 60 * 1000));
  return this;
}
