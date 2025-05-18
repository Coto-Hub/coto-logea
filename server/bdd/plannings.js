module.exports = class ResidentsRequest {
  constructor(connectionMysql) {
    this.connectionMysql = connectionMysql;
  }

  // async getAllPlanningsByCompany(id) {
  //   return new Promise(async (resolve) => {
  //     const Plannings = [];
  //     const query = `
  //       SELECT p.Id AS 'p_Id', p.Date_Hour AS 'p_Date_Hour', p.Content AS 'p_Content'
  //       FROM Plannings p WHERE p.Id_company = ?;
  //     `;
  //     await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
  //       if (result.rows && result.rows.length) {
  //         result.rows.map((row) => {
  //           const elementDate = new Date(row.p_Date_Hour);
  //           if (!Plannings.find(r => r.date == elementDate.setHours(0, 0, 0, 0))) {
  //             Plannings.push({
  //               date: new Date(row.p_Date_Hour).setHours(0, 0, 0, 0),
  //               activities: [],
  //             });
  //           }
  //           const planning = Plannings.find(r => r.date == new Date(row.p_Date_Hour).setHours(0, 0, 0, 0));
  //           planning.activities.push({
  //             hour: `${elementDate.getHours()}:${elementDate.getMinutes()}`,
  //             id: row.p_Id,
  //             dateTime: row.p_Date_Hour,
  //             content: row.p_Content,
  //           });
  //         });
  //       }
  //       resolve(Plannings);
  //     });
  //   });
  // }

  async getAllDecorationsByCompany(id) {
    return new Promise(async (resolve) => {
      const Decorations = [];
      const query = `
        SELECT d.Id AS 'd_Id', d.Date AS 'd_Date', d.Id_icon AS 'd_Id_icon', d.Type AS 'd_Type'
        FROM Decorations d WHERE d.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            Decorations.push({
              id: row.d_Id,
              date: row.d_Date,
              iconId: row.d_Id_icon,
              placementChoice: row.d_Type,
            });
          });
        }
        resolve(Decorations);
      });
    });
  }

  async getAllAnimationsByCompany(id) {
    return new Promise(async (resolve) => {
      const Animations = [];
      const query = `
        SELECT a.Id AS 'a_Id', a.Label AS 'a_Label', a.Is_active AS 'a_Is_active', i.Id AS 'i_Id', i.Label AS 'i_Label', i.Path AS 'i_Path'
        FROM Animations a 
        LEFT OUTER JOIN Icons i ON a.Id = i.Id_animation WHERE a.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            if (!Animations.find(r => r.id == row.a_Id)) {
              Animations.push({
                id: row.a_Id,
                label: row.a_Label,
                icons: [],
                isActive: row.a_Is_active
              });
            }
            if (row.i_Id) {
              const animation = Animations.find(r => r.id == row.a_Id);
              animation.icons.push({
                id: row.i_Id,
                label: row.i_Label,
                path: row.i_Path,
              });
            }
          });
        }
        resolve(Animations);
      });
    });
  }

  async getAllReccurencesByCompany(id) {
    return new Promise(async (resolve) => {
      const Reccurences = [];
      const query = `
        SELECT r.Id AS 'r_Id', r.Id_animation AS 'r_Id_animation', r.Day AS 'r_Day', r.Hour AS 'r_Hour'
        FROM Reccurences r, Animations a WHERE r.Id_animation = a.Id AND a.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            Reccurences.push({
              id: row.r_Id,
              animationId: row.r_Id_animation,
              day: row.r_Day,
              time: row.r_Hour
            });
          });
        }
        resolve(Reccurences);
      });
    });
  }

  async getAllPlanningsByCompany(id) {
    return new Promise(async (resolve) => {
      const Plannings = [];
      const query = `
        SELECT p.Id AS 'p_Id', p.Id_animation AS 'p_Id_animation' ,p.Date_Hour AS 'p_Date_Hour', p.Content AS 'p_Content'
        FROM Plannings p WHERE p.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            Plannings.push({
              id: row.p_Id,
              animationId: row.p_Id_animation,
              dateTime: row.p_Date_Hour,
              content: row.p_Content
            });
          });
        }
        resolve(Plannings);
      });
    });
  }

  async getAllMonthConfigByCompany(id) {
    return new Promise(async (resolve) => {
      const MonthConfigs = [];
      const query = `
        SELECT mc.Id AS 'mc_Id', mc.Month AS 'mc_Month', mc.Color_text AS 'mc_Color_text', mc.Color_date AS 'mc_Color_date', mc.Color_background AS 'mc_Color_background', mc.Id_icon_left AS 'mc_Id_icon_left', mc.Id_icon_right AS 'mc_Id_icon_right'
        FROM Month_configs mc WHERE mc.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            MonthConfigs.push({
              id: row.mc_Id,
              month: row.mc_Month,
              text: row.mc_Color_text,
              date: row.mc_Color_date,
              background: row.mc_Color_background,
              iconLeftId: row.mc_Id_icon_left,
              iconRightId: row.mc_Id_icon_right
            });
          });
        }
        resolve(MonthConfigs);
      });
    });
  }

  async getAllWeekConfigByCompany(id) {
    return new Promise(async (resolve) => {
      const WeekConfigs = [];
      const query = `
        SELECT wc.Id AS 'wc_Id', wc.Week AS 'wc_Week', wc.Color_text AS 'wc_Color_text', wc.Color_background AS 'wc_Color_background'
        FROM Week_configs wc WHERE wc.Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [parseInt(id)], (result) => {
        if (result.rows && result.rows.length) {
          result.rows.map((row) => {
            WeekConfigs.push({
              id: row.wc_Id,
              week: row.wc_Week,
              text: row.wc_Color_text,
              background: row.wc_Color_background,
            });
          });
        }
        resolve(WeekConfigs);
      });
    });
  }

  async updateAnimation(companyId, anim) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Animations SET Label = ? WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [anim.label, anim.id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de l'animation. Nom:" + anim.label
          };
        }
        resolve(info);
      });
    });
  }

  async updateReccurence(companyId, reccurence) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Reccurences SET Day = ?, Hour = ? WHERE Id = ? AND Id_animation IN (SELECT Id FROM Animations WHERE Id_company = ?);
      `;
      await this.connectionMysql.sql(query, [reccurence.day, reccurence.time, reccurence.id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de la récurrence"
          };
        }
        resolve(info);
      });
    });
  }

  async updateAnimationPlanning(companyId, planning) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Plannings SET Date_hour = ?, Content = ? WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [planning.dateTime, planning.content, planning.id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de l'animation"
          };
        }
        resolve(info);
      });
    });
  }

  async updateDecoration(companyId, decoration) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Decorations SET Id_icon = ?, Type = ? WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [decoration.iconId, decoration.placementChoice, decoration.id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de la décoration"
          };
        }
        resolve(info);
      });
    });
  }

  async updateMonthConfig(companyId, config) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Month_configs SET Color_text = ?, Color_date = ?, Color_background = ?, Id_icon_left = ?, Id_icon_right = ? WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [config.text, config.date, config.background, config.iconLeft.id, config.iconRight.id, config.id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification de la configuration du mois"
          };
        }
        resolve(info);
      });
    });
  }

  async updateWeekConfig(companyId, config) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        UPDATE Week_configs SET Color_text = ?, Color_background = ? WHERE Id = ? AND Id_company = ?;
      `;
      await this.connectionMysql.sql(query, [config.text, config.background, config.id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la modification du planning de la semaine"
          };
        }
        resolve(info);
      });
    });
  }

  async disabledAnimation(companyId, id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `UPDATE Animations SET Is_active = 0 WHERE Id = ? AND Id_company = ?;`;
      await this.connectionMysql.sql(query, [id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de l'animation."
          };
        }
        resolve(info);
      });
    });
  }

  async removeReccurence(companyId, id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `DELETE FROM Reccurences WHERE Id = ? AND Id_animation IN (SELECT Id FROM Animations WHERE Id_company = ?);`;
      await this.connectionMysql.sql(query, [id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de la récurrence."
          };
        }
        resolve(info);
      });
    });
  }

  async removeAnimationPlanning(companyId, id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `DELETE FROM Plannings WHERE Id = ? AND Id_company = ?;`;
      await this.connectionMysql.sql(query, [id, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de l'animation."
          };
        }
        resolve(info);
      });
    });
  }

  async removeDecoration(companyId, id) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `DELETE FROM Decorations WHERE Id = ? AND Id_company = ?;`;
      await this.connectionMysql.sql(query, [id, companyId], async (result) => {
        if (result.error) {
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de la décoration."
          };
        }
        resolve(info);
      });
    });
  }

  async removeDecorationFromAnimation(companyId, planningId) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
      DELETE d
      FROM Decorations d 
      JOIN Plannings p ON DATE(d.Date) = DATE(p.Date_hour)
      JOIN Icons i ON d.Id_icon = i.Id
      WHERE i.Id_animation = p.Id_animation AND p.Id = ? AND p.Id_company = ?;`;
      await this.connectionMysql.sql(query, [planningId, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression de la decoration."
          };
        }
        resolve(info);
      });
    });
  }

  async removeIconAnimation(companyId, animationId, icons) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
      DELETE FROM Icons WHERE Id_animation = ? AND Id IN (?);
      UPDATE Month_configs SET Id_icon_left = NULL WHERE Id_company = ? AND Id_icon_left IN (?);
      UPDATE Month_configs SET Id_icon_right = NULL WHERE Id_company = ? AND Id_icon_right IN (?);
      DELETE FROM Decorations WHERE Id_company = ? AND Id_icon IN (?);
      `;
      await this.connectionMysql.sql(query, [animationId, icons, companyId, icons, companyId, icons, companyId, icons], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la supression des icons."
          };
        }
        resolve(info);
      });
    });
  }

  async initAnimationPlanning(companyId, animations) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Plannings (Id_company, Date_hour, Content, Id_animation) 
        VALUES ?
      `;
      const values = [];
      animations.map((a) => {
        values.push([companyId, a.dateTime, a.content, a.animationId])
      });
      await this.connectionMysql.sql(query, [values], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création des animation"
          };
        }
        resolve(info);
      });
    });
  }

  async insertAnimation(companyId, anim) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Animations (Id_company, Label) 
        VALUES (?, ?)
      `;
      await this.connectionMysql.sql(query, [companyId, anim.label], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de l'animation. Nom:" + resident.lastname
          };
        }
        if (result.rows && result.rows.insertId) {
          info.value = result.rows.insertId;
          await this.insertIconAnimation(result.rows.insertId, anim.icons);
        }
        resolve(info);
      });
    });
  }

  async insertReccurenceAnimation(reccurence) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Reccurences (Id_animation, Day, Hour) 
        VALUES (?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [reccurence.animationId, reccurence.day, reccurence.time], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de la récurrence"
          };
        }
        if (result.rows && result.rows.insertId) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async insertIconAnimation(animationId, icons) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Icons (Id_animation, Label, Path) 
        VALUES ?
      `;
      const values = [];
      icons.map((i) => {
        values.push([animationId, i.label.replace(`.${i.label.split('.').pop()}`, ''), i.path])
      });
      await this.connectionMysql.sql(query, [values], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création des icons"
          };
        }
        if (result.rows) {
          info.value = true;
        }
        resolve(info);
      });
    });
  }

  async insertIconDefault(companyId, icon) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Icons (Id_animation, Label, Path) 
        SELECT a.Id, ?, ?
        FROM Animations a WHERE a.Id_company = ? AND a.Label = ""; 
      `;
      await this.connectionMysql.sql(query, [icon.label.replace(`.${icon.label.split('.').pop()}`, ''), icon.path, companyId], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de l'image"
          };
        }
        if (result.rows) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async insertAnimationPlanning(companyId, planning) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Plannings (Id_company, Date_hour, Content, Id_animation) 
        VALUES (?, ?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [companyId, planning.dateTime, planning.content, planning.animationId ?? null], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de l'animation"
          };
        }
        if (result.rows && result.rows.insertId) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async insertDecoration(companyId, decoration) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Decorations (Id_company, Date, Id_icon, Type) 
        VALUES (?, ?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [companyId, decoration.date, decoration.iconId, decoration.placementChoice], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de la création de la décoration"
          };
        }
        if (result.rows && result.rows.insertId) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async insertMonthConfig(companyId, config) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Month_configs (Id_company, Month, Color_text, Color_date, Color_background, Id_icon_left, Id_icon_right) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [companyId, config.month, config.text, config.date, config.background, config.iconLeft.id, config.iconRight.id], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de l'enregistrement de la configuration du mois"
          };
        }
        if (result.rows && result.rows.insertId) {
          info.value = result.rows.insertId;
        }
        resolve(info);
      });
    });
  }

  async insertWeekConfig(companyId, config) {
    return new Promise(async (resolve) => {
      const info = {
        alert: null,
        value: null,
      };
      const query = `
        INSERT INTO Week_configs (Id_company, Week, Color_text, Color_background) 
        VALUES (?, ?, ?, ?)
      `;
      await this.connectionMysql.sql(query, [companyId, config.week, config.text, config.background], async (result) => {
        if (result.error) {
          console.log(result.error);
          info.alert = {
            title: 'Erreur',
            error: "Une erreur est survenue lors de l'enregistrement de la configuration de la semaine"
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