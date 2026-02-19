-- Initialize system_settings with default values if not exists
-- Run this file if you experience issues with system settings

INSERT INTO system_settings (id, maintenanceMode, maintenanceMessage, enableUserRegistration, enableBreedingRequests, enableMessaging, maxWarningsBeforeBan, autoDeleteReportsAfter, createdAt, updatedAt)
SELECT 
  'system-settings-default',
  FALSE,
  NULL,
  TRUE,
  TRUE,
  TRUE,
  3,
  90,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE id = 'system-settings-default');

-- Verify
SELECT * FROM system_settings;
