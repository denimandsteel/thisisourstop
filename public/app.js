var tios = {
  app: {},
  Router: {},
  Views: {}
};
tios.Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    'about': 'about',
    'how': 'how'
  },
  index: function() {
    console.log('index');
    tios.Index.$el.show();
    tios.About.$el.hide();
    tios.How.$el.hide();
    window.scrollTo(0,0); // Eugh.
  },
  about: function() {
    console.log('about');
    tios.Index.$el.hide();
    tios.About.$el.show();
    tios.How.$el.hide();
    window.scrollTo(0,0);
  },
  how: function () {
    console.log('how');
    tios.Index.$el.hide();
    tios.About.$el.hide();
    tios.How.$el.show();
    window.scrollTo(0,0);
  }
});

tios.Views.Index = Backbone.View.extend({
  el: $('#index'),
  events: {
    'click #about-link': 'about',
    'click #how-link': 'how',
    'click #stop-dividers #fg': 'focus',
    'keyup #stop': 'autosubmit'
  },
  initialize: function() {
    var that = this;
    that.$('#stop-go').hide();

    var recent = JSON.parse($.cookie('recent')) || [];
    $.each(recent, function(index, stop) {
      var classes = '';
      if (index === 0) {
        classes += ' first';
      }
      if (index === recent.length - 1) {
        classes += ' last';
      }
      var html = '<a class="stop' + classes + '" href="/stop/' + stop.stop_id + '"><span class="stop_id">' + stop.stop_id + '</span><span class="minor">' + stop.stop_desc + '</span></a>';
      that.$('#recent').append(html);
    });
  },
  about: function() {
    tios.app.navigate('about', true);
    return false;
  },
  how: function() {
    tios.app.navigate('how', true);
    return false;
  },
  focus: function() {
    this.$('#stop').focus();
  },
  autosubmit: function(event) {
    if (this.$('#stop').val().length >= 5) {
      this.$('#stop-form').submit();
      this.$('#stop').unbind(); // Submit as soons as done.
    }
  }
});
tios.Index = new tios.Views.Index();

tios.Views.About = Backbone.View.extend({
  el: $('#about'),
  events: {
    'click .home-link': 'home',
  },
  home: function() {
    tios.app.navigate('', true);
    return false;
  }
});
tios.About = new tios.Views.About();

tios.Views.How = Backbone.View.extend({
  el: $('#how'),
  events: {
    'click .home-link': 'home',
  },
  home: function() {
    tios.app.navigate('', true);
    return false;
  }
});
tios.How = new tios.Views.How();

tios.Views.Header = Backbone.View.extend({
  el: $('header'),
  events: {
    'click .home-link': 'home',
  },
  home: function() {
    tios.app.navigate('', true);
    return false;
  }
});
tios.Header = new tios.Views.Header();

tios.app = new tios.Router();
Backbone.history.start({pushState: true});
