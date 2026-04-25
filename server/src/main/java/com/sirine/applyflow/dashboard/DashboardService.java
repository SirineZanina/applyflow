package com.sirine.applyflow.dashboard;

import com.sirine.applyflow.dashboard.response.DashboardSummaryResponse;

public interface DashboardService {

    DashboardSummaryResponse getSummary(String userId);
}
