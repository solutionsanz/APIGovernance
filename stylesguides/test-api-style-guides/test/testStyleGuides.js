var expect = require('chai').expect;

var styleGuide = require('../style-assertions.js');

describe("API Style Guide Rules", function(){
	describe("URI Validation Rules", function(){
		describe("Basic URI parsing functionality", function(){
			it("should break up a path into ordered components", function(){
				var testURI = "/path1/path2/path3";
				var parsedURI = styleGuide._parseURI(testURI);
				expect(parsedURI.path).to.have.length(3);
				expect(parsedURI.path[0].segment).to.equal("path1");
				expect(parsedURI.path[1].segment).to.equal("path2");
				expect(parsedURI.path[2].segment).to.equal("path3");
			});

			it("should correctly identify URI parameters", function(){
				var testURI = "/path1/{var1}";
				var parsedURI = styleGuide._parseURI(testURI);
				expect(parsedURI.path).to.have.length(2);
				expect(parsedURI.path[0].segment).to.equal("path1");
				expect(parsedURI.path[0].param).to.equal(false);
				expect(parsedURI.path[1].segment).to.equal("{var1}");
				expect(parsedURI.path[1].param).to.equal(true);
			});

			it("should break a uri into path and query components", function(){
				var testURI = "/path1?{var1}";
				var parsedURI = styleGuide._parseURI(testURI);
				expect(parsedURI.path).to.have.length(1);
				expect(parsedURI.path[0].segment).to.equal("path1");
				expect(parsedURI.query).to.have.length(1);
				expect(parsedURI.query[0].variable).to.equal("{var1}");
			})
		});

		describe("Collections are plurals", function(){
			it("should identify collections when a uri contains an entry followed by a URI parameter", function(){
				var testURI = "/path1/{var1}/path2";
				var parsedURI = styleGuide._parseURI(testURI);
				expect(styleGuide._isCollection(parsedURI, 0)).to.equal(true);
				expect(styleGuide._isCollection(parsedURI, 1)).to.equal(false);
				expect(styleGuide._isCollection(parsedURI, 2)).to.equal(false);
			})
			it("should return true if the URI collection name is a plural", function(){
				var testURI = "/paths/{pathId}/path2";
				var result = styleGuide.validateURICollectionsArePlural(testURI);
				expect(result).to.equal(true);
			});
			it("should return the offending URI when the collection name doesn't end with an 's'", function(){
				var testURI = "/pathsection/{pathId}/path2";
				var result = styleGuide.validateURICollectionsArePlural(testURI);
				expect(result).to.equal("'pathsection' appears to be a Collection, but it is not a plural.");
			});
		});

		describe("URI Parameters are camel case", function(){
			it("should return true if URI contains no parameters", function(){
				var testURI = "/path1/path2/path3";
				var result = styleGuide.validateURIVariablesAreCamelCase(testURI);
				expect(result).to.equal(true);
			});
			it("should return true if all URI parameters are camel case", function(){
				var testURI = "/path1/{pathId}/{secondVariableWithManyWords}/{other}";
				var result = styleGuide.validateURIVariablesAreCamelCase(testURI);
				expect(result).to.equal(true);
			});
			it("should return the offending URI parameter when it is not camel case", function(){
				var testURI = "/path1/{this-should-be-camel}";
				var result = styleGuide.validateURIVariablesAreCamelCase(testURI);
				expect(result).to.equal("URI Parameter 'this-should-be-camel' is not camel case.");
			});
		});
	});

	describe("Body Validation Rules", function(){
		describe("Request Body only on appropriate methods", function(){
			it("should return true when not sent a body on a GET", function(){
				var action = {
				  "content": [
				    {
				      "element": "httpTransaction",
				      "content": [
				        {
				          "element": "httpRequest",
				          "attributes": {
				            "method": {
				              "content": "GET"
				            }
				          },
				          "content": []
				        }
				      ]
				    }
				  ]
				};

				var result = styleGuide.validateRequestBodyForMethod(action);
				expect(result).to.equal(true);
			});
			it("should return true when sending a body on a POST", function(){
				var action = {
				  "content": [
				    {
				      "element": "httpTransaction",
				      "content": [
				        {
				          "element": "httpRequest",
				          "attributes": {
				            "method": {
				              "content": "POST"
				            }
				          },
				          "content": [
				            {
				              "element": "asset",
				              "meta": {
				                "classes": [
				                  "messageBody"
				                ]
				              }
				            }
				          ]
				        }
				      ]
				    }
				  ]
				};
				var result = styleGuide.validateRequestBodyForMethod(action);
				expect(result).to.equal(true);
			});
			it("should return the offending method when sending a body on a DELETE", function(){
				var action = {
				  "content": [
				    {
				      "element": "httpTransaction",
				      "content": [
				        {
				          "element": "httpRequest",
				          "attributes": {
				            "method": {
				              "content": "DELETE"
				            }
				          },
				          "content": [
				            {
				              "element": "asset",
				              "meta": {
				                "classes": [
				                  "messageBody"
				                ]
				              }
				            }
				          ]
				        }
				      ]
				    }
				  ]
				};
				var result = styleGuide.validateRequestBodyForMethod(action);
				expect(result).to.equal("Request body should not be sent used for DELETE requests.");
			});
		});

		describe("Attributes in JSON bodies are camel case.", function(){
			it("should return true when body is not a JSON", function(){
				var data = "<xml>This is XML</xml>";
				var result = styleGuide.validateBodyAttributesAreCamelCase(data);
				expect(result).to.equal(true);
			});
			it("should return true when all of the attributes are camel case", function(){
				var data = JSON.stringify({
					"variable":"value",
					"camelVariable":"different value",
					"lotsOfWordsInThisOne":6
				});
				var result = styleGuide.validateBodyAttributesAreCamelCase(data);
				expect(result).to.equal(true);
			});
			it("should return the offending attribute when it is not camel case", function(){
				var data = JSON.stringify({
					"variable":"value",
					"camelVariable":"different value",
					"ObjectName":6
				});
				var result = styleGuide.validateBodyAttributesAreCamelCase(data);
				expect(result).to.equal("Body attribute 'ObjectName' is not camel case");
			});
			it("should recurse into nested objects testing camel case", function(){
				var data = JSON.stringify({
					"variable":{
						"test":true,
						"testCamel":true,
						"nestedObject":{
							"ObjectName":"value"
						}
					},
					"camelVariable":"different value"
				});
				var result = styleGuide.validateBodyAttributesAreCamelCase(data);
				expect(result).to.equal("Body attribute 'ObjectName' is not camel case");
			});
			it("should look at elements provided as an array", function(){
				var data = JSON.stringify([
						{
							"array":"Of Objects"
						},
						{
							"subArray":[{"ObjectName":"not camel"}]
						}
					]);
				var result = styleGuide.validateBodyAttributesAreCamelCase(data);
				expect(result).to.equal("Body attribute 'ObjectName' is not camel case");
			});
		});
	});
});