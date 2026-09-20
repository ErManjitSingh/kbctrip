<?php
/**
 * Legacy Unotrips hotels PHP proxy — disabled.
 * Guest MVP uses KBC booking API (NEXT_PUBLIC_KBC_BOOKING_API_URL).
 */
http_response_code(410);
header('Content-Type: application/json');
echo json_encode([
  'message' => 'Unotrips hotels proxy is disabled. Use the KBC booking API.',
  'status' => 410,
  'data' => null,
]);
