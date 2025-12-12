<script>
import ExportPageComponent from "@/components/ExportPage.vue";
import { state } from "@/socket";
import moment from "moment";
import util from '@/util';

export default {
  components: {
    ExportPageComponent,
  },
  props: {
  },
  data() {
    return {
      date: null,
      period: null,
    }
  },
  mounted() {
    this.period = this.$route.params.period;
    this.date = (this.period == 'months') ? moment(`01-${this.$route.params.date}`, 'DD-MM-YYYY') : moment(this.$route.params.date, 'DD-MM-YYYY');
  },
  methods: {
    getTableData(isStaff) {
      const kindMeals = util.getAllKindMeal(isStaff);

      if (!this.date || !kindMeals) return { kindMeals: [], rows: [] };
      const filteredKindMeals = [];
      const rowsList = [];
      const listDates = [moment(this.date)];
      if (this.period == 'months') {
        const daysInMonth = this.date.daysInMonth();
        for (let d = 2; d <= daysInMonth; d++) {
          listDates.push(moment(`${d}-${this.date.format('MM-YYYY')}`, 'DD-MM-YYYY'));
        }
      }

      listDates.forEach((currentDate) => {
        util.getAllUserWithData(isStaff, currentDate).forEach((user) => {
          if (user.id == null) {
            user.guests.forEach(g => {
              if (g.values) {
                const obj = {
                  id: null,
                  userLabel: g.label,
                  mealsList: [],
                  guestMealsList: [],
                  eatingArea: {
                    midday: null,
                    evening: null,
                  },
                  delivery: {
                    midday: { value: 0, isEvent: false },
                    evening: { value: 0, isEvent: false },
                  },
                  infos: [],
                };
                kindMeals.forEach((kd) => {
                  const guestMeal = g.values.find(v => v.id == kd.id);
                  if (guestMeal && kd.canGuest) {
                    obj.guestMealsList.push({
                      id: kd.id,
                      value: guestMeal.meal ? g.nbGuests : 0,
                    });
                    if (guestMeal.meal && g.info) {
                      const label = `${g.info} (${kd.abbreviation})`;
                      const currentInfo = obj.infos.find(i => i.label == label);
                      if (currentInfo) {
                        currentInfo.nb += g.nbGuests;
                      }
                      else {
                        obj.infos.push({ label: label, nb: g.nbGuests });
                      }
                    }
                  }
                });
                rowsList.push(obj);
              }
            });
          }
          else {
            if (!rowsList.find(r => r.userLabel == `${user.lastname} ${user.firstname}`)) {
              rowsList.push({
                id: user.id,
                userLabel: `${user.lastname} ${user.firstname}`,
                mealsList: [],
                guestMealsList: [],
                eatingArea: {
                  midday: user.eatingArea,
                  evening: user.eatingArea,
                },
                delivery: {
                  midday: { value: 0, isEvent: false },
                  evening: { value: 0, isEvent: false },
                },
                eating: {
                  midday: false,
                  evening: false,
                },
                infos: [],
              });
            }
            const current = rowsList.find(r => r.userLabel == `${user.lastname} ${user.firstname}`);
            if (current) {
              kindMeals.forEach((kd) => {
                const userMeal = user.values ? user.values.find(v => v.id == kd.id) : null;
                if (userMeal) {
                  const meal = current.mealsList.find(m => m.id == kd.id);
                  if (!meal) {
                    current.mealsList.push({
                      id: kd.id,
                      value: userMeal.meal ? 1 : 0,
                      isEvent: userMeal.isMealEvent || false,
                    });
                  } else {
                    if (userMeal.meal) {
                      meal.value += 1;
                    }
                    meal.isEvent = meal.isEvent || userMeal.isMealEvent;
                  }
                  if ([1, 2].includes(kd.deliveryId)) {
                    if (kd.deliveryId == 1) {
                      current.delivery.midday.value += userMeal.delivery ? 1 : 0;
                      if (userMeal.isDeliveryEvent) {
                        current.delivery.midday.isEvent = true;
                      }
                    } else if (kd.deliveryId == 2) {
                      current.delivery.evening.value += userMeal.delivery ? 1 : 0;
                      if (userMeal.isDeliveryEvent) {
                        current.delivery.evening.isEvent = true;
                      }
                    }
                  }
                  if (!filteredKindMeals.find(kdF => kdF.id == kd.id)) {
                    filteredKindMeals.push({
                      id: kd.id,
                      label: kd.label,
                      abbreviation: kd.abbreviation,
                      deliveryId: kd.deliveryId,
                      canGuest: kd.canGuest,
                      order: kd.order,
                    });
                  }
                }
                if (kd.canGuest) {
                  if (user.guests && user.guests.length) {
                    user.guests.forEach((g) => {
                      const meal = current.guestMealsList.find(m => m.id == kd.id);
                      const guestMeal = g.values.find(v => v.id == kd.id);
                      if (!meal) {
                        current.guestMealsList.push({
                          id: kd.id,
                          value: guestMeal && guestMeal.meal ? g.nbGuests : 0,
                        });
                      } else {
                        if (guestMeal && guestMeal.meal) {
                          meal.value += g.nbGuests;
                        }
                      }
                      if (guestMeal && guestMeal.meal && g.info) {
                        const label = `${g.info} (${kd.abbreviation})`;
                        const currentInfo = current.infos.find(i => i.label == label);
                        if (currentInfo) {
                          currentInfo.nb += g.nbGuests;
                        }
                        else {
                          current.infos.push({ label: label, nb: g.nbGuests });
                        }
                      }
                    });
                  }
                  else if (!isStaff) {
                    const meal = current.guestMealsList.find(m => m.id == kd.id);
                    if (!meal) {
                      current.guestMealsList.push({
                        id: kd.id,
                        value: 0,
                      });
                    }
                  }
                }
              });
              if (current.delivery.midday.value > 0) {
                current.eatingArea.midday = "Étage";
              }
              if (current.delivery.evening.value > 0) {
                current.eatingArea.evening = "Étage";
              }
              if (current.mealsList.find(m => m.value > 0 && kindMeals.find(kd => kd.id == m.id && kd.deliveryId == 1))) {
                current.eating.midday = true;
              }
              if (current.mealsList.find(m => m.value > 0 && kindMeals.find(kd => kd.id == m.id && kd.deliveryId == 2))) {
                current.eating.evening = true;
              }
            }
          }
        });
      });

      // util.getAllUserWithData(isStaff, this.date).forEach((user) => {
      //   if (user.id == null) {
      //     user.guests.forEach(g => {
      //       if (g.values) {
      //         const obj = {
      //           id: null,
      //           userLabel: g.label,
      //           mealsList: [],
      //           guestMealsList: [],
      //           eatingArea: {
      //             midday: null,
      //             evening: null,
      //           },
      //           delivery: {
      //             midday: { value: 0, isEvent: false },
      //             evening: { value: 0, isEvent: false },
      //           }
      //         };
      //         kindMeals.forEach((kd) => {
      //           const guestMeal = g.values.find(v => v.id == kd.id);
      //           if (guestMeal && kd.canGuest) {
      //             obj.guestMealsList.push({
      //               id: kd.id,
      //               value: guestMeal.meal ? g.nbGuests : 0,
      //             });
      //           }
      //         });
      //         rowsList.push(obj);
      //       }
      //     });
      //   }
      //   else {
      //     if (!rowsList.find(r => r.userLabel == `${user.lastname} ${user.firstname}`)) {
      //       rowsList.push({
      //         id: user.id,
      //         userLabel: `${user.lastname} ${user.firstname}`,
      //         mealsList: [],
      //         guestMealsList: [],
      //         eatingArea: {
      //           midday: user.eatingArea,
      //           evening: user.eatingArea,
      //         },
      //         delivery: {
      //           midday: { value: 0, isEvent: false },
      //           evening: { value: 0, isEvent: false },
      //         },
      //         eating: {
      //           midday: false,
      //           evening: false,
      //         },
      //       });
      //     }
      //     const current = rowsList.find(r => r.userLabel == `${user.lastname} ${user.firstname}`);
      //     if (current) {
      //       kindMeals.forEach((kd) => {
      //         const userMeal = user.values ? user.values.find(v => v.id == kd.id) : null;
      //         if (userMeal) {
      //           const meal = current.mealsList.find(m => m.id == kd.id);
      //           if (!meal) {
      //             current.mealsList.push({
      //               id: kd.id,
      //               value: userMeal.meal ? 1 : 0,
      //               isEvent: userMeal.isMealEvent || false,
      //             });
      //           } else {
      //             if (userMeal.meal) {
      //               meal.value += 1;
      //             }
      //             meal.isEvent = meal.isEvent || userMeal.isMealEvent;
      //           }
      //           if ([1, 2].includes(kd.deliveryId)) {
      //             if (kd.deliveryId == 1) {
      //               current.delivery.midday.value += userMeal.delivery ? 1 : 0;
      //               if (userMeal.isDeliveryEvent) {
      //                 current.delivery.midday.isEvent = true;
      //               }
      //             } else if (kd.deliveryId == 2) {
      //               current.delivery.evening.value += userMeal.delivery ? 1 : 0;
      //               if (userMeal.isDeliveryEvent) {
      //                 current.delivery.evening.isEvent = true;
      //               }
      //             }
      //           }
      //           if (!filteredKindMeals.find(kdF => kdF.id == kd.id)) {
      //             filteredKindMeals.push({
      //               id: kd.id,
      //               label: kd.label,
      //               abbreviation: kd.abbreviation,
      //               deliveryId: kd.deliveryId,
      //               canGuest: kd.canGuest,
      //               order: kd.order,
      //             });
      //           }
      //         }
      //         if (kd.canGuest) {
      //           if (user.guests && user.guests.length) {
      //             user.guests.forEach((g) => {
      //               const meal = current.guestMealsList.find(m => m.id == kd.id);
      //               const guestMeal = g.values.find(v => v.id == kd.id);
      //               if (!meal) {
      //                 current.guestMealsList.push({
      //                   id: kd.id,
      //                   value: guestMeal && guestMeal.meal ? g.nbGuests : 0,
      //                 });
      //               } else {
      //                 if (guestMeal && guestMeal.meal) {
      //                   meal.value += g.nbGuests;
      //                 }
      //               }
      //             });
      //           }
      //           else if (!isStaff) {
      //             const meal = current.guestMealsList.find(m => m.id == kd.id);
      //             if (!meal) {
      //               current.guestMealsList.push({
      //                 id: kd.id,
      //                 value: 0,
      //               });
      //             }
      //           }
      //         }
      //       });
      //       if (current.delivery.midday.value > 0) {
      //         current.eatingArea.midday = "Étage";
      //       }
      //       if (current.delivery.evening.value > 0) {
      //         current.eatingArea.evening = "Étage";
      //       }
      //       if (current.mealsList.find(m => m.value > 0 && kindMeals.find(kd => kd.id == m.id && kd.deliveryId == 1))) {
      //         current.eating.midday = true;
      //       }
      //       if (current.mealsList.find(m => m.value > 0 && kindMeals.find(kd => kd.id == m.id && kd.deliveryId == 2))) {
      //         current.eating.evening = true;
      //       }
      //     }
      //   }
      // });

      return {
        kindMeals: isStaff ? kindMeals : filteredKindMeals.sort((a, b) => a.order - b.order),
        rows: rowsList,
      };
    },
    printExport() {
      window.print();
    },
  },
  computed: {
    getCurrentDay() {
      if (!this.date) return '';
      return (this.period == 'months') ? `mois de ${this.date.format('MMMM')}` : this.date.format('dddd DD MMMM');
    }
  }
}
</script>

