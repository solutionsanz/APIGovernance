
/*
 ****** Handlers for URI validation ******
 */

/*
Validates that collections in a URI are plural
@targets: Resource_URI_Template
 */
function validateURICollectionsArePlural(data){
  if (!data) {
    return false;
  }
  var parsedURI = _parseURI(data);
  for(var i=0; i<parsedURI.path.length; i++){
    if(_isCollection(parsedURI, i) && !parsedURI.path[i].segment.match(/s$/)){
      return "'" +parsedURI.path[i].segment +"' appears to be a Collection, but it is not a plural.";
    }
  }
  return true;
}

/*
Validate that URI variables are camelCase
@targets: Resource_URI_Template
 */
function validateURIVariablesAreCamelCase(data){
  if (!data) {
    return false;
  }
  var parsedURI = _parseURI(data);
  for(var i=0; i<parsedURI.path.length; i++){
    if(parsedURI.path[i].param && !_isCamelCase(parsedURI.path[i].segment.replace(/{|}/g, ""))){
      return "URI Parameter '" +parsedURI.path[i].segment.replace(/{|}/g, "") +"' is not camel case."
    }
  }
  return true;
}

/*
 ****** Handlers for Body validation ******
 */

/*
Validate that bodies are not expected on unexpected HTTP methods
@targets: Action
 */
function validateRequestBodyForMethod(data){
  const validMethodsWithBody = ["POST", "PUT", "PATCH"];
  for(var transaction of data.content || []){
    if(transaction.element === "httpTransaction"){
      for(var httpTransaction of transaction.content){
        if(httpTransaction.element && httpTransaction.element === "httpRequest"){
          var method = httpTransaction.attributes.method.content;
          for(var asset of httpTransaction.content){
            if(asset.meta && asset.meta.classes && 
               asset.meta.classes.includes("messageBody") &&
               !validMethodsWithBody.includes(method.toUpperCase())){
              return "Request body should not be sent used for " +method.toUpperCase() +" requests.";
            }
          }
        }
      }
    }
  }
  return true;
}

/*
Validate that body attributes are appropiately camel cased
@targets: Request_Body, Response_Body
 */
function validateBodyAttributesAreCamelCase(data){
  if ((data == null) || data === "") {
    return true;
  }
  try {
    data = JSON.parse(data);
  } catch (error) {
    e = error;
    return true;
  }
  if (typeof data !== 'object') {
    return true;
  }
  var res = _validateAttributesCamelCase(data);
  if(res !== true){
    return "Body attribute '" +res +"' is not camel case";
  }
  return true;
}

/*
 ****** Utility functions ******
 */

/*
 * Break a URI up into components, flagging parameters
 */
function _parseURI(uri){
  //Split into query and path (this ignores hash fragments and silly formatting which is technically
  //allowed by the spec for query parameters, such as /path{?var,var2} instead of /path?{var}&{var2} )
  var components = uri.split("?");
  var pathSections = components[0].startsWith("/") ? components[0].substring(1).split("/") : components[0].split("/");
  var querySections = (components.length > 1 ? components[1] : "").split("&");
  var uriInfo = {path: [], query: []};
  for(var i=0; i<pathSections.length; i++){
    uriInfo.path.push({segment:pathSections[i], param:pathSections[i].startsWith("{")});
  }
  for(var j=0; j<querySections.length; j++){
    uriInfo.query.push({variable:querySections[j]});
  }
  return uriInfo;
}

function _isCamelCase(str){
  return str.match(/^[a-z]+(?:[A-Z][a-z]+)*$/);
}


/*
 * We will consider a URI element a collection if it is a literal followed by a URI param
 * i.e. /paths/{pathId}
 */
function _isCollection(parsedURI, index){
  if(parsedURI.path.length <= index+1){
    return false;
  }
  if(!parsedURI.path[index].param && parsedURI.path[index+1].param){
    return true;
  }
  return false;
}

/*
 * Seperate utility function so that we can recurse through nexted objects
 */
function _validateAttributesCamelCase(object){
  for(var attr in object){
    if(Array.isArray(object) && typeof object[attr] === 'object'){
      var res = _validateAttributesCamelCase(object[attr]);
      if(res !== true){
        return res;
      }
    }else {
      if(!_isCamelCase(attr)){
        return attr;
      }
      if(typeof object[attr] === 'object'){
        var res = _validateAttributesCamelCase(object[attr]);
        if(res !== true){
          return res;
        }
      }
    }
  }
  return true;
}

//Export of the functions for unit testing
module.exports = {
  _parseURI: _parseURI,
  _isCollection: _isCollection,
  validateURICollectionsArePlural: validateURICollectionsArePlural,
  validateURIVariablesAreCamelCase: validateURIVariablesAreCamelCase,
  validateRequestBodyForMethod: validateRequestBodyForMethod,
  validateBodyAttributesAreCamelCase: validateBodyAttributesAreCamelCase
};