package com.sirine.applyflow.ingestion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdzunaClient {

    private static final String BASE_URL = "https://api.adzuna.com/v1/api/jobs/%s/search/1";
    private static final HttpClient HTTP = HttpClient.newHttpClient();

    private final AdzunaProperties props;
    private final ObjectMapper objectMapper;

    public List<AdzunaJob> search(final String role, final String location) {
        final String url = BASE_URL.formatted(props.getCountry())
                + "?app_id=" + encode(props.getAppId())
                + "&app_key=" + encode(props.getApiKey())
                + "&what=" + encode(role)
                + "&where=" + encode(location)
                + "&results_per_page=" + props.getResultsPerPage()
                + "&content-type=application/json";

        try {
            final HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            final HttpResponse<String> response = HTTP.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Adzuna returned HTTP {} for role={} location={}", response.statusCode(), role, location);
                return List.of();
            }

            return parse(response.body());
        } catch (Exception e) {
            log.error("Adzuna search failed for role={} location={}", role, location, e);
            return List.of();
        }
    }

    private List<AdzunaJob> parse(final String body) {
        try {
            final JsonNode root = objectMapper.readTree(body);
            final JsonNode results = root.path("results");
            if (!results.isArray()) return List.of();

            final List<AdzunaJob> jobs = new ArrayList<>();
            for (final JsonNode node : results) {
                jobs.add(new AdzunaJob(
                        node.path("id").asText(),
                        node.path("title").asText("Untitled"),
                        node.path("company").path("display_name").asText("Unknown"),
                        node.path("location").path("display_name").asText("Remote"),
                        node.path("description").asText(""),
                        node.path("salary_min").isNull() ? null : node.path("salary_min").intValue(),
                        node.path("salary_max").isNull() ? null : node.path("salary_max").intValue(),
                        node.path("contract_type").asText(null),
                        node.path("redirect_url").asText(null),
                        node.path("created").asText(null)
                ));
            }
            return jobs;
        } catch (Exception e) {
            log.error("Failed to parse Adzuna response", e);
            return List.of();
        }
    }

    private String encode(final String value) {
        if (value == null) return "";
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
