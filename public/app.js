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
    console.log('index');
    tios.Index.el.show();
    tios.About.el.hide();
    tios.How.el.hide();
    window.scrollTo(0,0);
  },
  about: function() {
    console.log('about');
    tios.Index.el.hide();
    tios.About.el.show();
    tios.How.el.hide();
    window.scrollTo(0,0);
  },
  how: function () {
    console.log('how');
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
    'click #how-link': 'how'
  },
  about: function() {
    tios.Router.navigate('/about', true);
    return false;
  },
  how: function() {
    tios.Router.navigate('/how', true);
    return false;
  }
});
tios.Index = new tios.Views.Index();

tios.Views.About = Backbone.View.extend({
  el: $('#about'),
  events: {
    'click #home-link': 'home',
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
