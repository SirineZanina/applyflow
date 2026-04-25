package com.sirine.applyflow.automation;

import com.sirine.applyflow.automation.request.AutomationLaunchRequest;
import com.sirine.applyflow.automation.request.AutomationPreviewRequest;
import com.sirine.applyflow.automation.response.AutomationLaunchResponse;
import com.sirine.applyflow.automation.response.AutomationPreviewResponse;

public interface AutomationService {

    AutomationPreviewResponse preview(String userId, AutomationPreviewRequest request);

    AutomationLaunchResponse launch(String userId, AutomationLaunchRequest request);
}
