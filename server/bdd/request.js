module.exports = class Request {
  constructor(connectionMysql) {
    this.connectionMysql = connectionMysql;
  }

  async getAllMenus() {
    return new Promise(async (resolve) => {
      const Menus = [];
      const query = `
        SELECT id, date, midday_starter, midday_dish, midday_dessert, afternoon_starter, afternoon_dish, afternoon_dessert
        FROM menus;
      `;
      await this.connectionMysql.sql(query, [], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            Menus.push({
              id: row.id,
              date: new Date(row.date),
              midday: {
                starter: row.midday_starter,
                dish: row.midday_dish,
                dessert: row.midday_dessert
              },
              afternoon: {
                starter: row.afternoon_starter,
                dish: row.afternoon_dish,
                dessert: row.afternoon_dessert
              }
            });
          });
        }
        resolve(Menus);
      });
    });
  }

  async updateMenu(menu) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE menus
        SET midday_starter = ?, midday_dish = ?, midday_dessert = ?, afternoon_dessert = ?, afternoon_dish = ?, afternoon_dessert = ?
        WHERE Id = ?
      `;
      await this.connectionMysql.sql(query, [menu.midday.starter, menu.midday.dish, menu.midday.dessert, menu.afternoon.starter, menu.afternoon.dish, menu.afternoon.dessert, menu.id], async (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification du menu. Date:"+menu.date
          };
        }
        resolve(info);
      });
    });
  }

  async removeMenu(id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM menus WHERE Id = ?;
      `;
      await this.connectionMysql.sql(query, [id], async (result) => {
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

  async insertMenu(menu) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO menus (date, midday_starter, midday_dish, midday_dessert, afternoon_starter, afternoon_dish, afternoon_dessert) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [menu.date, menu.midday.starter, menu.midday.dish, menu.midday.dessert, menu.afternoon.starter, menu.afternoon.dish, menu.afternoon.dessert], async (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création du menu. Date:"+menu.date
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