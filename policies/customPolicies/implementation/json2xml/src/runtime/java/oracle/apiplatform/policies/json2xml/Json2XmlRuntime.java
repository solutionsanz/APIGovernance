package oracle.apiplatform.policies.json2xml;

import java.net.HttpURLConnection;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.XML;

import oracle.apiplatform.policies.sdk.context.ApiRuntimeContext;
import oracle.apiplatform.policies.sdk.context.StringBodyImpl;
import oracle.apiplatform.policies.sdk.exceptions.PolicyProcessingException;
import oracle.apiplatform.policies.sdk.runtime.PolicyRuntime;
import oracle.apiplatform.policies.sdk.runtime.PolicyRuntimeInitContext;

/**
 * 
 * @author riferrei
 * 
 */
public class Json2XmlRuntime implements PolicyRuntime, Json2XmlConstants {
	
	private static final Logger log = LogManager.getLogger(Json2XmlRuntime.class);
	
	private String inputDocument;

	public Json2XmlRuntime(PolicyRuntimeInitContext initContext,
			JSONObject policyConfig) {
		
		try {
			
			inputDocument = checkArray(policyConfig.get(INPUT_DOCUM));
			
		} catch (Exception ex) {
			
			if (log.isDebugEnabled()) {
				
				log.debug("Failure during the instantiation of the policy: " + ex.getMessage());
				
			}
			
			throw new IllegalArgumentException(ex);
			
		}
		
	}

	@Override
	public boolean execute(ApiRuntimeContext apiRuntimeContext) throws PolicyProcessingException {
		
		String contentType = null;
		String xmlPayload = null;
		boolean successExecution = false;
		String inputDocString = null;
		JSONObject jsonObject = null;
		StringBodyImpl newBody = null;
		
		try {
			
			if (inputDocument.equals(API_REQUEST_OPTION)) {
				
				try {
					
					inputDocString = apiRuntimeContext.getApiRequest().getBody().asString();
					
				} catch (Exception ex) {}
				
			} else if (inputDocument.equals(SVC_REQUEST_OPTION)) {
				
				try {
					
					inputDocString = apiRuntimeContext.getServiceRequest().getBody().asString();
					
				} catch (Exception ex) {}
				
			} else {
				
				if (!apiRuntimeContext.isRequest()) {
					
					if (inputDocument.equals(API_RESPONSE_OPTION)) {
						
						try {
							
							inputDocString = apiRuntimeContext.getApiResponse().getBody().asString();
							
						} catch (Exception ex) {}
						
					} else if (inputDocument.equals(SVC_RESPONSE_OPTION)) {
						
						try {
							
							inputDocString = apiRuntimeContext.getServiceResponse().getBody().asString();
							
						} catch (Exception ex) {}
						
					}
					
				} else {
					
					if (log.isDebugEnabled()) {
						
						log.debug("Trying to access response objects during request. An NPE will be thrown...");
						
					}
					
				}
				
			}
			
			jsonObject = new JSONObject(inputDocString);
			xmlPayload = XML.toString(jsonObject);
			
			contentType = TEXT_XML_MIME_TYPE;
			newBody = new StringBodyImpl(xmlPayload, contentType);
			
			if (apiRuntimeContext.isRequest()) {
				
				apiRuntimeContext.getServiceRequest().setHeader(CONTENT_TYPE_HEADER, contentType);
				apiRuntimeContext.getServiceRequest().setBody(newBody);
				
			} else {
				
				apiRuntimeContext.getApiResponse().setHeader(CONTENT_TYPE_HEADER, contentType);
				apiRuntimeContext.getApiResponse().setBody(newBody);
				
			}
			
			successExecution = true;
			
		} catch (Exception ex) {
			
			throw new PolicyProcessingException(EXECUTION_FAILURE,
					HttpURLConnection.HTTP_INTERNAL_ERROR, ex.getMessage());
			
		}

		return successExecution;

	}
	
	private String checkArray(Object value) {
		
		if (value instanceof JSONArray) {
			
			return ((JSONArray) value).getString(0);
			
		}
		
		if (value instanceof JSONObject ||
				value instanceof String) {
			
			return value.toString();
			
		}
		
		return null;
		
	}
	
}