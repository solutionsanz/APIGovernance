package oracle.apiplatform.policies.json2xml;

import java.util.List;

import org.json.JSONObject;

import oracle.apiplatform.policies.sdk.validation.AbstractPolicyValidator;
import oracle.apiplatform.policies.sdk.validation.Diagnostic;

/**
 * 
 * @author riferrei
 * 
 */
public class Json2XmlValidator extends AbstractPolicyValidator implements Json2XmlConstants {
	
	@Override
	public void validateSyntax(JSONObject config, Context context) {
	}

	@Override
	public void validateSemantics(JSONObject policyConfig, Context context,
			List<Diagnostic> diagnostics) {
		
	}

}