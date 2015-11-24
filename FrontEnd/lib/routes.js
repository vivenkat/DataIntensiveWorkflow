Router.route('/', function() {
  this.render('mainpage');
});

Router.route('/query', function () {
  this.render('querypage');
});