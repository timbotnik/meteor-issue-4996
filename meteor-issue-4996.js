
if (Meteor.isServer) {
  Meteor.publish('randomData', function() {
    var self = this;
    _.times(30, function() {
      self.added('randomData', Random.id(), {value: Math.round((Math.random() * 100))});
    });
    return self.ready();
  });
}

if (Meteor.isClient) {
  RandomData = new Mongo.Collection('randomData');
  Template.repro.onCreated(function() {
    var self = this;
    self.sortedData = [];
    self.subHandle = self.subscribe('randomData');
    self.autorun(function() {
      if (self.subHandle.ready()) {
        RandomData.find({}, {sort: {value: -1}, limit: 5}).observe({
          // we *SHOULD* use addedAt here, but the console error says to use addedBefore
          added: function(doc) {
          // addedBefore: function(doc) { // addedBefore prints the same error msg as above
          // addedAt: function(doc) { // this works as desired
            self.sortedData.push(doc);
          }
        });
      }
    });
  });

  Template.repro.onDestroyed(function() {
    var self = this;
    self.subHandle.stop();
  });

  Template.repro.helpers({
    sortedData: function() {
      if (Template.instance().subHandle.ready()) {
        return Template.instance().sortedData;
      }
      return [];
    }
  });
}
