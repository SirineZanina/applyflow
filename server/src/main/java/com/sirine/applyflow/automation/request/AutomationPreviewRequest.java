package com.sirine.applyflow.automation.request;

import com.sirine.applyflow.validation.ValidationConstants;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AutomationPreviewRequest(
        @Size(max = ValidationConstants.SEARCH_QUERY_MAX, message = "VALIDATION.AUTOMATION.QUERY.SIZE")
        String query,

        Boolean remoteOnly,

        @Min(value = ValidationConstants.MATCH_PERCENT_MIN, message = "VALIDATION.AUTOMATION.MIN_MATCH.MIN")
        @Max(value = ValidationConstants.MATCH_PERCENT_MAX, message = "VALIDATION.AUTOMATION.MIN_MATCH.MAX")
        Integer minMatch,

        @Size(max = ValidationConstants.ROLE_TYPES_MAX, message = "VALIDATION.AUTOMATION.ROLE_TYPES.SIZE")
        List<@Size(max = ValidationConstants.JOB_TITLE_MAX, message = "VALIDATION.AUTOMATION.ROLE_TYPE.SIZE") String> roleTypes,

        @Min(value = ValidationConstants.AUTOMATION_LIMIT_MIN, message = "VALIDATION.AUTOMATION.LIMIT.MIN")
        @Max(value = ValidationConstants.AUTOMATION_LIMIT_MAX, message = "VALIDATION.AUTOMATION.LIMIT.MAX")
        Integer limit
) {}
