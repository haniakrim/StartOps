## 2025-05-15 - Weak HTML stripping in CSV validation
**Vulnerability:** Simple regex-based HTML stripping (`/<[^>]*>/g`) was used to sanitize CSV data, which failed to remove content within script/style tags and was easily bypassed by malformed or mixed-case tags.
**Learning:** Generic regex for HTML stripping is insufficient for security. Content inside sensitive tags (like `<script>`) must be explicitly removed along with the tags themselves.
**Prevention:** Use a multi-stage replacement that first targets tags containing executable or sensitive content (script, style, etc.) and then removes all remaining tags.
