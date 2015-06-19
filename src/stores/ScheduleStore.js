// Generated by CoffeeScript 1.9.3
var ScheduleStore, createStore;

createStore = require('fluxible/addons').createStore;

ScheduleStore = createStore({
  storeName: 'ScheduleStore',
  handlers: {
    'UPDATE_SCHEDULE': 'updateSchedule',
    'RECEIVE_SCHEDULE': 'getSchedule'
  },
  initialize: function() {
    console.log("ScheduleStore initialize");
    return this.schedule = [];
  },
  getSchedule: function() {
    console.log("ScheduleStore: getSchedule()");
    console.log(this.schedule.length);
    return this.schedule;
  },
  updateSchedule: function(schedule) {
    console.log("ScheduleStore: updateSchedule()");
    this.schedule = schedule;
    return console.log(this.schedule.length);
  },
  dehydrate: function() {
    console.log("ScheduleStore: dehydrate");
    return {
      schedule: this.schedule
    };
  },
  redydrate: function(state) {
    console.log("ScheduleStore: redydrate");
    return this.schedule = state.schedule;
  }
});

module.exports = ScheduleStore;
