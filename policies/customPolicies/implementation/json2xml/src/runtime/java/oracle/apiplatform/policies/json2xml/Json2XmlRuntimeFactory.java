package oracle.apiplatform.policies.json2xml;

import org.json.JSONObject;

import oracle.apiplatform.policies.sdk.runtime.PolicyRuntime;
import oracle.apiplatform.policies.sdk.runtime.PolicyRuntimeFactory;
import oracle.apiplatform.policies.sdk.runtime.PolicyRuntimeInitContext;

/**
 * 
 * @author riferrei
 * 
 */
public class Json2XmlRuntimeFactory implements PolicyRuntimeFactory {
	
	@Override
	public PolicyRuntime getRuntime(PolicyRuntimeInitContext initContext,
			JSONObject policyConfig) throws Exception {
		
		return new Json2XmlRuntime(initContext, policyConfig);

	}

}