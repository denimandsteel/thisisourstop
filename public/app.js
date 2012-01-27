var tios = {
  Router: {},
  Routes: {},
  Views: {}
};

tios.Routes = Backbone.Router.extend({
  routes: {
    '': 'index',
    '/': 'index',
    '/about': 'about',
    '/how': 'how'
  },
  index: function() {
    tios.Index.el.show();
    tios.About.el.hide();
    tios.How.el.hide();
    window.scrollTo(0,0);
  },
  about: function() {
    tios.Index.el.hide();
    tios.About.el.show();
    tios.How.el.hide();
    window.scrollTo(0,0);
  },
  how: function () {
    tios.Index.el.hide();
    tios.About.el.hide();
    tios.How.el.show();
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
    this.$('#stop-go').hide();

    var recent = JSON.parse($.cookie('recent'));
    $.each(recent, function(index, stop) {
      var classes = '';
      if (index === 0) {
        classes += ' first';
      }
      if (index === recent.length - 1) {
        classes += ' last';
      }
      var html = '<a class="stop' + classes + '" href="/stop/' + stop.stop_id + '">' + stop.stop_id + ' - <span class="minor">' + stop.stop_desc + '</span></a>';
      $('#recent').append(html);
    });
  },
  about: function() {
    tios.Router.navigate('/about', true);
    return false;
  },
  how: function() {
    tios.Router.navigate('/how', true);
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
    tios.Router.navigate('/', true);
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
    tios.Router.navigate('/', true);
    return false;
  }
});
tios.How = new tios.Views.How();

tios.Router = new tios.Routes();
Backbone.history.start({pushState: true});
