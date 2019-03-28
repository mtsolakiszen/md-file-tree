#!/usr/bin/env node
'use strict';

(function(){
  var tree = require('./walker');
  var dirPath = process.cwd();
  var dir = dirPath.split('/').pop();
  var indentation = 0;

  var output = '- __' + dir + '__\n';

  var addIndentation = function(){
    return new Array((indentation*2)+1).join(' ');
  };

  var parseResult = function(result){
    indentation++;
    var outputs = []
    var fileOutputs = [];
    var dirOutputs = [];
    for (var i in result) {
      if (typeof result[i] === 'string' && i[0] !== '.') {
        fileOutputs.push(addIndentation() + '- [' + i + '](' + dir + result[i] + ')\n');
      } else if (typeof result[i] === 'object'){
        dirOutputs.push(addIndentation() + '- __' + i + '__\n')


        outputs.push({ [addIndentation() + '- __' + i + '__\n']: parseResult(result[i])});
        indentation--;
      }
    }
    fileOutputs.sort((a, b) => a.toLowerCase() > b.toLowerCase());
    var count = fileOutputs.length;
    for (var j = 0; j < count; j++) {
      outputs.push(fileOutputs.pop());
    }

    return outputs;
  };
  tree(dirPath, function(err, result){
    var res = parseResult(result);

    var sortFn = (a, b) => {
      if(typeof(a) === 'object' && typeof(b) !== 'object') {
        return true;
      };
      if(typeof(b) === 'object' && typeof(a) !== 'object') {
        return false;
      };
      if(typeof(a) !== 'object' && typeof(b) !== 'object') {
        return a.toLowerCase() > b.toLowerCase();
      }
      var first = Object.keys(a)[0].toLowerCase();
      var second = Object.keys(b)[0].toLowerCase();
      return first > second;
    }

    function sortResult(arrayOfResults) {
      var newRes = [];
      for(var i in arrayOfResults) {
        if(typeof(arrayOfResults[i]) === 'object') {
          var key = Object.keys(arrayOfResults[i])[0];
          newRes.push({ [key]: sortResult(arrayOfResults[i][key]).sort(sortFn) })
        }
        else {
          newRes.push(arrayOfResults[i]);
        }
      }
      return newRes.sort(sortFn);
    }

    var finalRes = sortResult(res).sort(sortFn);

    function addToOutput(arrayOfResults) {
      for(var i in arrayOfResults) {
        if(typeof(arrayOfResults[i]) === 'object') {
          var key = Object.keys(arrayOfResults[i])[0];
          output += key;
          addToOutput(arrayOfResults[i][key]);
        }
        else {
          output += arrayOfResults[i];
        }
      }
    }
    addToOutput(finalRes);
    console.log(output);
  });

})();
