// Generated by CoffeeScript 1.7.1
(function() {
  var App, AppView, Schedule, ScheduleList, ScheduleView, Schedules;
  Schedule = Backbone.Model.extend();
  ScheduleList = Backbone.Collection.extend({
    model: Schedule,
    url: 'api/list/',
    nextItem: function() {
      if (!this.length) {
        return 1;
      }
      return this.last().get('order') + 1;
    },
    comparator: 'order'
  });
  Schedules = new ScheduleList;
  ScheduleView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#item-template').html()),
    initialize: function() {},
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });
  AppView = Backbone.View.extend({
    el: $('#scheduleApp'),
    initialize: function() {
      this.inputBegin = this.$('#new-schedule>td>input.begin');
      this.inputEnd = this.$('#new-schedule>td>input.end');
      this.inputDescription = this.$('#new-schedule>td>input.description');
      this.listenTo(Schedules, 'add', this.addOne);
      this.main = $('#main');
      return Schedules.fetch();
    },
    render: function() {},
    addOne: function(schedule) {
      var view;
      view = new ScheduleView({
        model: schedule
      });
      return this.$('#schedule-list').append(view.render().el);
    }
  });
  return App = new AppView;
})();