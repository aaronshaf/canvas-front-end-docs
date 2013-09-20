var jsdom = require('jsdom');
var fs = require('fs');
var RSVP = require('rsvp');

// var url = 'https://canvas.beta.instructure.com/doc/api/modules.html';
var url = 'https://canvas.beta.instructure.com/doc/api/';

var promises = [];
var data = {
  resources: []
};

jsdom.env(url,["http://code.jquery.com/jquery.js"],function (errors, window) {
  $ = window.$;
  $('#sidebar > nav > a').each(function() {
    var href = $(this).attr('href');
    if(href.indexOf('file.') === 0 || href === 'all_resources.html') return;
    var resource = $(this).text();
    promises.push(processFile(resource,url + href));
  });

  RSVP.all(promises).then(function() {
    var file = 'data/api.json';
    fs.writeFile(file,JSON.stringify(data,null,2));
    console.log(file + ' written.');
    console.log('Finished.');
  });
});


function processFile(resource_name,url) {
  return new RSVP.Promise(function(resolve, reject) {
    jsdom.env(url,["http://code.jquery.com/jquery.js"],function (errors, window) {
      $ = window.$;

      var resource = {
        name: resource_name,
        services: []
      };

      $('#Services .method_details').each(function(test) {
        var service = {
          arguments: []
        };
        service.description = $(this).find('h2 > a').text().trim();
        service.method = $(this).find('h3.endpoint').text().trim().split(' ')[0];
        service.endpoint = $(this).find('h3.endpoint').text().trim().split(' ')[1];
        $(this).find('> .argument > li').each(function() {
          argument = {
            // possible_values: []
          };
          argument.name = $(this).find('.name').text().trim();

          try {
            argument.type = $(this).find('> .inline > dl.label-list > dt')[0]._childNodes[0].nodeValue.trim();
          } catch(error) {}
          
          try {
            argument.description = $(this).find('> .inline > dl.label-list dd').text().trim();
          } catch(error) {}

          service.arguments.push(argument);
        });
        resource.services.push(service);
      });
      console.log('Imported ' + resource_name + ' (' + url + ')');
      data.resources.push(resource);
      resolve();
    });
  });
}
