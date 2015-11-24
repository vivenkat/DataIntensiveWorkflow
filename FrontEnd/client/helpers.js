Template.registerHelper('activeCheck', function(a) {
    return Router.current().route.getName() == a ? 'active' : '';
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
});