<template>
  <main class="export-meals-view">
    <h1 @click="printExport">Export du {{ getCurrentDay }}</h1>
    <div class="container export-container">
      <ExportPageComponent :isStaff="false" :period="period" :date="date" :tableData="getTableData(false)" />
      <ExportPageComponent :isStaff="true" :period="period" :date="date" :tableData="getTableData(true)" />
    </div>
  </main>
</template>

<style lang="scss">
@page {
  size: A4;
  margin: 0px;
}

@media print {

  body #app header,
  .export-meals-view h1 {
    @apply hidden;
  }

  .export-meals-view .export-container {
    @apply absolute inset-x-0 top-0 flex-col w-full h-auto max-w-none max-h-none p-0 m-0;

    .export-page-component {
      @apply w-full break-after-page shadow-none m-0 px-5;
      aspect-ratio: auto;

      h2 {
        @apply pb-6;
      }

      table {
        @apply leading-3;
        font-size: 0.6rem;
        // @apply w-auto;

        tr td {
          @apply min-w-8;
          print-color-adjust: exact;

          &:first-child {
            @apply min-w-32;
          }
        }

        &.staff-table {
          tr td {
            @apply min-w-20;

            &:first-child {
              @apply min-w-40;
            }
          }
        }

        tr td:first-child {
          @apply px-1;
        }
      }
    }
  }

  header,
  footer,
  nav,
  .no-print {
    display: none !important;
  }
}
</style>
