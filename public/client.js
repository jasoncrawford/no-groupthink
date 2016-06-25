window.App = window.App || {};

(function (App) {
  App.Model = Backbone.Model.extend({idAttribute: '_id'});
  App.View = Backbone.View;

  App.Poll = App.Model.extend({
    urlRoot: '/polls',
    defaults: {
      options: []
    }
  });
  
  App.PollController = App.View.extend({
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
      this.render();
    },
    
    render: function () {
      var list = this.$('.options-list');
      list.empty();
      this.model.get('options').forEach(function (option) {
        list.append('<li>' + option + '</li>');
      });
    },
    
    events: {
      'submit .add-option-form': function (event) {
        event.preventDefault();
        var input = $('.option-input');
        var option = input.val();
        input.val('');
        this.model.get('options').push(option);
        this.model.trigger('change');
        this.model.save();
      }
    }
  });
}(App));
