import moment from "moment";
import { state, socket } from "@/socket";


export function publicHolidayCheck(dateInput) {
    const date = moment(dateInput);
    const annee = date.year();
    const joursFeries = (state.joursFeries && state.joursFeries[annee]) ? state.joursFeries[annee] : joursFeriesFrance(annee);
    state.joursFeries[annee] = joursFeries;

    return joursFeries.some(jf => jf.isSame(date, "day"));
}
export function joursFeriesFrance(annee) {
    const datePaques = moment(equationDePaques(annee));

    return [
        moment(`${annee}-01-01`),                       // Jour de l'an
        // datePaques.clone().subtract(2, "days"),         // Vendredi Saint (en Alsace-Moselle uniquement)
        datePaques,                                     // Pâques
        datePaques.clone().add(1, "days"),              // Lundi de Pâques
        moment(`${annee}-05-01`),                       // Fête du Travail
        moment(`${annee}-05-08`),                       // Victoire 1945
        datePaques.clone().add(39, "days"),             // Ascension
        datePaques.clone().add(49, "days"),             // Pentecôte
        datePaques.clone().add(50, "days"),             // Lundi de Pentecôte
        moment(`${annee}-07-14`),                       // Fête Nationale
        moment(`${annee}-08-15`),                       // Assomption
        moment(`${annee}-11-01`),                       // Toussaint
        moment(`${annee}-11-11`),                       // Armistice
        moment(`${annee}-12-25`)                        // Noël
    ];
}
export function getAllKindMeal(isStaff, date) {
    return state.kindMeals.filter(kd => (!kd.endDate || moment(kd.endDate).isAfter(moment(date))) && (isStaff ? kd.isStaff : true));
}
export function getAllUser(isStaff) {
    return state.users.filter(u => u.isStaff == isStaff).sort((a, b) => {
        if (a.lastname < b.lastname) return -1;
        if (a.lastname > b.lastname) return 1;
        return a.civility - b.civility;
    });
}
export function getConfigForDate(userId, date) {
    const previousConfigs = state.userMealConfigs.filter(c => c.userId == userId)
        .filter(cfg => moment.utc(cfg.dateStart).isSameOrBefore(moment.utc(date, "DD-MM-YYYY")))
        .sort((a, b) => moment.utc(b.dateStart).diff(moment.utc(a.dateStart)));
    return previousConfigs.length > 0 ? previousConfigs[0] : null;
}
export function getEventsForDate(userId, date) {
    return state.userEvents.filter(g => g.userId == userId && g.elements.find(el => moment.utc(date, "DD-MM-YYYY").isBetween(el.dateStart, el.dateEnd, 'day', '[]'))).sort((a, b) => moment(a.created).diff(moment(b.created)));
}
export function getGuestsForDate(userId, date) {
    return state.guests.filter(g => g.userId == userId && g.elements.find(el => moment.utc(date, "DD-MM-YYYY").isBetween(el.dateStart, el.dateEnd, 'day', '[]'))).sort((a, b) => moment(a.created).diff(moment(b.created)));
}
export function getAllUserWithData(isStaff, date) {
    if (!moment.isMoment(date)) {
        return [];
    }
    const allUser = [...getAllUser(isStaff), { id: null }].map(user => {
        let values = null;
        const config = getConfigForDate(user.id, date.format('DD-MM-YYYY'));
        const events = getEventsForDate(user.id, date.format('DD-MM-YYYY'));
        const guests = getGuestsForDate(user.id, date.format('DD-MM-YYYY'));

        if (user.id !== null) {
            if ((!config || config.dateEnd && moment(config.dateEnd).isBefore(date)) && !isStaff) {
                return null;
            }
            values = getAllKindMeal(isStaff, date).map((kd) => {
                const dayEvents = [];
                let returnValue = {};
                events.forEach((ev) => {
                    ev.elements.forEach((el) => {
                        if (el.idKindMeal == kd.id && date.isBetween(moment(el.dateStart), moment(el.dateEnd), 'day', '[]')) {
                            dayEvents.push(el);
                        }
                    });
                });

                if (config && config.elements.find(el => el.idKindMeal == kd.id)) {
                    const conf = config.elements.find(el => el.idKindMeal == kd.id);

                    if (conf.publicHoliday == 0 && publicHolidayCheck(date)) {
                        returnValue = {
                            meal: false,
                            delivery: false,
                            isMealEvent: true,
                        };
                    }
                    else {
                        returnValue = {
                            meal: conf[moment(date).locale('en').format('dddd').toLowerCase()] || false,
                            delivery: (conf[moment(date).locale('en').format('dddd').toLowerCase()] && conf.delivery) || false,
                        };
                    }
                }
                else {
                    returnValue = {
                        meal: false,
                        delivery: false,
                    };
                }
                const defaultValue = { ...returnValue };
                dayEvents.forEach((ev) => {
                    if (ev.isAbsence) {
                        returnValue = {
                            meal: false,
                            delivery: false,
                            isMealEvent: true,
                        };
                    }
                    else {
                        returnValue = {
                            meal: true,
                            delivery: ev.delivery ? true : false,
                            isMealEvent: defaultValue.meal ? false : true,
                            isDeliveryEvent: ev.delivery != defaultValue.delivery,
                        };
                    }
                });
                return {
                    id: kd.id,
                    deliveryId: kd.deliveryId,
                    ...returnValue,
                };
            });
        }
        const guestsValues = guests.filter(g => g.isStaff == isStaff).map(g => {
            let dateStart = null;
            let dateEnd = null;
            const gValues = getAllKindMeal(isStaff, date).map((kd) => {
                let returnValue = {};
                const element = g.elements ? g.elements.find(el => el.idKindMeal == kd.id && moment(el.dateStart).format("YYYY-MM-DD") <= date.format("YYYY-MM-DD") && moment(el.dateEnd).format("YYYY-MM-DD") >= date.format("YYYY-MM-DD")) : null;
                if (element) {
                    returnValue = {
                        meal: true,
                    };
                    if (!dateStart || (moment.utc(element.dateStart).isBefore(moment(dateStart, 'DD/MM/YYYY')))) {
                        dateStart = moment.utc(element.dateStart).format('DD/MM/YYYY');
                    }
                    if (!dateEnd || (moment.utc(element.dateEnd).isAfter(moment(dateEnd, 'DD/MM/YYYY')))) {
                        dateEnd = moment.utc(element.dateEnd).format('DD/MM/YYYY');
                    }
                }
                else {
                    returnValue = {
                        meal: false,
                    };
                }
                return {
                    id: kd.id,
                    ...returnValue,
                };
            });
            return {
                id: g.id,
                nbGuests: g.nbGuests,
                label: g.label,
                info: g.info,
                values: gValues,
                dateStart: dateStart,
                dateEnd: dateEnd
            };
        });
        if (user.id == null && !guestsValues.length) {
            return null;
        }

        return {
            ...user,
            values,
            guests: guestsValues,
        };
    }).filter(u => u != null);
    return allUser;
}
export function equationDePaques(annee) {
    const a = annee % 19;
    const b = Math.floor(annee / 100);
    const c = annee % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mois = Math.floor((h + l - 7 * m + 114) / 31);
    const jour = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(annee, mois - 1, jour);
}

export default {
    publicHolidayCheck,
    joursFeriesFrance,
    getAllKindMeal,
    getAllUser,
    getConfigForDate,
    getEventsForDate,
    getGuestsForDate,
    getAllUserWithData,
    equationDePaques
};