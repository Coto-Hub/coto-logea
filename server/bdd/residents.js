module.exports = class ResidentsRequest {
  constructor(connectionMysql) {
    this.connectionMysql = connectionMysql;
  }

  async getAllResidentsByCompany(id) {
    return new Promise(async (resolve) => {
      const Residents = [];
      const query = `
        SELECT r.Id AS 'r_Id', r.Floor AS 'r_Floor', r.Room AS 'r_Room', r.Civility AS 'r_Civility', r.Lastname AS 'r_Lastname', r.Firstname AS 'r_Firstname', r.Birthday AS 'r_Birthday', r.Is_active AS 'r_Is_active', c.Id AS 'c_Id', c.Civility AS 'c_Civility', c.Firstname AS 'c_Firstname', c.Lastname AS 'c_Lastname', c.Email AS 'c_Email', c.Phone AS 'c_Phone'
        FROM Residents r LEFT OUTER JOIN Contacts c 
        ON r.Id = c.Id_resident AND r.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            if (!Residents.find(r => r.id == row.r_Id)) {
              Residents.push({
                id: row.r_Id,
                floor: !isNaN(row.r_Floor) ? parseInt(row.r_Floor) : null,
                room: !isNaN(row.r_Room) ? parseInt(row.r_Room) : null,
                civility: row.r_Civility,
                lastname: row.r_Lastname,
                firstname: row.r_Firstname,
                birthday: row.r_Birthday ? row.r_Birthday : null,
                isActive: row.r_Is_active,
                contacts: []
              });
            }
            const resident = Residents.find(r => r.id == row.r_Id);
            if (row.c_Id) {
              resident.contacts.push({
                id: row.c_Id,
                civility: row.c_Civility,
                lastname: row.c_Lastname,
                firstname: row.c_Firstname,
                email: row.c_Email,
                phone: row.c_Phone,
              });
            }
          });
        }
        resolve(Residents);
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
        SET Floor = ?, Room = ?, Civility = ?, Lastname = ?, Firstname = ?, Birthday = ?, Is_active = ?
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [resident.floor ?? null, resident.room ?? null, resident.civility ?? 'Mme', resident.lastname, resident.firstname, resident.birthday, resident.isActive ?? 1, resident.id, companyId], async (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification du resident. Nom:" + resident.lastname
          };
        }
        resolve(info);
      });
    });
  }

  async updateResidentStatus(companyId, residentId, is_active) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Residents
        SET Is_active = ?
        WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [is_active, residentId, companyId], async (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification du resident. Nom:" + resident.lastname
          };
        }
        resolve(info);
      });
    });
  }

  async removeResident(companyId, id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        DELETE FROM Residents WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [id, companyId], async (result) => {
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

  async insertResidentInCompany(companyId, resident) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Residents (Id_company, Floor, Room, Civility, Lastname, Firstname, Birthday, Is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [companyId, resident.floor ? resident.floor : null, resident.room ? resident.room : null, resident.civility ? resident.civility : 'Mme', resident.lastname, resident.firstname, resident.birthday, (resident.isActive == parseInt(resident.isActive)) ? resident.isActive : 1], async (result) => {
        console.log(result);
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création du resident. Nom:" + resident.lastname
          };
        }
        if (result.rows && result.rows.insertId) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async insertResidentContact(contact) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Contacts (Id_resident, Civility, Firstname, Lastname, Email, Phone) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [contact.residentId, contact.civility ? contact.civility : 'Mme', contact.firstname, contact.lastname, contact.email, contact.phone], async (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création du contact. Nom:" + contact.lastname
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