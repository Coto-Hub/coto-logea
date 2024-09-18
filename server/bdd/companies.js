require('dotenv').config();
const crypto = require("crypto");

module.exports = class CompaniesRequest {
  constructor(connectionMysql) {
    this.connectionMysql = connectionMysql;
  }

  async checkLogin(login, password) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const hashPassword = crypto
        .createHmac("sha256", process.env.SECRET)
        .update(password)
        .digest("hex");
      const query = `SELECT c.Id FROM Companies c WHERE c.Login = ? AND c.Password = ?`;
      await this.connectionMysql.sql(query, [login, hashPassword], async (result) => {
        const company = (result.rows ?? [])[0] ?? null;
        if (company) {
          info.value = company.Id;
        } else {
          info.alert = {
            error: "Aucun compte trouvé.",
          };
        }
        resolve(info);
      });
    });
  }

  async getCompanyById(id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        SELECT c.Id, c.Name, c.Login, c.Created
        FROM Companies c
        WHERE c.Id = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        const company = (result && result.rows) ? result.rows[0] : null;
        if (company) {
          info.value = {
            id: company.Id,
            name: company.Name,
            login: company.Login,
            created: company.Created,
          };
        }
        resolve(info);
      });
    });
  }

  async updateCompany(id, lastPassword, name, login, newPassword) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Companies
        SET Password = ?, Name = ?, Login = ?
        WHERE Id = ? AND Password = ?;
      `;
      await this.connectionMysql.sql(query, [newPassword, name, login, id, lastPassword], async (result) => {
        if (result.error) {
          info.alert = {
            error: "Il y a eu une erreur lors de la modification de l'entreprise.",
          };
        }
        if (result.rows.affectedRows === 0) {
          info.alert = {
            error: "Le mot de passe de vérification est incorrect.",
          };
        }
        resolve(info);
      });
    });
  }
};
